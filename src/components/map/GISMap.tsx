import React, { useState } from 'react';
import { UrbanMap } from './UrbanMap';
import { CesiumMapView } from './CesiumMapView';

export const GISMap: React.FC = () => {
  const [mapEngine, setMapEngine] = useState<'2D' | '3D_CESIUM'>('2D');

  return (
    <div className="relative w-full h-full">
      {mapEngine === '2D' ? (
        <UrbanMap 
          onToggle3DGlobe={() => setMapEngine('3D_CESIUM')} 
          is3DGlobeActive={false} 
        />
      ) : (
        <CesiumMapView onSwitchTo2D={() => setMapEngine('2D')} />
      )}
    </div>
  );
};
