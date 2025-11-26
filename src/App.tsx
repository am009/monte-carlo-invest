import React, { useState, useRef } from 'react';
import StrategyEditor from './components/StrategyEditor';
import ParamConfig from './components/ParamConfig';
import Results from './components/Results';
import { ParameterDefinition, SimulationConfig, SimulationResult } from './types';
import { generateParamCombinations, runMultiThreadedSimulation, createFunctionFromScript } from './services/simulationService';
import { MousePointer2, AlertCircle, Globe } from 'lucide-react';
import { translations, Translation } from './locales';

const DEFAULT_CODE = `// Strategy: Kelly Criterion Coin Flip
// 50% chance to win 80%, 50% to lose 50%.
// two individual bets

// if bet2 is not specified, then it is zero. Try delete the bet2 param.
const bet2d = (typeof bet2 === 'undefined') ? 0.0 : bet2;
const winProbability = 0.5; 
const isWin1 = Math.random() < winProbability;
const isWin2 = Math.random() < winProbability;
const mul1 = isWin1 ? 0.8 : -0.5;
const mul2 = isWin2 ? 0.8 : -0.5;
// calc final return
return 1 + (mul1 * bet) + (mul2 * bet2d)`;

const App: React.FC = () => {
  // --- State ---
  // Change default to 'zh'
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const t: Translation = translations[lang];

  const [code, setCode] = useState(DEFAULT_CODE);
  const [paramNames, setParamNames] = useState<string[]>(['bet', 'bet2']);
  const [error, setError] = useState<string | null>(null);
  
  // Parameter Definitions (min, max, step for each paramName)
  const [paramDefs, setParamDefs] = useState<ParameterDefinition[]>([
    { name: 'bet', min: 0, max: 1, step: 0.1 },
    { name: 'bet2', min: 0, max: 1, step: 0.1 }
  ]);

  const [simConfig, setSimConfig] = useState<SimulationConfig>({
    numExperiments: 100,
    numRounds: 5000,
    numThreads: 1
  });

  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Refs for scrolling ---
  const configSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handleParamNamesChange = (newNames: string[]) => {
    setParamNames(newNames);
    // Sync Defs: Keep existing defs if name still exists, add new ones, remove old ones
    setParamDefs(prev => {
      const newDefs: ParameterDefinition[] = [];
      newNames.forEach(name => {
        const existing = prev.find(p => p.name === name);
        if (existing) {
          newDefs.push(existing);
        } else {
          newDefs.push({ name, min: 0, max: 1, step: 0.1 });
        }
      });
      return newDefs;
    });
  };

  const handleNextToConfig = () => {
    configSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleParamDefChange = (index: number, field: keyof ParameterDefinition, value: number) => {
    const newDefs = [...paramDefs];
    // @ts-ignore - dynamic key access
    newDefs[index][field] = value;
    setParamDefs(newDefs);
  };

  const handleSimConfigChange = (field: keyof SimulationConfig, value: number) => {
    setSimConfig(prev => ({ ...prev, [field]: value }));
  };

  const runSimulationHandler = async () => {
    setIsProcessing(true);
    setResults([]);
    setError(null);

    // Brief timeout to allow UI to render the loading state
    setTimeout(async () => {
        try {
            // Validate syntax before spinning up workers
            try {
               createFunctionFromScript(code, paramNames);
            } catch (e: any) {
               setError(e.message);
               setIsProcessing(false);
               return;
            }

            const combinations = generateParamCombinations(paramDefs);
            
            // Safety check for massive combinations
            if (combinations.length > 50000) {
                const message = t.app.confirmBig.replace('{count}', combinations.length.toString());
                const proceed = window.confirm(message);
                if (!proceed) {
                    setIsProcessing(false);
                    return;
                }
            }

            // Run using Web Workers
            const newResults = await runMultiThreadedSimulation(combinations, code, paramNames, simConfig);

            setResults(newResults);
            
            // Scroll to results
            setTimeout(() => {
                resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (error: any) {
            console.error(error);
            setError(error.message || t.app.errorGeneric);
        } finally {
            setIsProcessing(false);
        }
    }, 100);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-indigo-600 p-2 rounded-lg">
                <MousePointer2 className="text-white w-5 h-5" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">
               {t.app.title}
             </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-sm text-slate-500 hidden md:block">
               {t.app.subtitle}
             </div>
             <button 
               onClick={toggleLanguage}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium transition-colors"
             >
               <Globe className="w-4 h-4" />
               <span>{lang === 'en' ? '中文' : 'English'}</span>
             </button>
          </div>
        </div>
      </header>

      <main className="space-y-12 pt-8 px-4">
        {/* Section 1: Strategy */}
        <section>
          <StrategyEditor 
            code={code}
            paramNames={paramNames}
            onCodeChange={setCode}
            onParamNamesChange={handleParamNamesChange}
            onNext={handleNextToConfig}
            texts={t.strategy}
          />
        </section>

        {/* Section 2: Config */}
        <section ref={configSectionRef} className="scroll-mt-24">
          <ParamConfig 
            paramNames={paramNames}
            paramDefs={paramDefs}
            simConfig={simConfig}
            onParamDefChange={handleParamDefChange}
            onSimConfigChange={handleSimConfigChange}
            onRun={runSimulationHandler}
            isRunning={isProcessing}
            texts={t.config}
            appTexts={t.app}
          />
        </section>

        {/* Section 3: Results */}
        <section ref={resultsSectionRef} className="scroll-mt-24">
          {error && (
            <div className="w-full max-w-5xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
               <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
               <div>
                 <h3 className="font-bold">{t.app.errorTitle}</h3>
                 <p className="text-sm mt-1">{error}</p>
               </div>
            </div>
          )}
          
          {(results.length > 0 || error) && (
            <Results results={results} paramDefs={paramDefs} texts={t.results} />
          )}
        </section>
      </main>
    </div>
  );
};

export default App;