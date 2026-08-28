"""
Vehicle Detection & Traffic Density Module - UrbanPulse AI
Calculates real-time transit volume and modal split (cars, bikes, buses, trucks).
"""

class TrafficDensityCalculator:
    def __init__(self):
        pass

    def compute_density(self, vehicle_counts: dict, transit_speed_kmh: float) -> dict:
        total = sum(vehicle_counts.values())
        congestion = "LOW"
        if total > 50 or transit_speed_kmh < 15:
            congestion = "HIGH"
        elif total > 25:
            congestion = "MEDIUM"

        return {
            "total_vehicles": total,
            "congestion_level": congestion,
            "average_speed": transit_speed_kmh
        }
