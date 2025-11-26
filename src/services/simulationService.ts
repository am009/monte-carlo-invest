import { ParameterDefinition, SimulationConfig, SimulationResult } from '../types';

/**
 * Generates all combinations of parameters based on min, max, and step.
 */
export const generateParamCombinations = (defs: ParameterDefinition[]): Record<string, number>[] => {
  if (defs.length === 0) return [{}];

  const first = defs[0];
  const rest = defs.slice(1);
  const restCombinations = generateParamCombinations(rest);
  const combinations: Record<string, number>[] = [];

  // Handle edge case where step is 0 or invalid to avoid infinite loop
  const step = first.step <= 0 ? (first.max - first.min) || 1 : first.step;
  
  // Create a loop, being careful with floating point arithmetic
  for (let val = first.min; val <= first.max + 0.0000001; val += step) {
    // Fix floating point precision issues (e.g., 0.1 + 0.2 = 0.30000000004)
    const cleanVal = parseFloat(val.toFixed(4));
    
    for (const combo of restCombinations) {
      combinations.push({
        [first.name]: cleanVal,
        ...combo,
      });
    }
  }

  return combinations;
};

/**
 * The core simulation logic. 
 * NOTE: This function is converted to a string and injected into Web Workers.
 * It must not rely on external imports that are not available in the Worker scope.
 */
export const runSimulation = (
  paramValues: Record<string, number>,
  userFunction: Function,
  config: SimulationConfig
): SimulationResult => {
  const logWealths: number[] = [];
  const args = Object.values(paramValues);

  for (let i = 0; i < config.numExperiments; i++) {
    // We track wealth in log space: log(Wealth_t) = log(Wealth_0) + sum(log(multiplier_t))
    // Wealth_0 is 1, so log(Wealth_0) is 0.
    let currentLogWealth = 0;
    let isRuined = false;

    for (let r = 0; r < config.numRounds; r++) {
      let multiplier = 0;
      try {
        multiplier = userFunction(...args);
      } catch (e: any) {
        // Propagate runtime error to stop simulation and alert user
        throw new Error(`Runtime Error in strategy function: ${e.message}`);
      }

      if (typeof multiplier !== 'number' || isNaN(multiplier)) {
        multiplier = 0;
      }
      
      // If multiplier is <= 0, we have hit ruin (log(0) is -Infinity)
      if (multiplier <= 0) {
        isRuined = true;
        break; 
      }

      currentLogWealth += Math.log(multiplier);
    }

    if (isRuined) {
      logWealths.push(-Infinity);
    } else {
      logWealths.push(currentLogWealth);
    }
  }

  // Calculate Median Log Wealth
  // We use a custom comparator to be explicit and safe with infinities/NaNs
  logWealths.sort((a, b) => {
    if (a === b) return 0;
    return a < b ? -1 : 1;
  });
  
  const mid = Math.floor(logWealths.length / 2);
  let medianLogWealth = 0;

  if (logWealths.length % 2 !== 0) {
    medianLogWealth = logWealths[mid];
  } else {
    // If we have an even number, take average of the two middle elements.
    // If either is -Infinity, the average remains -Infinity (conceptually).
    const val1 = logWealths[mid - 1];
    const val2 = logWealths[mid];
    if (val1 === -Infinity || val2 === -Infinity) {
      medianLogWealth = -Infinity;
    } else {
      medianLogWealth = (val1 + val2) / 2;
    }
  }

  // Calculate Geometric Growth Rate per Round based on Median Terminal Wealth
  // Formula: (Terminal / Initial)^(1/Rounds) - 1
  // In Log Space: exp(log(Terminal) / Rounds) - 1
  
  let medianGrowthRate = 0;
  let medianWealth = 0;

  if (medianLogWealth === -Infinity) {
    medianGrowthRate = -1; // -100% growth (Ruin)
    medianWealth = 0;
  } else {
    medianGrowthRate = Math.exp(medianLogWealth / config.numRounds) - 1;
    // Calculate actual median wealth for display.
    // Note: This might still underflow to 0 for extremely poor performing strategies, 
    // but the growth rate calculated above will be accurate.
    medianWealth = Math.exp(medianLogWealth);
  }

  return {
    params: paramValues,
    medianTerminalWealth: medianWealth,
    medianGrowthRate: medianGrowthRate
  };
};

export const createFunctionFromScript = (scriptCode: string, paramNames: string[]): Function => {
  try {
    // Determine argument order based on paramNames
    return new Function(...paramNames, scriptCode);
  } catch (e: any) {
    throw new Error(`Syntax Error in strategy code: ${e.message}`);
  }
};

// ---------------- Multi-threading Worker Logic ----------------

/**
 * Runs simulations in parallel using Web Workers.
 */
export const runMultiThreadedSimulation = async (
    combinations: Record<string, number>[],
    code: string,
    paramNames: string[],
    config: SimulationConfig
): Promise<SimulationResult[]> => {
    
    // If no threads specified or 1, run inline (optional, but we'll stick to workers for consistency or inline if small)
    // Actually, let's always use workers if config.numThreads > 0 to keep UI responsive.
    const threadCount = config.numThreads || 1;
    
    // Split combinations into chunks
    const chunks: Record<string, number>[][] = Array.from({ length: threadCount }, () => []);
    combinations.forEach((combo, index) => {
        chunks[index % threadCount].push(combo);
    });

    // Create the worker script as a Blob
    // We inject the `runSimulation` source code directly.
    const workerScript = `
        const runSimulation = ${runSimulation.toString()};
        
        self.onmessage = function(e) {
            const { combinations, code, paramNames, config } = e.data;
            const results = [];
            
            try {
                // Recreate the user function inside the worker
                const userFunc = new Function(...paramNames, code);
                
                for (const params of combinations) {
                    const result = runSimulation(params, userFunc, config);
                    results.push(result);
                }
                
                self.postMessage({ status: 'success', results });
            } catch (err) {
                self.postMessage({ status: 'error', message: err.message });
            }
        };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);

    const promises = chunks.map((chunk, i) => {
        return new Promise<SimulationResult[]>((resolve, reject) => {
            if (chunk.length === 0) {
                resolve([]);
                return;
            }

            const worker = new Worker(workerUrl);
            
            worker.onmessage = (e) => {
                if (e.data.status === 'success') {
                    resolve(e.data.results);
                } else {
                    reject(new Error(`Worker ${i} Error: ${e.data.message}`));
                }
                worker.terminate();
            };

            worker.onerror = (e) => {
                reject(new Error(`Worker ${i} failed: ${e.message}`));
                worker.terminate();
            };

            worker.postMessage({
                combinations: chunk,
                code,
                paramNames,
                config
            });
        });
    });

    try {
        const resultsArrays = await Promise.all(promises);
        URL.revokeObjectURL(workerUrl);
        return resultsArrays.flat();
    } catch (e) {
        URL.revokeObjectURL(workerUrl);
        throw e;
    }
};