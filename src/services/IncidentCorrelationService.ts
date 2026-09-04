import { CitizenReport, RoadDefect, IncidentCorrelation, IncidentSource } from '../types/urbanpulse';

// Calculate Haversine Distance in meters between two lat/lng points
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

/**
 * Correlate citizen reports and automated road defects/dashcam detections
 * Grouping incidents within 75 meters into unified Master Incident records.
 */
export function correlateUrbanIncidents(
  citizenReports: CitizenReport[],
  roadDefects: RoadDefect[]
): IncidentCorrelation[] {
  const correlated: IncidentCorrelation[] = [];
  const processedCitizenIds = new Set<string>();

  // Process road defects first
  roadDefects.forEach((defect) => {
    const matchingCitizenReports = citizenReports.filter((rep) => {
      if (processedCitizenIds.has(rep.id)) return false;
      const dist = calculateHaversineDistanceMeters(defect.lat, defect.lng, rep.lat, rep.lng);
      return dist <= 75; // 75 meters spatial window
    });

    matchingCitizenReports.forEach((rep) => processedCitizenIds.add(rep.id));

    const sources: IncidentSource[] = ['dashcam', 'ai_detection'];
    if (matchingCitizenReports.length > 0) {
      sources.push('citizen');
    }

    const images = [defect.imageUrl, ...matchingCitizenReports.flatMap((r) => r.images)].filter(Boolean);

    correlated.push({
      id: `CORR-${defect.id}`,
      masterCode: defect.code,
      primaryType: defect.type,
      lat: defect.lat,
      lng: defect.lng,
      locationName: defect.address || 'Urban Corridor',
      sources,
      citizenReportsCount: matchingCitizenReports.length,
      dashcamDetectionsCount: defect.evidenceCount || 1,
      highestConfidence: Math.max(defect.fusionConfidence || 95, 90),
      evidenceImages: Array.from(new Set(images)),
      status: defect.status,
      createdAt: defect.firstDetectedAt || defect.timestamp
    });
  });

  // Process remaining independent citizen reports
  citizenReports.forEach((rep) => {
    if (processedCitizenIds.has(rep.id)) return;

    correlated.push({
      id: `CORR-${rep.id}`,
      masterCode: rep.id,
      primaryType: rep.type,
      lat: rep.lat,
      lng: rep.lng,
      locationName: rep.locationName || 'Citizen Report Location',
      sources: ['citizen'],
      citizenReportsCount: 1,
      dashcamDetectionsCount: 0,
      highestConfidence: rep.verified ? 98 : 85,
      evidenceImages: rep.images,
      status: rep.status,
      createdAt: rep.createdAt
    });
  });

  return correlated;
}
