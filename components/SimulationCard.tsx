
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { SimulationConfig, GlobalSettings } from '../types';
import Canvas from './Canvas';
import { RefreshCw, GitBranch, Terminal, Check } from 'lucide-react';

interface SimulationCardProps {
  config: SimulationConfig;
  globalSettings: GlobalSettings;
}

const SimulationCard: React.FC<SimulationCardProps> = ({ config, globalSettings }) => {
  const [resetKey, setResetKey] = React.useState(0);
  const [copied, setCopied] = useState(false);

  const copyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#161b22] rounded-lg overflow-hidden border border-[#30363d] hover:border-[#8b949e] transition-all duration-200 flex flex-col group shadow-sm">
      
      {/* Header Overlay */}
      <div className="p-4 border-b border-[#30363d] flex justify-between items-start bg-[#161b22]">
        <div className="flex flex-col gap-1 overflow-hidden">
             <div className="flex items-center gap-2">
                <GitBranch size={16} className="text-[#8b949e]" />
                <h3 className="text-[#58a6ff] font-bold text-sm truncate hover:underline cursor-pointer">{config.name}</h3>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-[#30363d] text-[#8b949e] font-medium uppercase">
                 {config.shapeType}
               </span>
               {config.id > 20 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1f6feb]/10 border border-[#388bfd]/20 text-[#58a6ff] font-bold">
                    AI Gen
                  </span>
               )}
             </div>
        </div>
        <div className="flex gap-1">
            <button 
                onClick={() => setResetKey(k => k + 1)}
                className="p-1.5 rounded-md border border-[#30363d] text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-colors"
                title="Force Re-build"
            >
                <RefreshCw size={14} />
            </button>
            <button 
                onClick={copyConfig}
                className={`p-1.5 rounded-md border border-[#30363d] transition-colors ${copied ? 'text-green-400 bg-green-400/10 border-green-400/30' : 'text-[#8b949e] hover:text-white hover:bg-[#30363d]'}`}
                title="Copy config JSON"
            >
                {copied ? <Check size={14} /> : <Terminal size={14} />}
            </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative aspect-video bg-[#0d1117] group-hover:opacity-90 transition-opacity">
        <Canvas key={resetKey} config={config} globalSettings={globalSettings} />
      </div>

      {/* Footer Info */}
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-xs text-[#8b949e] leading-relaxed mb-4 line-clamp-2 italic">
            "{config.nuanceDescription}"
        </p>
        
        <div className="mt-auto grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
              <div className="w-2 h-2 rounded-full bg-[#58a6ff]"></div>
              <span>G: {config.gravity.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
              <div className="w-2 h-2 rounded-full bg-[#39d353]"></div>
              <span>Balls: {config.ballCount}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
              <div className="w-2 h-2 rounded-full bg-[#f1e05a]"></div>
              <span>B: {config.restitution.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#8b949e]">
              <div className="w-2 h-2 rounded-full bg-[#ff7b72]"></div>
              <span>S: {config.initialSpeed}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationCard;
