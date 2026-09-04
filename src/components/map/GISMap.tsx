import React, { useState } from 'react';
import { UrbanMap } from './UrbanMap';
import { ThreeDGlobeView } from '../globe/ThreeDGlobeView';

export const GISMap: React.FC = () => {
  const [mapEngine, setMapEngine] = useState<'2D' | '3D'>('2D');

  return (
    <div className="relative w-full h-full">
      {mapEngine === '2D' ? (
        <UrbanMap onToggle3DGlobe={() => setMapEngine('3D')} is3DGlobeActive={false} />
      ) : (
        <div className="relative w-full h-full">
          <ThreeDGlobeView />
          <div className="absolute top-4 right-4 z-30 flex items-center space-x-2 font-mono text-xs">
            <button
              onClick={() => setMapEngine('2D')}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xl transition flex items-center space-x-2 border border-blue-400"
            >
              <span>← Switch to 2D Google-Style Map</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
