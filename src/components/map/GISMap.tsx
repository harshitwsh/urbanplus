import React, { useState } from 'react';
import { UrbanMap } from './UrbanMap';
import { ThreeDGlobeView } from '../globe/ThreeDGlobeView';
import { CesiumMapView } from './CesiumMapView';

export const GISMap: React.FC = () => {
  const [mapEngine, setMapEngine] = useState<'2D' | '3D_GLOBE' | '3D_CESIUM'>('2D');

  return (
    <div className="relative w-full h-full">
      {mapEngine === '2D' && (
        <UrbanMap 
          onToggle3DGlobe={() => setMapEngine('3D_GLOBE')} 
          is3DGlobeActive={false} 
        />
      )}

      {mapEngine === '3D_GLOBE' && (
        <ThreeDGlobeView 
          onSwitchToCesium={() => setMapEngine('3D_CESIUM')} 
        />
      )}

      {mapEngine === '3D_CESIUM' && (
        <div className="relative w-full h-full">
          <CesiumMapView />
          <div className="absolute top-4 right-4 z-30 flex items-center space-x-2 font-mono text-xs">
            <button
              onClick={() => setMapEngine('3D_GLOBE')}
              className="px-3.5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs rounded-lg shadow-xl transition flex items-center space-x-1.5 border border-[#38BDF8]"
            >
              <span>🌐 Switch to Photorealistic 3D Globe</span>
            </button>
            <button
              onClick={() => setMapEngine('2D')}
              className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xl transition flex items-center space-x-1.5 border border-blue-400"
            >
              <span>← Switch to 2D Map</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
