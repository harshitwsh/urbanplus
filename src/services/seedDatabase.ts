import { 
  collection, 
  getDocs, 
  doc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  MOCK_BUSES, 
  MOCK_ROAD_DEFECTS, 
  MOCK_INCIDENTS, 
  MOCK_ACTION_ITEMS, 
  MOCK_TRAFFIC_HOTSPOTS 
} from '../data/mockData';

export interface SeedStatus {
  seeded: boolean;
  busesCount: number;
  eventsCount: number;
  incidentsCount: number;
  workOrdersCount: number;
  trafficCount: number;
  alertsCount: number;
  message: string;
}

/**
 * Checks whether Firestore collections exist and seeds initial smart city dataset if empty
 */
export const seedFirestoreIfEmpty = async (): Promise<SeedStatus> => {
  try {
    const vehiclesCol = collection(db, 'vehicles');
    const existingVehicles = await getDocs(vehiclesCol);

    if (!existingVehicles.empty) {
      return {
        seeded: false,
        busesCount: existingVehicles.size,
        eventsCount: 0,
        incidentsCount: 0,
        workOrdersCount: 0,
        trafficCount: 0,
        alertsCount: 0,
        message: 'Firestore already populated with live operational data.'
      };
    }

    // Database is empty, execute full batch seed
    return await forceSeedFirestore();
  } catch (error: any) {
    console.error('Error checking/seeding Firestore:', error);
    return {
      seeded: false,
      busesCount: 0,
      eventsCount: 0,
      incidentsCount: 0,
      workOrdersCount: 0,
      trafficCount: 0,
      alertsCount: 0,
      message: `Seed check note: ${error?.message || error}`
    };
  }
};

/**
 * Force write / populate initial UrbanPulse dataset to Firestore across all required collections:
 * - vehicles & buses
 * - roadDefects & events
 * - incidents
 * - trafficEvents & trafficHotspots
 * - alerts
 * - actions & workOrders
 */
export const forceSeedFirestore = async (): Promise<SeedStatus> => {
  const batch = writeBatch(db);

  // 1. Seed /vehicles and /buses with Gurugram GPS coordinates
  MOCK_BUSES.forEach((bus) => {
    const vehicleRef = doc(db, 'vehicles', bus.id);
    const busRef = doc(db, 'buses', bus.id);
    const payload = {
      ...bus,
      updatedAt: new Date().toISOString()
    };
    batch.set(vehicleRef, payload);
    batch.set(busRef, payload);
  });

  // 2. Seed /roadDefects and /events (Road Potholes & Hazards in Gurugram)
  MOCK_ROAD_DEFECTS.forEach((defect) => {
    const rdRef = doc(db, 'roadDefects', defect.id);
    const evRef = doc(db, 'events', defect.id);
    const payload = { ...defect, updatedAt: new Date().toISOString() };
    batch.set(rdRef, payload);
    batch.set(evRef, payload);
  });

  // 3. Seed /incidents (AI Detected Incidents in Gurugram)
  MOCK_INCIDENTS.forEach((incident) => {
    const incRef = doc(db, 'incidents', incident.id);
    batch.set(incRef, {
      ...incident,
      updatedAt: new Date().toISOString()
    });
  });

  // 4. Seed /trafficEvents and /trafficHotspots (Traffic Congestion in Gurugram Corridors)
  MOCK_TRAFFIC_HOTSPOTS.forEach((spot) => {
    const teRef = doc(db, 'trafficEvents', spot.id);
    const thRef = doc(db, 'trafficHotspots', spot.id);
    const payload = { ...spot, updatedAt: new Date().toISOString() };
    batch.set(teRef, payload);
    batch.set(thRef, payload);
  });

  // 5. Seed /alerts (Real-Time Urban Alerts)
  const sampleAlerts = [
    {
      id: 'ALT-101',
      title: 'Critical Pothole Cluster Detected',
      description: 'Multiple buses confirmed severe road hazard near Golf Course Rd Rapid Metro Pillar 42.',
      type: 'CRITICAL_HAZARD',
      severity: 'CRITICAL',
      location: 'Golf Course Road, Gurugram',
      lat: 28.4595,
      lng: 77.0266,
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 'ALT-102',
      title: 'Heavy Traffic Bottleneck',
      description: 'Traffic speed dropped below 14 km/h along Cyber City Underpass corridor.',
      type: 'TRAFFIC_ALERT',
      severity: 'HIGH',
      location: 'Cyber City, Gurugram',
      lat: 28.4950,
      lng: 77.0890,
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 'ALT-103',
      title: 'Hit & Run Suspect Flagged',
      description: 'Vision sensor on BUS-104 detected hazardous collision vehicle HR26-DK-9012.',
      type: 'INCIDENT_ALERT',
      severity: 'CRITICAL',
      location: 'IFFCO Chowk, Gurugram',
      lat: 28.4720,
      lng: 77.0725,
      timestamp: new Date().toISOString(),
      read: false
    }
  ];

  sampleAlerts.forEach((alert) => {
    const altRef = doc(db, 'alerts', alert.id);
    batch.set(altRef, alert);
  });

  // 6. Seed /actions & /workOrders
  MOCK_ACTION_ITEMS.forEach((item) => {
    const actRef = doc(db, 'actions', item.id);
    const woRef = doc(db, 'workOrders', item.id);
    const payload = { ...item, updatedAt: new Date().toISOString() };
    batch.set(actRef, payload);
    batch.set(woRef, payload);
  });

  await batch.commit();

  return {
    seeded: true,
    busesCount: MOCK_BUSES.length,
    eventsCount: MOCK_ROAD_DEFECTS.length,
    incidentsCount: MOCK_INCIDENTS.length,
    workOrdersCount: MOCK_ACTION_ITEMS.length,
    trafficCount: MOCK_TRAFFIC_HOTSPOTS.length,
    alertsCount: sampleAlerts.length,
    message: 'Successfully seeded Gurugram operational dataset into Firestore collections (vehicles, incidents, roadDefects, trafficEvents, alerts).'
  };
};
