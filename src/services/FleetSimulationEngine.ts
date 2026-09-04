import { Bus } from '../types/urbanpulse';

export interface RouteWaypoints {
  routeId: string;
  routeName: string;
  waypoints: [number, number][]; // [lat, lng]
}

// Actual geographic corridor waypoints around Gurugram, Haryana, India
export const GURUGRAM_ROUTES: RouteWaypoints[] = [
  {
    routeId: 'R-07',
    routeName: 'Route 07: Golf Course Road ↔ Cyber City',
    waypoints: [
      [28.4595, 77.0266],
      [28.4632, 77.0345],
      [28.4680, 77.0420],
      [28.4755, 77.0512],
      [28.4820, 77.0620],
      [28.4890, 77.0750],
      [28.4950, 77.0890]
    ]
  },
  {
    routeId: 'R-04',
    routeName: 'Route 04: MG Road ↔ IFFCO Chowk',
    waypoints: [
      [28.4780, 77.0850],
      [28.4750, 77.0780],
      [28.4720, 77.0725],
      [28.4690, 77.0650],
      [28.4640, 77.0550],
      [28.4595, 77.0266]
    ]
  },
  {
    routeId: 'R-02',
    routeName: 'Route 02: Golf Course Ext ↔ Rajiv Chowk',
    waypoints: [
      [28.4350, 77.0950],
      [28.4411, 77.0890],
      [28.4480, 77.0720],
      [28.4520, 77.0510],
      [28.4550, 77.0320]
    ]
  },
  {
    routeId: 'R-01',
    routeName: 'Route 01: Railway Station ↔ Sector 14',
    waypoints: [
      [28.4780, 77.0250],
      [28.4722, 77.0451],
      [28.4650, 77.0520],
      [28.4595, 77.0266]
    ]
  }
];

export class FleetSimulationEngine {
  private buses: Map<string, { bus: Bus; routeIdx: number; waypointIdx: number; progress: number }>;

  constructor(initialBuses: Bus[]) {
    this.buses = new Map();
    initialBuses.forEach((bus) => {
      this.buses.set(bus.id, {
        bus: { ...bus },
        routeIdx: 0,
        waypointIdx: 0,
        progress: 0.0
      });
    });
  }

  // Calculate bearing/heading between two lat/lng points
  private calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const y = Math.sin(dLng) * Math.cos(lat2 * (Math.PI / 180));
    const x =
      Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
      Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLng);
    let brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  }

  // Move buses forward along route waypoints
  public stepSimulation(): Bus[] {
    const updatedList: Bus[] = [];

    this.buses.forEach((state, busId) => {
      const routeConfig = GURUGRAM_ROUTES.find((r) => r.routeId === state.bus.routeId) || GURUGRAM_ROUTES[0];
      const waypoints = routeConfig.waypoints;

      let currIdx = state.waypointIdx;
      let nextIdx = (currIdx + 1) % waypoints.length;

      const p1 = waypoints[currIdx];
      const p2 = waypoints[nextIdx];

      // Advance progress smoothly
      state.progress += 0.15;
      if (state.progress >= 1.0) {
        state.progress = 0.0;
        state.waypointIdx = nextIdx;
        currIdx = nextIdx;
        nextIdx = (currIdx + 1) % waypoints.length;
      }

      // Interpolate geographic coordinates
      const currentP1 = waypoints[currIdx];
      const currentP2 = waypoints[nextIdx];
      const interpolatedLat = currentP1[0] + (currentP2[0] - currentP1[0]) * state.progress;
      const interpolatedLng = currentP1[1] + (currentP2[1] - currentP1[1]) * state.progress;

      const heading = this.calculateHeading(currentP1[0], currentP1[1], currentP2[0], currentP2[1]);
      const speed = Math.round(28 + Math.random() * 12); // 28-40 km/h

      const updatedBus: Bus = {
        ...state.bus,
        lat: interpolatedLat,
        lng: interpolatedLng,
        heading: Math.round(heading),
        speed: speed,
        lastSync: 'Just Now'
      };

      state.bus = updatedBus;
      updatedList.push(updatedBus);
    });

    return updatedList;
  }
}
