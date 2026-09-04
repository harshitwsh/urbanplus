export type MapEngineType = 'LEAFLET_CARTODB' | 'CESIUM_3D' | 'GOOGLE_SATELLITE';
export type MapMode = 'CITY' | 'SATELLITE' | 'TERRAIN' | 'AI_INTELLIGENCE';

export interface MapProviderConfig {
  googleMapsApiKey?: string;
  cesiumIonToken?: string;
  activeEngine: MapEngineType;
  isGoogleConfigured: boolean;
  isCesiumConfigured: boolean;
}

export class MapProviderManager {
  private static instance: MapProviderManager;
  private config: MapProviderConfig;

  private constructor() {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env || {};
    const googleKey = metaEnv.VITE_GOOGLE_MAPS_API_KEY || metaEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const cesiumToken = metaEnv.VITE_CESIUM_ION_TOKEN || metaEnv.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';

    this.config = {
      googleMapsApiKey: googleKey,
      cesiumIonToken: cesiumToken,
      activeEngine: 'LEAFLET_CARTODB',
      isGoogleConfigured: Boolean(googleKey && googleKey.trim().length > 0),
      isCesiumConfigured: Boolean(cesiumToken && cesiumToken.trim().length > 0)
    };
  }

  public static getInstance(): MapProviderManager {
    if (!MapProviderManager.instance) {
      MapProviderManager.instance = new MapProviderManager();
    }
    return MapProviderManager.instance;
  }

  public getConfig(): MapProviderConfig {
    return { ...this.config };
  }

  public isGoogleKeyConfigured(): boolean {
    return this.config.isGoogleConfigured;
  }

  public setEngine(engine: MapEngineType): void {
    this.config.activeEngine = engine;
  }
}
