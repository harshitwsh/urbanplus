export type NavigationTab = 
  | 'command_center'
  | 'map'
  | 'fusion'
  | 'vision'
  | 'road'
  | 'traffic'
  | 'hotspots'
  | 'fleet'
  | 'incidents'
  | 'analytics'
  | 'actions'
  | 'reports'
  | 'privacy'
  | 'architecture';

export type UserRole = 
  | 'transport_authority'
  | 'traffic_operator'
  | 'road_maintenance'
  | 'security_reviewer';

export type EventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';
export type IncidentStatus = 'AWAITING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'ESCALATED';
export type DefectType = 'pothole' | 'waterlogging' | 'road_damage' | 'missing_divider' | 'missing_zebra' | 'damaged_sign' | 'infrastructure';

export interface CameraHealth {
  front: boolean;
  rear: boolean;
  left: boolean;
  right: boolean;
}

export interface Bus {
  id: string;
  routeId: string;
  routeName: string;
  status: 'ACTIVE' | 'IDLE' | 'MAINTENANCE';
  lat: number;
  lng: number;
  speed: number; // km/h
  heading: number; // degrees
  aiStatus: 'EDGE ONLINE' | 'DEGRADED' | 'OFFLINE';
  lastSync: string;
  eventsCount: number;
  cameraHealth: CameraHealth;
  driverCode: string;
  busModel: string;
  ipAddress: string;
}

export interface BusRoute {
  id: string;
  code: string;
  name: string;
  origin: string;
  destination: string;
  expectedTimeMin: number;
  currentTimeMin: number;
  delayMin: number;
  activeBusesCount: number;
  totalDistanceKm: number;
  waypoints: [number, number][];
}

export interface MultiPassSighting {
  id: string;
  busId: string;
  routeId: string;
  timestamp: string;
  confidence: number;
  speedKm: number;
  imageUrl: string;
  lat: number;
  lng: number;
}

export interface RoadDefect {
  id: string;
  code: string; // e.g. UP-10482
  type: DefectType;
  title: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  timestamp: string;
  firstDetectedAt: string;
  lastVerifiedAt: string;
  initialBusId: string;
  routeId: string;
  initialConfidence: number;
  fusionConfidence: number;
  severity: EventSeverity;
  status: IssueStatus;
  evidenceCount: number;
  sightings: MultiPassSighting[];
  imageUrl: string;
  assignedDept: string;
  slaHours: number;
}

export interface TrafficHotspot {
  id: string;
  locationName: string;
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  avgDelayMin: number;
  vehiclesPerHour: number;
  speedKm: number;
  lat: number;
  lng: number;
  causes: string[];
  recommendedAction: string;
  affectedRoutes: string[];
}

export interface Incident {
  id: string;
  code: string;
  type: 'POTENTIAL_HIT_RUN' | 'RASH_DRIVING' | 'PEDESTRIAN_HAZARD' | 'ACCIDENT' | 'ROAD_HAZARD';
  title: string;
  vehicleType: string;
  plateNumber: string;
  ocrConfidence: number;
  detectionConfidence: number;
  lat: number;
  lng: number;
  address: string;
  timestamp: string;
  busId: string;
  routeId: string;
  imageUrl: string;
  status: IncidentStatus;
  riskLevel: EventSeverity;
  verifiedBy?: string;
  actionTaken?: string;
}

export interface ActionItem {
  id: string;
  defectId: string;
  code: string; // UP-10482
  title: string;
  location: string;
  lat: number;
  lng: number;
  priority: EventSeverity;
  evidenceCount: number;
  assignedDept: 'Road Maintenance' | 'Traffic Division' | 'Municipal Corp' | 'BEL Operations';
  slaHours: number;
  hoursElapsed: number;
  status: 'NEW' | 'ASSIGNED' | 'INSPECTION' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  notes?: string;
}

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number;
  w: number;
  h: number;
  color: string; // hex or Tailwind color name
}

export interface DemoStep {
  step: number;
  title: string;
  description: string;
  targetTab: NavigationTab;
  actionLabel: string;
  busId?: string;
  defectId?: string;
}
