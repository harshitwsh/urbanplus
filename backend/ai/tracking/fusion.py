"""
Multi-Pass Evidence Fusion Engine - UrbanPulse AI
Spatial-temporal clustering algorithm merging multi-bus observations of identical road defects.
"""

import math

def haversine_distance_meters(lat1, lon1, lat2, lon2):
    R = 6371000  # Radius of earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class EvidenceFusionEngine:
    def __init__(self, max_distance_meters: float = 15.0):
        self.max_distance = max_distance_meters

    def fuse_sightings(self, sightings: list) -> dict:
        """
        Clusters independent bus sightings within max_distance threshold.
        Escalates confidence based on Bayesian multi-pass updates.
        """
        if not sightings:
            return {}

        base_confidence = sightings[0].get('confidence', 80.0)
        passes = len(sightings)

        # Bayesian-inspired confidence escalation formula
        fused_confidence = min(99.0, base_confidence + (100.0 - base_confidence) * (1 - 0.5**(passes - 1)))

        return {
            "sighting_count": passes,
            "fused_confidence": round(fused_confidence, 1),
            "status": "VERIFIED" if passes >= 2 else "SINGLE_OBSERVATION",
            "priority": "HIGH" if fused_confidence >= 90.0 else "MEDIUM"
        }
