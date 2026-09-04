export type NavigationTab = 
  | 'landing'
  | 'login'
  | 'signup'
  | 'forgot_password'
  | 'verify_email'
  | 'role_selection'
  | 'dashboard'
  | 'command_center'
  | 'map'
  | 'globe'
  | 'events'
  | 'fusion'
  | 'vision'
  | 'dashcam'
  | 'mobile_eyes'
  | 'road'
  | 'traffic'
  | 'hotspots'
  | 'fleet'
  | 'incidents'
  | 'actions'
  | 'field_officer'
  | 'citizen_report'
  | 'my_reports'
  | 'analytics'
  | 'reports'
  | 'privacy'
  | 'profile'
  | 'architecture'
  | 'settings';

export type UserRole = 
  | 'transport_authority'
  | 'municipal_authority'
  | 'field_officer'
  | 'administrator'
  | 'operator'
  | 'citizen';

export type EventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'OPEN' | 'NEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'FIELD_VERIFIED' | 'RESOLVED' | 'Reported' | 'Under Review' | 'In Progress' | 'Resolved' | 'Verified' | 'Assigned';
export type IncidentStatus = 'NEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'DISMISSED' | 'ESCALATED' | 'AWAITING_VERIFICATION' | 'REJECTED';

export type IncidentSource = 
  | 'citizen'
  | 'traffic_police_dashcam'
  | 'public_fleet'
  | 'cctv'
  | 'ai_detection'
  | 'government'
  | 'dashcam'
  | 'surveillance';

export type DefectType = 
  | 'pothole'
  | 'road_crack'
  | 'road_damage'
  | 'broken_footpath'
  | 'damaged_bridge'
  | 'fallen_tree'
  | 'damaged_traffic_signal'
  | 'accident'
  | 'dangerous_road_condition'
  | 'open_manhole'
  | 'fire_hazard'
  | 'unsafe_construction'
  | 'fallen_electric_pole'
  | 'broken_streetlight'
  | 'garbage_dumping'
  | 'water_leakage'
  | 'waterlogging'
  | 'drainage_problem'
  | 'suspicious_hazard'
  | 'public_safety_issue'
  | 'infrastructure_vulnerability'
  | 'missing_divider'
  | 'missing_zebra'
  | 'damaged_sign'
  | 'infrastructure'
  | 'pedestrian_risk'
  | 'garbage'
  | 'traffic_hazard'
  | 'other';

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
  source?: 'citizen' | 'dashcam' | 'ai_detection' | 'government' | 'surveillance';
}

export interface CitizenReport {
  id: string; // UP-2026-XXXXX
  type: DefectType;
  title: string;
  description?: string;
  images: string[];
  lat: number;
  lng: number;
  locationName: string;
  severity: EventSeverity;
  status: 'Reported' | 'Under Review' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved';
  source: 'citizen' | 'dashcam' | 'ai_detection' | 'government' | 'surveillance';
  reporterId?: string;
  reporterEmail?: string;
  createdAt: string;
  updatedAt: string;
  assignedDepartment?: string;
  verified: boolean;
  isDemo?: boolean;
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
  type: 'POTENTIAL_HIT_RUN' | 'RASH_DRIVING' | 'PEDESTRIAN_HAZARD' | 'ACCIDENT' | 'ROAD_HAZARD' | 'ROAD_OBSTRUCTION';
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
  code: string; // UP-10482 / WO-58291
  title: string;
  location: string;
  lat: number;
  lng: number;
  priority: EventSeverity;
  evidenceCount: number;
  assignedDept: 'Road Maintenance' | 'Traffic Division' | 'Municipal Corp' | 'BEL Operations';
  slaHours: number;
  hoursElapsed: number;
  status: 'NEW' | 'ASSIGNED' | 'INSPECTION' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  notes?: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  description: string;
  type: 'CRITICAL_HAZARD' | 'FLEET_ALERT' | 'TRAFFIC_ALERT' | 'INCIDENT_ALERT' | 'CITIZEN_REPORT';
  severity: EventSeverity;
  timestamp: string;
  location: string;
  read: boolean;
}

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  x: number; // percentage 0-100
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface DemoStep {
  step: number;
  title: string;
  description: string;
  targetTab: NavigationTab;
  actionLabel: string;
  busId?: string;
  defectId?: string;
  impactMetrics?: {
    detectionTimeMin: number;
    manualInspectionAvoided: boolean;
    observationsCount: number;
  };
}

export interface RoadSegmentCoverage {
  id: string;
  roadName: string;
  coverageStatus: 'GREEN' | 'YELLOW' | 'RED';
  lastMonitoredMinutesAgo: number;
  activeMobileUnitsCount: number;
  coordinates: [number, number][];
}

export interface IncidentCorrelation {
  id: string;
  masterCode: string;
  primaryType: DefectType;
  lat: number;
  lng: number;
  locationName: string;
  sources: IncidentSource[];
  citizenReportsCount: number;
  dashcamDetectionsCount: number;
  highestConfidence: number;
  evidenceImages: string[];
  status: IssueStatus;
  createdAt: string;
}
