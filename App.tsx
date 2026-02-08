
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { presets as initialPresets } from './utils/presets';
import SimulationCard from './components/SimulationCard';
// Fix: Import Type from @google/genai as it is part of the SDK, not the local types file.
import { GlobalSettings, SimulationConfig } from './types';
import { Settings, Play, Pause, Activity, Github, Sparkles, Plus, Terminal, Search } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    timeScale: 1.0,
    gravityMultiplier: 1.0,
    rotationMultiplier: 1.0,
    bouncinessMultiplier: 1.0,
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [presets, setPresets] = useState<SimulationConfig[]>(initialPresets);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle play state without mutating the speed setting
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Calculate the effective settings passed to canvases
  const effectiveSettings = {
    ...globalSettings,
    timeScale: isPlaying ? globalSettings.timeScale : 0,
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Initialize GoogleGenAI with the API key from environment variables.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        // Updated to gemini-3-pro-preview for complex configuration reasoning and to match UI description.
        model: "gemini-3-pro-preview",
        contents: `Create a unique and interesting physics simulation configuration based on this prompt: "${prompt}". 
                   Return only a valid JSON object matching the SimulationConfig interface.
                   shapeType must be one of: 'triangle', 'square', 'pentagon', 'hexagon', 'octagon', 'star', 'house', 'skull', 'candy_cane', 'tree', 'ghost', 'pumpkin'.
                   gravity should be between -1 and 1.
                   ballCount should be between 1 and 60.
                   ballSize between 2 and 30.
                   rotationSpeed between -0.1 and 0.1.
                   restitution between 0.1 and 1.2.
                   For 'skull', 'ghost', or 'pumpkin', try to use thematic gravity or colors if possible in description.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              shapeType: { type: Type.STRING },
              vertexCount: { type: Type.INTEGER },
              gravity: { type: Type.NUMBER },
              friction: { type: Type.NUMBER },
              restitution: { type: Type.NUMBER },
              rotationSpeed: { type: Type.NUMBER },
              ballCount: { type: Type.INTEGER },
              ballSize: { type: Type.NUMBER },
              initialSpeed: { type: Type.NUMBER },
              nuanceDescription: { type: Type.STRING },
            },
            required: ["name", "shapeType", "vertexCount", "gravity", "friction", "restitution", "rotationSpeed", "ballCount", "ballSize", "initialSpeed", "nuanceDescription"]
          }
        },
      });

      // Extract the text output from the GenerateContentResponse object.
      const configStr = response.text;
      if (configStr) {
        const newConfig: SimulationConfig = JSON.parse(configStr);
        newConfig.id = Date.now(); // Ensure unique ID
        setPresets([newConfig, ...presets]);
        setPrompt("");
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
      setError("Failed to push to main branch. Check your connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#388bfd] selection:text-white">
      
      {/* GitHub Themed Header */}
      <header className="sticky top-0 z-50 bg-[#161b22]/90 backdrop-blur-md border-b border-[#30363d] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <Github size={32} className="text-white hover:opacity-80 transition-opacity cursor-pointer" />
            </a>
            <div className="flex items-center gap-1 text-lg font-semibold">
              <span className="text-[#58a6ff] hover:underline cursor-pointer">physics-engine</span>
              <span className="text-[#8b949e]">/</span>
              <span className="text-white hover:underline cursor-pointer">kinetic-shapes</span>
            </div>
            <div className="hidden md:flex gap-2 ml-4">
              <span className="px-2 py-0.5 text-xs font-medium border border-[#30363d] rounded-full bg-[#21262d] text-[#8b949e]">Public</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#21262d] border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors">
                <Activity size={14} /> Star <span className="ml-1 text-[#8b949e]">1.4k</span>
             </button>
             <button 
                onClick={togglePlay}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${isPlaying ? 'bg-[#238636] hover:bg-[#2ea043] text-white' : 'bg-[#388bfd] hover:bg-[#1f6feb] text-white'}`}
             >
                {isPlaying ? <Pause size={14}/> : <Play size={14}/>}
                {isPlaying ? 'Running' : 'Paused'}
             </button>
          </div>
        </div>

        {/* Global Controls Overlay (Sub-header) */}
        <div className="bg-[#0d1117] border-b border-[#30363d]">
          <div className="max-w-7xl mx-auto px-4 py-2 flex overflow-x-auto gap-6 items-center text-xs">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[#8b949e]">Gravity:</span>
                <input 
                  type="range" min="0" max="3" step="0.1"
                  value={globalSettings.gravityMultiplier}
                  onChange={(e) => setGlobalSettings(p => ({...p, gravityMultiplier: parseFloat(e.target.value)}))}
                  className="w-24 h-1 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#58a6ff]"
                />
                <span className="text-[#58a6ff] w-8">{globalSettings.gravityMultiplier.toFixed(1)}x</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[#8b949e]">Speed:</span>
                <input 
                  type="range" min="0.1" max="3" step="0.1"
                  value={globalSettings.timeScale}
                  onChange={(e) => setGlobalSettings(p => ({...p, timeScale: parseFloat(e.target.value)}))}
                  className="w-24 h-1 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#58a6ff]"
                />
                <span className="text-[#58a6ff] w-8">{globalSettings.timeScale.toFixed(1)}x</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[#8b949e]">Rotation:</span>
                <input 
                  type="range" min="0" max="5" step="0.1"
                  value={globalSettings.rotationMultiplier}
                  onChange={(e) => setGlobalSettings(p => ({...p, rotationMultiplier: parseFloat(e.target.value)}))}
                  className="w-24 h-1 bg-[#21262d] rounded-lg appearance-none cursor-pointer accent-[#58a6ff]"
                />
                <span className="text-[#58a6ff] w-8">{globalSettings.rotationMultiplier.toFixed(1)}x</span>
              </div>
          </div>
        </div>
      </header>

      {/* Lab Interface / AI Generation */}
      <section className="bg-[#161b22] border-b border-[#30363d] py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f6feb]/10 border border-[#388bfd]/20 text-[#58a6ff] text-xs font-bold mb-4 uppercase tracking-widest">
            <Sparkles size={14} /> AI Physics Lab
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Commit a custom simulation</h2>
          <p className="text-[#8b949e] mb-8 max-w-xl mx-auto">Use Gemini 3 Pro to generate unique kinetic configurations. Just describe the physics you want to see.</p>
          
          <form onSubmit={handleAiGenerate} className="relative max-w-2xl mx-auto">
            <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-lg p-2 focus-within:border-[#58a6ff] transition-colors shadow-xl">
              <Terminal size={18} className="text-[#8b949e] ml-2" />
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A chaotic galaxy of 50 tiny balls in a high-speed spinning star"
                className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2 py-1 placeholder:text-[#484f58]"
                disabled={isGenerating}
              />
              <button 
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#238636]/50 text-white rounded-md text-sm font-semibold transition-colors whitespace-nowrap"
              >
                {isGenerating ? 'Push to Main' : 'Push to Main'}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2 absolute w-full">{error}</p>}
          </form>
        </div>
      </section>

      {/* Grid Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8 border-b border-[#30363d] pb-4">
           <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-white">Simulations</h3>
              <span className="px-2 py-0.5 bg-[#21262d] rounded-full text-xs text-[#8b949e]">{presets.length}</span>
           </div>
           <div className="flex items-center gap-2 text-xs text-[#8b949e]">
              <Search size={14} />
              <span>Filter by config name...</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {presets.map(preset => (
            <SimulationCard 
                key={preset.id} 
                config={preset} 
                globalSettings={effectiveSettings} 
            />
          ))}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-[#30363d] text-center text-xs text-[#8b949e]">
          <div className="flex items-center justify-center gap-6 mb-4">
            <span className="hover:text-[#58a6ff] cursor-pointer">Terms</span>
            <span className="hover:text-[#58a6ff] cursor-pointer">Privacy</span>
            <span className="hover:text-[#58a6ff] cursor-pointer">Security</span>
            <span className="hover:text-[#58a6ff] cursor-pointer">Status</span>
            <span className="hover:text-[#58a6ff] cursor-pointer">Docs</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Kinetic GitHub, Inc. Powered by Gemini 3 Pro.</p>
      </footer>
    </div>
  );
};

export default App;
