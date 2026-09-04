import { BoundingBox, EventSeverity, DefectType } from '../types/urbanpulse';

export interface AIDetectionEvent {
  id: string; // DET-AI-10482
  objectType: DefectType;
  confidence: number; // e.g. 94.2
  source: 'Dashcam' | 'Municipal Camera' | 'Surveillance' | 'Mobile Bus Sensor';
  sourceId: string;
  lat: number;
  lng: number;
  locationName: string;
  timestamp: string;
  frameUrl: string;
  status: 'Pending Verification' | 'Verified' | 'Dismissed';
  severity: EventSeverity;
  boundingBoxes: BoundingBox[];
  isDemo: boolean;
}

export class AIDetectionService {
  private static MOCK_AI_DETECTIONS: AIDetectionEvent[] = [
    {
      id: 'DET-AI-9081',
      objectType: 'pothole',
      confidence: 94.2,
      source: 'Dashcam',
      sourceId: 'CAM-BUS-104-FRONT',
      lat: 28.4595,
      lng: 77.0266,
      locationName: 'Golf Course Road (Junction 4)',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toLocaleTimeString('en-IN'),
      frameUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
      status: 'Pending Verification',
      severity: 'HIGH',
      boundingBoxes: [
        { id: 'b1', label: 'Pothole (94%)', confidence: 0.94, x: 35, y: 68, w: 25, h: 20, color: '#D97706' }
      ],
      isDemo: true
    },
    {
      id: 'DET-AI-9082',
      objectType: 'waterlogging',
      confidence: 91.8,
      source: 'Municipal Camera',
      sourceId: 'CAM-MCG-IFFCO-NORTH',
      lat: 28.4720,
      lng: 77.0725,
      locationName: 'IFFCO Chowk Underpass',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString('en-IN'),
      frameUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      status: 'Verified',
      severity: 'CRITICAL',
      boundingBoxes: [
        { id: 'b2', label: 'Waterlogging (92%)', confidence: 0.92, x: 20, y: 62, w: 60, h: 25, color: '#DC4C5A' }
      ],
      isDemo: true
    },
    {
      id: 'DET-AI-9083',
      objectType: 'road_damage',
      confidence: 88.5,
      source: 'Surveillance',
      sourceId: 'CAM-CYBER-TOWER-B',
      lat: 28.4950,
      lng: 77.0890,
      locationName: 'Cyber City Rapid Metro Corridor',
      timestamp: new Date(Date.now() - 42 * 60 * 1000).toLocaleTimeString('en-IN'),
      frameUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
      status: 'Pending Verification',
      severity: 'MEDIUM',
      boundingBoxes: [
        { id: 'b3', label: 'Asphalt Crack (88%)', confidence: 0.88, x: 40, y: 65, w: 30, h: 22, color: '#D97706' }
      ],
      isDemo: true
    }
  ];

  public static getDetections(): AIDetectionEvent[] {
    return [...this.MOCK_AI_DETECTIONS];
  }

  // Simulate dashcam video processing pipeline
  public static async processDashcamFootage(fileName: string): Promise<AIDetectionEvent> {
    await new Promise((res) => setTimeout(res, 2500)); // Simulate inference pipeline

    const newDetection: AIDetectionEvent = {
      id: `DET-DASH-${Math.floor(1000 + Math.random() * 9000)}`,
      objectType: 'pothole',
      confidence: Math.round(890 + Math.random() * 90) / 10,
      source: 'Dashcam',
      sourceId: `DASHCAM-UPLOAD-${fileName.slice(0, 10).toUpperCase()}`,
      lat: 28.4595 + (Math.random() - 0.5) * 0.02,
      lng: 77.0266 + (Math.random() - 0.5) * 0.02,
      locationName: 'Uploaded Dashcam GPS Track (Gurugram)',
      timestamp: new Date().toLocaleTimeString('en-IN'),
      frameUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
      status: 'Pending Verification',
      severity: 'HIGH',
      boundingBoxes: [
        { id: 'bnew', label: 'Surface Pothole (91%)', confidence: 0.91, x: 30, y: 66, w: 35, h: 22, color: '#D97706' }
      ],
      isDemo: true
    };

    this.MOCK_AI_DETECTIONS.unshift(newDetection);
    return newDetection;
  }
}
