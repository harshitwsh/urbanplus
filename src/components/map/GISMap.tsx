import React, { useState } from 'react';
import { CesiumMapView } from './CesiumMapView';
import { FallbackMap } from './FallbackMap';
import { RoadDefect } from '../../types/urbanpulse';

export const GISMap: React.FC = () => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [selectedInspectorDefect, setSelectedInspectorDefect] = useState<RoadDefect | null>(null);

  if (hasError) {
    return <FallbackMap onSelectDefect={(def) => setSelectedInspectorDefect(def)} />;
  }

  try {
    return <CesiumMapView />;
  } catch (err) {
    return <FallbackMap onSelectDefect={(def) => setSelectedInspectorDefect(def)} />;
  }
};
