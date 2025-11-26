import React, { useMemo } from 'react';
import { SimulationResult, ParameterDefinition } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, Award, AlertTriangle } from 'lucide-react';
import SurfaceChart3D from './SurfaceChart3D';
import { Translation } from '../locales';

interface ResultsProps {
  results: SimulationResult[];
  paramDefs: ParameterDefinition[];
  texts: Translation['results'];
}

const Results: React.FC<ResultsProps> = ({ results, paramDefs, texts }) => {
  const bestResult = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((prev, current) =>
      (prev.medianGrowthRate > current.medianGrowthRate) ? prev : current
    );
  }, [results]);

  const chartData = useMemo(() => {
    return results.map(r => ({
      ...r.params,
      growth: parseFloat((r.medianGrowthRate * 100).toFixed(2)), // Convert to %
      rawGrowth: r.medianGrowthRate
    }));
  }, [results]);

  // Determine chart type based on number of varied parameters
  // A varied parameter is one where max > min
  const variedParams = paramDefs.filter(p => p.max > p.min);
  const chartType = variedParams.length === 1 ? 'line' : variedParams.length === 2 ? '3d' : 'none';

  if (!bestResult && results.length === 0) return null;
  if (results.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200 mb-20">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <TrendingUp className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-slate-800">{texts.title}</h2>
      </div>

      {/* Best Result Card */}
      {bestResult && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-full shadow-md text-yellow-500">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-900">{texts.optConfig}</h3>
              <div className="text-sm text-indigo-700 mt-1 space-y-1">
                {Object.entries(bestResult.params).map(([key, val]) => (
                  <div key={key} className="flex gap-2">
                    <span className="font-semibold opacity-70">{key}:</span>
                    <span className="font-mono">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-sm text-indigo-600 font-medium uppercase tracking-wide">{texts.maxGrowth}</div>
            <div className={`text-4xl font-black mt-1 ${bestResult.medianGrowthRate >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {(bestResult.medianGrowthRate * 100).toFixed(4)}%
            </div>
            <div className="text-xs text-indigo-400 mt-1">{texts.perRound}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="min-h-[400px] w-full bg-white rounded-lg p-4 border border-slate-100 shadow-inner">
        {chartType === 'line' && (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey={variedParams[0].name}
                  label={{ value: variedParams[0].name, position: 'bottom', offset: 0 }}
                  type="number"
                  domain={['auto', 'auto']}
                />
                <YAxis
                  label={{ value: texts.chartTitle, angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value}%`, texts.chartTitle.split('(')[0].trim()]}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4f46e5' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartType === '3d' && (
          <SurfaceChart3D
            results={results}
            xParam={variedParams[0]}
            yParam={variedParams[1]}
            texts={texts}
          />
        )}

        {chartType === 'none' && (
          <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
            <AlertTriangle className="w-10 h-10 mb-2 opacity-50" />
            <p>{texts.vizNA}</p>
            <p className="text-sm">{texts.fixParams}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;