import React from 'react';
import { ParameterDefinition, SimulationConfig } from '../types';
import { Settings, Activity, Cpu } from 'lucide-react';
import { Translation } from '../locales';

interface ParamConfigProps {
  paramNames: string[];
  paramDefs: ParameterDefinition[];
  simConfig: SimulationConfig;
  onParamDefChange: (index: number, field: keyof ParameterDefinition, value: number) => void;
  onSimConfigChange: (field: keyof SimulationConfig, value: number) => void;
  onRun: () => void;
  isRunning: boolean;
  texts: Translation['config'];
  appTexts: Translation['app']; // for processing text
}

const ParamConfig: React.FC<ParamConfigProps> = ({
  paramNames,
  paramDefs,
  simConfig,
  onParamDefChange,
  onSimConfigChange,
  onRun,
  isRunning,
  texts,
  appTexts
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <Settings className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-slate-800">{texts.title}</h2>
      </div>

      {/* Global Settings */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{texts.simSettings}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Cpu className="w-4 h-4 text-slate-500" />
              {texts.threads}
            </label>
            <p className="text-xs text-slate-400 mb-3">{texts.threadsDesc}</p>
            <input
              type="number"
              min="1"
              max="32"
              value={simConfig.numThreads}
              onChange={(e) => onSimConfigChange('numThreads', Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1">{texts.expPerParam}</label>
            <p className="text-xs text-slate-400 mb-3">{texts.expPerParamDesc}</p>
            <input
              type="number"
              value={simConfig.numExperiments}
              onChange={(e) => onSimConfigChange('numExperiments', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1">{texts.rounds}</label>
            <p className="text-xs text-slate-400 mb-3">{texts.roundsDesc}</p>
            <input
              type="number"
              value={simConfig.numRounds}
              onChange={(e) => onSimConfigChange('numRounds', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Parameter Ranges */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{texts.paramTraversal}</h3>
        {paramDefs.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-400">{texts.noParams}</p>
            </div>
        ) : (
            <div className="space-y-4">
            <div className="hidden md:grid grid-cols-4 gap-4 px-4 text-xs font-medium text-slate-500">
                <div>{texts.headerParam}</div>
                <div>{texts.headerMin}</div>
                <div>{texts.headerMax}</div>
                <div>{texts.headerStride}</div>
            </div>
            {paramDefs.map((def, idx) => (
                <div key={def.name} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100 items-center">
                <div className="font-mono font-medium text-indigo-700 md:col-span-1 flex items-center gap-2">
                    <span className="md:hidden text-slate-400 text-xs uppercase">{texts.headerParam}:</span>
                    {def.name}
                </div>
                <div>
                    <span className="md:hidden text-slate-400 text-xs uppercase block mb-1">{texts.headerMin}</span>
                    <input
                    type="number"
                    step="0.01"
                    value={def.min}
                    onChange={(e) => onParamDefChange(idx, 'min', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div>
                    <span className="md:hidden text-slate-400 text-xs uppercase block mb-1">{texts.headerMax}</span>
                    <input
                    type="number"
                    step="0.01"
                    value={def.max}
                    onChange={(e) => onParamDefChange(idx, 'max', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div>
                    <span className="md:hidden text-slate-400 text-xs uppercase block mb-1">{texts.headerStride}</span>
                    <input
                    type="number"
                    step="0.01"
                    value={def.step}
                    onChange={(e) => onParamDefChange(idx, 'step', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                </div>
                </div>
            ))}
            </div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onRun}
          disabled={isRunning || paramDefs.length === 0}
          className="relative w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 disabled:bg-indigo-300 hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed"
        >
          {isRunning ? (
             <>
               <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
               <span>{appTexts.processing}</span>
             </>
          ) : (
            <>
              <Activity className="w-6 h-6" />
              <span>{texts.runBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ParamConfig;