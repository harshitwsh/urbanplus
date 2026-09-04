import { RoadSegmentCoverage } from '../types/urbanpulse';

export const GURUGRAM_ROAD_COVERAGE_NETWORK: RoadSegmentCoverage[] = [
  {
    id: 'ROAD-MG-ROAD',
    roadName: 'MG Road (Maharma Gandhi Road Corridor)',
    coverageStatus: 'GREEN',
    lastMonitoredMinutesAgo: 4,
    activeMobileUnitsCount: 14,
    coordinates: [
      [28.4817, 77.0869],
      [28.4752, 77.0812],
      [28.4688, 77.0754],
      [28.4623, 77.0691],
      [28.4556, 77.0628],
      [28.4491, 77.0565]
    ]
  },
  {
    id: 'ROAD-[#GOLFLINKS]',
    roadName: 'Golf Course Road Expressway',
    coverageStatus: 'GREEN',
    lastMonitoredMinutesAgo: 11,
    activeMobileUnitsCount: 9,
    coordinates: [
      [28.4912, 77.0988],
      [28.4835, 77.0956],
      [28.4721, 77.0921],
      [28.4610, 77.0895],
      [28.4485, 77.0872]
    ]
  },
  {
    id: 'ROAD-NH48',
    roadName: 'NH-48 Delhi-Gurugram Expressway',
    coverageStatus: 'GREEN',
    lastMonitoredMinutesAgo: 2,
    activeMobileUnitsCount: 22,
    coordinates: [
      [28.5025, 77.0821],
      [28.4901, 77.0674],
      [28.4785, 77.0531],
      [28.4612, 77.0398],
      [28.4421, 77.0254]
    ]
  },
  {
    id: 'ROAD-SECTOR56',
    roadName: 'Sector 56 - HUDA City Center Link',
    coverageStatus: 'YELLOW',
    lastMonitoredMinutesAgo: 48,
    activeMobileUnitsCount: 3,
    coordinates: [
      [28.4452, 77.0921],
      [28.4510, 77.0845],
      [28.4589, 77.0721],
      [28.4612, 77.0645]
    ]
  },
  {
    id: 'ROAD-CYBER-CITY',
    roadName: 'DLF Cyber City Loop Road',
    coverageStatus: 'GREEN',
    lastMonitoredMinutesAgo: 8,
    activeMobileUnitsCount: 11,
    coordinates: [
      [28.4952, 77.0885],
      [28.4988, 77.0912],
      [28.4965, 77.0955],
      [28.4915, 77.0925],
      [28.4952, 77.0885]
    ]
  },
  {
    id: 'ROAD-OLD-DELHI-ROAD',
    roadName: 'Old Delhi Road (Sector 14 Connection)',
    coverageStatus: 'YELLOW',
    lastMonitoredMinutesAgo: 85,
    activeMobileUnitsCount: 2,
    coordinates: [
      [28.4789, 77.0421],
      [28.4856, 77.0498],
      [28.4923, 77.0565],
      [28.5012, 77.0641]
    ]
  },
  {
    id: 'ROAD-SOBNA-ROAD',
    roadName: 'Sohna Road Corridor (Subhash Chowk - Badshahpur)',
    coverageStatus: 'RED',
    lastMonitoredMinutesAgo: 145,
    activeMobileUnitsCount: 0,
    coordinates: [
      [28.4421, 77.0345],
      [28.4312, 77.0389],
      [28.4189, 77.0432],
      [28.4056, 77.0489]
    ]
  },
  {
    id: 'ROAD-DWARKA-EXPRESSWAY',
    roadName: 'Dwarka Expressway Sector 102 Bypass',
    coverageStatus: 'RED',
    lastMonitoredMinutesAgo: 190,
    activeMobileUnitsCount: 0,
    coordinates: [
      [28.4989, 76.9921],
      [28.4856, 76.9856],
      [28.4712, 76.9789],
      [28.4589, 76.9721]
    ]
  }
];

export function getRoadCoverageSummary() {
  const total = GURUGRAM_ROAD_COVERAGE_NETWORK.length;
  const green = GURUGRAM_ROAD_COVERAGE_NETWORK.filter(r => r.coverageStatus === 'GREEN').length;
  const yellow = GURUGRAM_ROAD_COVERAGE_NETWORK.filter(r => r.coverageStatus === 'YELLOW').length;
  const red = GURUGRAM_ROAD_COVERAGE_NETWORK.filter(r => r.coverageStatus === 'RED').length;
  const percentage = Math.round(((green + yellow * 0.5) / total) * 100);

  return {
    percentage,
    greenCount: green,
    yellowCount: yellow,
    redCount: red,
    totalSegments: total,
    activeMobileUnits: 48,
    fixedCameras: 320,
    unmonitoredSegments: red
  };
}
