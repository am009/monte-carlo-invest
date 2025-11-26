import React, { useEffect, useState } from 'react';
import { SimulationResult, ParameterDefinition } from '../types';
import { Translation } from '../locales';
import Plot from 'react-plotly.js';

declare global {
  interface Window {
    Plotly: any;
  }
}

interface SurfaceChart3DProps {
  results: SimulationResult[];
  xParam: ParameterDefinition;
  yParam: ParameterDefinition;
  texts: Translation['results'];
}

const SurfaceChart3D: React.FC<SurfaceChart3DProps> = ({ results, xParam, yParam, texts }) => {
  const [figure, setFigure] = useState({ data: [], layout: {}, frames: [], config: {} });

  useEffect(() => {
    const xValues = Array.from(new Set(results.map(r => r.params[xParam.name] as number))).sort((a: number, b: number) => a - b);
    const yValues = Array.from(new Set(results.map(r => r.params[yParam.name] as number))).sort((a: number, b: number) => a - b);

    const zData = yValues.map((y: number) => {
      return xValues.map((x: number) => {
        const match = results.find(r =>
          Math.abs((r.params[xParam.name] as number) - x) < 0.00001 &&
          Math.abs((r.params[yParam.name] as number) - y) < 0.00001
        );
        return match ? match.medianGrowthRate * 100 : 0;
      });
    });

    const data = [{
      z: zData,
      x: xValues,
      y: yValues,
      type: 'surface',
      colorscale: 'Viridis',
      showscale: true,
      contours: {
        z: {
          show: true,
          usecolormap: true,
          highlightcolor: "#42f546",
          project: { z: true }
        }
      },
      hovertemplate:
        `${xParam.name}: %{x}<br>` +
        `${yParam.name}: %{y}<br>` +
        `${texts.growthAxis}: %{z:.2f}%<extra></extra>`
    }];

    const layout = {
      title: { text: texts.surfaceTitle },
      autosize: true,
      margin: { l: 0, r: 0, b: 0, t: 30 },
      scene: {
        xaxis: { title: { text: xParam.name } },
        yaxis: { title: { text: yParam.name } },
        zaxis: { title: { text: texts.growthAxis } },
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.5 }
        }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
    };

    const config = { responsive: true, displayModeBar: false };

    setFigure({ data, layout, frames: [], config });
  }, [results, xParam, yParam, texts]);

  return (
    <div className="w-full h-[500px] border border-slate-200 rounded-lg overflow-hidden bg-white">
      <Plot
        data={figure.data}
        layout={figure.layout}
        frames={figure.frames}
        config={figure.config}
        style={{ width: '100%', height: '100%' }}
        onInitialized={setFigure}
        onUpdate={setFigure}
      />
    </div>
  );
};

export default SurfaceChart3D;
