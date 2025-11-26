import React, { useState } from 'react';
import { Plus, Trash2, PlayCircle, Code2 } from 'lucide-react';
import { Translation } from '../locales';

interface StrategyEditorProps {
  code: string;
  paramNames: string[];
  onCodeChange: (code: string) => void;
  onParamNamesChange: (names: string[]) => void;
  onNext: () => void;
  texts: Translation['strategy'];
}

const StrategyEditor: React.FC<StrategyEditorProps> = ({
  code,
  paramNames,
  onCodeChange,
  onParamNamesChange,
  onNext,
  texts
}) => {
  const [newParam, setNewParam] = useState('');

  const addParam = () => {
    const trimmed = newParam.trim();
    if (trimmed && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed) && !paramNames.includes(trimmed)) {
      onParamNamesChange([...paramNames, trimmed]);
      setNewParam('');
    }
  };

  const removeParam = (name: string) => {
    onParamNamesChange(paramNames.filter(n => n !== name));
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <Code2 className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-slate-800">{texts.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Params Definition */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{texts.paramsTitle}</h3>
          <p className="text-xs text-slate-400">{texts.paramsDesc}</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newParam}
              onChange={(e) => setNewParam(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addParam()}
              placeholder={texts.addPlaceholder}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addParam}
              className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 mt-4">
            {paramNames.map(name => (
              <div key={name} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-mono text-sm text-indigo-600 font-medium">{name}</span>
                <button onClick={() => removeParam(name)} className="text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {paramNames.length === 0 && (
              <p className="text-xs text-slate-400 italic">{texts.noParams}</p>
            )}
          </div>
        </div>

        {/* Right Col: Code Editor */}
        <div className="lg:col-span-2 flex flex-col h-full">
            <div className="flex justify-between items-end mb-2">
                 <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{texts.logicTitle}</h3>
                 <span className="text-xs text-slate-400">{texts.logicDesc}</span>
            </div>
         
          <div className="relative flex-1 min-h-[300px] border border-slate-300 rounded-lg overflow-hidden bg-slate-900 font-mono text-sm leading-relaxed">
            <div className="absolute top-0 left-0 right-0 bg-slate-800 text-slate-400 px-4 py-2 text-xs border-b border-slate-700 select-none">
              function calculateReturns({paramNames.join(', ')}) {'{'}
            </div>
            <textarea
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              className="w-full h-full p-4 pt-10 pb-10 bg-transparent text-slate-50 focus:outline-none resize-none"
              spellCheck={false}
              placeholder={texts.codePlaceholder}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-slate-800 text-slate-400 px-4 py-2 text-xs border-t border-slate-700 select-none">
              {'}'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <span>{texts.nextBtn}</span>
          <PlayCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default StrategyEditor;