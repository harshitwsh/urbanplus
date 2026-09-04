import { Bus, BusRoute, RoadDefect, TrafficHotspot, Incident, ActionItem, DemoStep } from '../types/urbanpulse';

// Center coordinate for map (Gurugram urban corridor)
export const CITY_CENTER: [number, number] = [28.4595, 77.0266];

export const MOCK_BUSES: Bus[] = [
  {
    id: 'BUS-104',
    routeId: 'R-07',
    routeName: 'Route 07: Sector 56 ↔ Cyber City',
    status: 'ACTIVE',
    lat: 28.4595,
    lng: 77.0266,
    speed: 34,
    heading: 45,
    aiStatus: 'EDGE ONLINE',
    lastSync: '12 sec ago',
    eventsCount: 27,
    driverCode: 'DRV-4091 (Anonymized)',
    busModel: 'Tata Starbus EV (BEL Edge Mod 4)',
    ipAddress: '10.240.12.104',
    cameraHealth: { front: true, rear: true, left: true, right: true }
  },
  {
    id: 'BUS-117',
    routeId: 'R-04',
    routeName: 'Route 04: MG Road ↔ IFFCO Chowk',
    status: 'ACTIVE',
    lat: 28.4621,
    lng: 77.0312,
    speed: 28,
    heading: 120,
    aiStatus: 'EDGE ONLINE',
    lastSync: '8 sec ago',
    eventsCount: 42,
    driverCode: 'DRV-1182 (Anonymized)',
    busModel: 'Ashok Leyland JanBus (BEL Edge Mod 2)',
    ipAddress: '10.240.12.117',
    cameraHealth: { front: true, rear: true, left: true, right: true }
  },
  {
    id: 'BUS-131',
    routeId: 'R-07',
    routeName: 'Route 07: Sector 56 ↔ Cyber City',
    status: 'ACTIVE',
    lat: 28.4578,
    lng: 77.0245,
    speed: 41,
    heading: 210,
    aiStatus: 'EDGE ONLINE',
    lastSync: '4 sec ago',
    eventsCount: 19,
    driverCode: 'DRV-8823 (Anonymized)',
    busModel: 'Eicher Skyline Pro (BEL Edge Mod 4)',
    ipAddress: '10.240.12.131',
    cameraHealth: { front: true, rear: true, left: true, right: true }
  },
  {
    id: 'BUS-205',
    routeId: 'R-01',
    routeName: 'Route 01: Railway Station ↔ Sector 14',
    status: 'ACTIVE',
    lat: 28.4722,
    lng: 77.0451,
    speed: 30,
    heading: 90,
    aiStatus: 'EDGE ONLINE',
    lastSync: '15 sec ago',
    eventsCount: 33,
    driverCode: 'DRV-3301 (Anonymized)',
    busModel: 'Tata Starbus EV',
    ipAddress: '10.240.12.205',
    cameraHealth: { front: true, rear: true, left: true, right: false }
  },
  {
    id: 'BUS-212',
    routeId: 'R-02',
    routeName: 'Route 02: Golf Course Extension ↔ Rajiv Chowk',
    status: 'ACTIVE',
    lat: 28.4411,
    lng: 77.0890,
    speed: 38,
    heading: 310,
    aiStatus: 'EDGE ONLINE',
    lastSync: '3 sec ago',
    eventsCount: 51,
    driverCode: 'DRV-7712 (Anonymized)',
    busModel: 'Volksbus Low-Entry',
    ipAddress: '10.240.12.212',
    cameraHealth: { front: true, rear: true, left: true, right: true }
  },
  {
    id: 'BUS-308',
    routeId: 'R-05',
    routeName: 'Route 05: Sohna Road ↔ Subhash Chowk',
    status: 'ACTIVE',
    lat: 28.4230,
    lng: 77.0398,
    speed: 22,
    heading: 180,
    aiStatus: 'EDGE ONLINE',
    lastSync: '19 sec ago',
    eventsCount: 14,
    driverCode: 'DRV-9904 (Anonymized)',
    busModel: 'Ashok Leyland Electric',
    ipAddress: '10.240.12.308',
    cameraHealth: { front: true, rear: true, left: true, right: true }
  },
  {
    id: 'BUS-340',
    routeId: 'R-03',
    routeName: 'Route 03: Old Delhi Road ↔ Hero Honda Chowk',
    status: 'ACTIVE',
    lat: 28.4680,
    lng: 77.0180,
    speed: 35,
    heading: 270,
    aiStatus: 'EDGE ONLINE',
    lastSync: '2 sec ago',
    eventsCount: 38,
    driverCode: 'DRV-2230 (Anonymized)',
    busModel: 'Tata Starbus EV',
    ipAddress: '10.240.12.340',
    cameraHealth: { front: true, rear: true, left: true, right: true }
  },
  {
    id: 'BUS-412',
    routeId: 'R-06',
    routeName: 'Route 06: NH-48 Express Corridor',
    status: 'MAINTENANCE',
    lat: 28.4890,
    lng: 77.0710,
    speed: 0,
    heading: 0,
    aiStatus: 'OFFLINE',
    lastSync: '4 hours ago',
    eventsCount: 0,
    driverCode: 'UNASSIGNED',
    busModel: 'Eicher Skyline Pro',
    ipAddress: '10.240.12.412',
    cameraHealth: { front: false, rear: true, left: false, right: false }
  }
];

export const MOCK_ROUTES: BusRoute[] = [
  {
    id: 'R-07',
    code: 'R-07',
    name: 'Sector 56 ↔ Cyber City Express',
    origin: 'Sector 56 Terminal',
    destination: 'Cyber City Hub',
    expectedTimeMin: 22,
    currentTimeMin: 37,
    delayMin: 15,
    activeBusesCount: 8,
    totalDistanceKm: 14.2,
    waypoints: [
      [28.4410, 77.0980],
      [28.4500, 77.0850],
      [28.4595, 77.0266],
      [28.4720, 77.0390],
      [28.4910, 77.0890]
    ]
  },
  {
    id: 'R-04',
    code: 'R-04',
    name: 'MG Road ↔ IFFCO Chowk Feeder',
    origin: 'MG Road Metro',
    destination: 'IFFCO Chowk Flyover',
    expectedTimeMin: 18,
    currentTimeMin: 26,
    delayMin: 8,
    activeBusesCount: 12,
    totalDistanceKm: 9.8,
    waypoints: [
      [28.4780, 77.0800],
      [28.4680, 77.0580],
      [28.4621, 77.0312],
      [28.4590, 77.0200]
    ]
  },
  {
    id: 'R-01',
    code: 'R-01',
    name: 'Railway Station ↔ Sector 14 Connector',
    origin: 'Gurugram Junction',
    destination: 'Sector 14 Market',
    expectedTimeMin: 25,
    currentTimeMin: 29,
    delayMin: 4,
    activeBusesCount: 10,
    totalDistanceKm: 11.5,
    waypoints: [
      [28.4820, 77.0210],
      [28.4750, 77.0350],
      [28.4722, 77.0451],
      [28.4690, 77.0550]
    ]
  }
];

// Highlighted Pothole with Multi-Pass Evidence Fusion
export const PRIMARY_FUSED_DEFECT: RoadDefect = {
  id: 'DEF-10482',
  code: 'UP-10482',
  type: 'pothole',
  title: 'Severe Deep Pothole & Asphalt Degradation',
  description: 'Multi-bus confirmed road hazard on primary transit lane. High risk of vehicle damage and braking deceleration.',
  address: 'Golf Course Road, Opp. Rapid Metro Pillar 142',
  lat: 28.4595,
  lng: 77.0266,
  timestamp: '2026-08-28T12:18:00+05:30',
  firstDetectedAt: '10:42 AM',
  lastVerifiedAt: '12:18 PM',
  initialBusId: 'BUS-104',
  routeId: 'R-07',
  initialConfidence: 82.4,
  fusionConfidence: 96.7,
  severity: 'HIGH',
  status: 'OPEN',
  evidenceCount: 3,
  imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  assignedDept: 'Road Maintenance Dept',
  slaHours: 24,
  sightings: [
    {
      id: 'SGT-01',
      busId: 'BUS-104',
      routeId: 'R-07',
      timestamp: '10:42 AM',
      confidence: 82.4,
      speedKm: 36,
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      lat: 28.45950,
      lng: 77.02660
    },
    {
      id: 'SGT-02',
      busId: 'BUS-117',
      routeId: 'R-04',
      timestamp: '11:07 AM',
      confidence: 91.2,
      speedKm: 29,
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      lat: 28.45954,
      lng: 77.02663
    },
    {
      id: 'SGT-03',
      busId: 'BUS-131',
      routeId: 'R-07',
      timestamp: '12:18 PM',
      confidence: 96.7,
      speedKm: 40,
      imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
      lat: 28.45948,
      lng: 77.02658
    }
  ]
};

export const MOCK_ROAD_DEFECTS: RoadDefect[] = [
  PRIMARY_FUSED_DEFECT,
  {
    id: 'DEF-10483',
    code: 'UP-10483',
    type: 'waterlogging',
    title: 'Monsoon Waterlogging & Submerged Lane',
    description: 'Submerged dual lane due to clogged drainage under flyover.',
    address: 'Subhash Chowk Underpass',
    lat: 28.4310,
    lng: 77.0420,
    timestamp: '2026-08-28T11:30:00+05:30',
    firstDetectedAt: '09:15 AM',
    lastVerifiedAt: '11:30 AM',
    initialBusId: 'BUS-308',
    routeId: 'R-05',
    initialConfidence: 89.1,
    fusionConfidence: 94.5,
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    evidenceCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    assignedDept: 'Municipal Drainage Division',
    slaHours: 12,
    sightings: [
      {
        id: 'SGT-10',
        busId: 'BUS-308',
        routeId: 'R-05',
        timestamp: '09:15 AM',
        confidence: 89.1,
        speedKm: 18,
        imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
        lat: 28.4310,
        lng: 77.0420
      },
      {
        id: 'SGT-11',
        busId: 'BUS-212',
        routeId: 'R-02',
        timestamp: '11:30 AM',
        confidence: 94.5,
        speedKm: 20,
        imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
        lat: 28.43102,
        lng: 77.04205
      }
    ]
  },
  {
    id: 'DEF-10484',
    code: 'UP-10484',
    type: 'missing_divider',
    title: 'Dislodged Central Concrete Barrier',
    description: 'Hazardous broken barrier piece protruding into oncoming lane.',
    address: 'Old Delhi Road near Sector 14',
    lat: 28.4680,
    lng: 77.0180,
    timestamp: '2026-08-28T08:45:00+05:30',
    firstDetectedAt: '08:45 AM',
    lastVerifiedAt: '08:45 AM',
    initialBusId: 'BUS-340',
    routeId: 'R-03',
    initialConfidence: 92.0,
    fusionConfidence: 92.0,
    severity: 'HIGH',
    status: 'OPEN',
    evidenceCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    assignedDept: 'Traffic Safety Squad',
    slaHours: 24,
    sightings: [
      {
        id: 'SGT-20',
        busId: 'BUS-340',
        routeId: 'R-03',
        timestamp: '08:45 AM',
        confidence: 92.0,
        speedKm: 34,
        imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80',
        lat: 28.4680,
        lng: 77.0180
      }
    ]
  },
  {
    id: 'DEF-10485',
    code: 'UP-10485',
    type: 'damaged_sign',
    title: 'Overturned School Zone Signpost',
    description: 'Signboard obscured by overhanging branches near primary school.',
    address: 'Sector 56 Main Arterial',
    lat: 28.4411,
    lng: 77.0890,
    timestamp: '2026-08-28T07:20:00+05:30',
    firstDetectedAt: '07:20 AM',
    lastVerifiedAt: '07:20 AM',
    initialBusId: 'BUS-212',
    routeId: 'R-02',
    initialConfidence: 87.6,
    fusionConfidence: 87.6,
    severity: 'MEDIUM',
    status: 'OPEN',
    evidenceCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80',
    assignedDept: 'Infrastructure Maintenance',
    slaHours: 48,
    sightings: []
  },
  {
    id: 'DEF-10486',
    code: 'UP-10486',
    type: 'pothole',
    title: 'Multiple Cluster Potholes on Outer Lane',
    description: '3 consecutive surface cracks forming deep rutting.',
    address: 'IFFCO Chowk Service Road',
    lat: 28.4722,
    lng: 77.0451,
    timestamp: '2026-08-28T10:10:00+05:30',
    firstDetectedAt: '07:50 AM',
    lastVerifiedAt: '10:10 AM',
    initialBusId: 'BUS-205',
    routeId: 'R-01',
    initialConfidence: 85.0,
    fusionConfidence: 93.8,
    severity: 'HIGH',
    status: 'OPEN',
    evidenceCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    assignedDept: 'Road Maintenance Dept',
    slaHours: 24,
    sightings: []
  }
];

export const MOCK_TRAFFIC_HOTSPOTS: TrafficHotspot[] = [
  {
    id: 'TH-01',
    locationName: 'Golf Course Road Junction',
    congestionLevel: 'HIGH',
    avgDelayMin: 14,
    vehiclesPerHour: 2840,
    speedKm: 14,
    lat: 28.4595,
    lng: 77.0266,
    causes: ['Pothole #UP-10482 speed reduction', 'Peak office hour spillover', 'Narrowing near Metro Pillar'],
    recommendedAction: 'Deploy traffic marshal & expedite road patching SLA',
    affectedRoutes: ['R-07', 'R-04']
  },
  {
    id: 'TH-02',
    locationName: 'MG Road Metro Boulevard',
    congestionLevel: 'MEDIUM',
    avgDelayMin: 8,
    vehiclesPerHour: 1950,
    speedKm: 22,
    lat: 28.4780,
    lng: 77.0800,
    causes: ['Auto-rickshaw double parking', 'Pedestrian crossing queue'],
    recommendedAction: 'Clear auto-bay obstruction & optimize signal cycle',
    affectedRoutes: ['R-04']
  },
  {
    id: 'TH-03',
    locationName: 'NH-48 Express Expressway Toll Slip',
    congestionLevel: 'CRITICAL',
    avgDelayMin: 22,
    vehiclesPerHour: 4120,
    speedKm: 9,
    lat: 28.4890,
    lng: 77.0710,
    causes: ['Heavy commercial vehicle bottleneck', 'Waterlogging at slip road'],
    recommendedAction: 'Divert heavy trucks to peripheral bypass',
    affectedRoutes: ['R-06', 'R-01']
  }
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-701',
    code: 'INC-701',
    type: 'POTENTIAL_HIT_RUN',
    title: 'Potential Hit & Run Involving Sedan',
    vehicleType: 'White Commercial Sedan',
    plateNumber: 'HR26XX0000',
    ocrConfidence: 91.4,
    detectionConfidence: 88.2,
    lat: 28.4595,
    lng: 77.0266,
    address: 'Golf Course Road, Sector 43',
    timestamp: '14:37:21',
    busId: 'BUS-104',
    routeId: 'R-07',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    status: 'AWAITING_VERIFICATION',
    riskLevel: 'CRITICAL'
  },
  {
    id: 'INC-702',
    code: 'INC-702',
    type: 'PEDESTRIAN_HAZARD',
    title: 'School Zone Pedestrian Proximity Alert',
    vehicleType: 'Heavy Tipper Truck',
    plateNumber: 'HR51AB4291',
    ocrConfidence: 88.7,
    detectionConfidence: 94.0,
    lat: 28.4411,
    lng: 77.0890,
    address: 'School Zone A, Sector 56',
    timestamp: '13:12:05',
    busId: 'BUS-212',
    routeId: 'R-02',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80',
    status: 'VERIFIED',
    riskLevel: 'HIGH',
    verifiedBy: 'Officer V. Sharma (Traffic Operator)',
    actionTaken: 'Flagged to PCR Van #12'
  },
  {
    id: 'INC-703',
    code: 'INC-703',
    type: 'RASH_DRIVING',
    title: 'Reckless Lane Weaving by Two-Wheeler',
    vehicleType: 'Motorcycle',
    plateNumber: 'DL03CD9912',
    ocrConfidence: 85.3,
    detectionConfidence: 86.9,
    lat: 28.4680,
    lng: 77.0180,
    address: 'Old Delhi Road',
    timestamp: '11:45:10',
    busId: 'BUS-340',
    routeId: 'R-03',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    status: 'AWAITING_VERIFICATION',
    riskLevel: 'MEDIUM'
  }
];

export const MOCK_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'ACT-01',
    defectId: 'DEF-10482',
    code: 'UP-10482',
    title: 'Priority Road Inspection & Patching',
    location: 'Golf Course Road, Opp. Rapid Metro Pillar 142',
    lat: 28.4595,
    lng: 77.0266,
    priority: 'HIGH',
    evidenceCount: 3,
    assignedDept: 'Road Maintenance',
    slaHours: 24,
    hoursElapsed: 4,
    status: 'ASSIGNED',
    createdAt: '2026-08-28T10:42:00+05:30',
    updatedAt: '2026-08-28T12:20:00+05:30',
    assignedTo: 'Engineer R. K. Gupta',
    notes: 'Dispatched maintenance truck with quick-dry cold asphalt mix.'
  },
  {
    id: 'ACT-02',
    defectId: 'DEF-10483',
    code: 'UP-10483',
    title: 'Emergency Drainage Pump Deployment',
    location: 'Subhash Chowk Underpass',
    lat: 28.4310,
    lng: 77.0420,
    priority: 'CRITICAL',
    evidenceCount: 2,
    assignedDept: 'Municipal Corp',
    slaHours: 12,
    hoursElapsed: 6,
    status: 'INSPECTION',
    createdAt: '2026-08-28T09:15:00+05:30',
    updatedAt: '2026-08-28T11:45:00+05:30',
    assignedTo: 'Superintendent A. Singh'
  },
  {
    id: 'ACT-03',
    defectId: 'DEF-10484',
    code: 'UP-10484',
    title: 'Clear Central Concrete Barrier Obstruction',
    location: 'Old Delhi Road near Sector 14',
    lat: 28.4680,
    lng: 77.0180,
    priority: 'HIGH',
    evidenceCount: 1,
    assignedDept: 'Traffic Division',
    slaHours: 24,
    hoursElapsed: 9,
    status: 'NEW',
    createdAt: '2026-08-28T08:45:00+05:30',
    updatedAt: '2026-08-28T08:45:00+05:30'
  },
  {
    id: 'ACT-04',
    defectId: 'DEF-10480',
    code: 'UP-10480',
    title: 'Re-align Obscured Traffic Light',
    location: 'Rajiv Chowk Crossing',
    lat: 28.4550,
    lng: 77.0320,
    priority: 'MEDIUM',
    evidenceCount: 4,
    assignedDept: 'Traffic Division',
    slaHours: 48,
    hoursElapsed: 44,
    status: 'RESOLVED',
    createdAt: '2026-08-27T16:00:00+05:30',
    updatedAt: '2026-08-28T10:00:00+05:30',
    notes: 'Signal arm straightened and tree branches trimmed.'
  }
];

export const HOURLY_TRAFFIC_DATA = [
  { hour: '06:00', density: 24, speed: 48, events: 42 },
  { hour: '08:00', density: 78, speed: 22, events: 198 },
  { hour: '10:00', density: 92, speed: 14, events: 340 },
  { hour: '12:00', density: 65, speed: 28, events: 215 },
  { hour: '14:00', density: 58, speed: 32, events: 180 },
  { hour: '16:00', density: 74, speed: 24, events: 290 },
  { hour: '18:00', density: 96, speed: 11, events: 410 },
  { hour: '20:00', density: 60, speed: 30, events: 167 },
];

export const VEHICLE_DISTRIBUTION_DATA = [
  { name: 'Cars', count: 12450, percentage: 48, color: '#3B82F6' },
  { name: 'Bikes & Two-Wheelers', count: 7200, percentage: 28, color: '#10B981' },
  { name: 'Buses', count: 2100, percentage: 8, color: '#F59E0B' },
  { name: 'Auto-Rickshaws', count: 2600, percentage: 10, color: '#8B5CF6' },
  { name: 'Trucks & Commercial', count: 1550, percentage: 6, color: '#EF4444' },
];

export const DEMO_PRESENTATION_STEPS: DemoStep[] = [
  {
    step: 1,
    title: 'Mobile Sensing Node Active',
    description: 'BUS-104 moves along Route R-07 on Golf Course Road, streaming real-time edge telemetry.',
    targetTab: 'fleet',
    actionLabel: 'Track BUS-104 Node',
    busId: 'BUS-104'
  },
  {
    step: 2,
    title: 'Edge AI Optical Anomaly Detection',
    description: 'Onboard computer vision model detects deep road pothole surface hazard at 24 FPS.',
    targetTab: 'vision',
    actionLabel: 'Inspect Vision Feed'
  },
  {
    step: 3,
    title: 'Geo-Tagged AI Observation (94%)',
    description: 'Lightweight encrypted metadata packet created (Lat: 28.4595, Lng: 77.0266, Confidence: 94.2%).',
    targetTab: 'map',
    actionLabel: 'View Map Geotag',
    defectId: 'DEF-10482'
  },
  {
    step: 4,
    title: 'Second Fleet Vehicle Passes (BUS-117)',
    description: 'BUS-117 navigates the same corridor 15 minutes later and captures Sighting #2.',
    targetTab: 'fusion',
    actionLabel: 'Open Evidence Fusion'
  },
  {
    step: 5,
    title: 'Spatial & Temporal Correlation Engine',
    description: 'Multi-Pass Evidence Fusion identifies spatial proximity (Δd = 3.2m < 15.0m threshold).',
    targetTab: 'fusion',
    actionLabel: 'Examine Correlation'
  },
  {
    step: 6,
    title: 'Independent Confirmation (BUS-131)',
    description: 'BUS-131 provides Sighting #3, eliminating false positive risk.',
    targetTab: 'fusion',
    actionLabel: 'View 3-Sighting Matrix'
  },
  {
    step: 7,
    title: 'System Creates Verified Urban Issue',
    description: 'Bayesian evidence fusion escalates confidence to 96.7% for single physical pothole UP-10482.',
    targetTab: 'events',
    actionLabel: 'View Verified Event'
  },
  {
    step: 8,
    title: 'Automated Priority Engine Evaluation',
    description: 'Evaluates corridor traffic volume (2,450 veh/hr), road class, and multi-vehicle risk.',
    targetTab: 'hotspots',
    actionLabel: 'Inspect Priority Score'
  },
  {
    step: 9,
    title: 'Priority Score Assigned: HIGH',
    description: 'Priority score calculated automatically based on urban safety impact matrix.',
    targetTab: 'events',
    actionLabel: 'Review Priority'
  },
  {
    step: 10,
    title: 'Smart Automation Recommendation',
    description: 'System recommends: "Create Maintenance Work Order & Dispatch Municipal Team 04".',
    targetTab: 'actions',
    actionLabel: 'Review Recommendation'
  },
  {
    step: 11,
    title: 'Authority Approval & Oversight',
    description: 'Transport Authority reviews evidence packet and approves automated work order.',
    targetTab: 'actions',
    actionLabel: 'Approve Automation'
  },
  {
    step: 12,
    title: 'Work Order Auto-Generated (WO-58291)',
    description: 'Work Order WO-58291 generated with 24-hour SLA response window.',
    targetTab: 'actions',
    actionLabel: 'View Work Order WO-58291'
  },
  {
    step: 13,
    title: 'Assigned to Maintenance Team 04',
    description: 'Work order routed directly to Road Maintenance Field Officer mobile workflow.',
    targetTab: 'field_officer',
    actionLabel: 'Open Field Officer View'
  },
  {
    step: 14,
    title: 'Quantified Smart Automation Impact',
    description: 'Detection time: 12 min • Manual inspection avoided: Yes • 3 Independent Observations • SLA Active.',
    targetTab: 'analytics',
    actionLabel: 'View Impact Analytics',
    impactMetrics: {
      detectionTimeMin: 12,
      manualInspectionAvoided: true,
      observationsCount: 3
    }
  }
];

