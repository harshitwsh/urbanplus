export type MapMode = 'CITY' | 'SATELLITE' | 'TERRAIN' | 'AI_INTELLIGENCE';

export interface MapProviderConfig {
  googleMapsApiKey?: string;
  cesiumIonToken?: string;
  isGoogle3DTilesEnabled: boolean;
  activeMode: MapMode;
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
      isGoogle3DTilesEnabled: Boolean(googleKey && googleKey.trim().length > 0),
      activeMode: 'CITY'
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
    return this.config.isGoogle3DTilesEnabled;
  }

  public setMode(mode: MapMode): void {
    this.config.activeMode = mode;
  }
}
