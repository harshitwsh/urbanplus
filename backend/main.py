"""
URBANPULSE AI — FastAPI Backend Server
Bharat Electronics Limited (BEL) Urban Technology Division
SIH26124 Prototype REST API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Dict, Any, List

from models import EventPayload, FusionRequest, VerifyIncidentPayload
from ai.tracking.fusion import EvidenceFusionEngine

app = FastAPI(
    title="URBANPULSE AI — Mobile Urban Intelligence API",
    description="Bharat Electronics Limited (BEL) Urban Sensing Platform Backend",
    version="2.4.0"
)

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fusion_engine = EvidenceFusionEngine(max_distance_meters=15.0)

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "platform": "URBANPULSE AI",
        "organization": "Bharat Electronics Limited (BEL)",
        "active_nodes": 124,
        "bandwidth_saved": "72%"
    }

@app.get("/api/buses")
def get_buses():
    return [
        {
            "id": "BUS-104",
            "route_id": "R-07",
            "status": "ACTIVE",
            "lat": 28.4595,
            "lng": 77.0266,
            "speed": 34,
            "ai_status": "EDGE ONLINE",
            "last_sync": "12 sec ago",
            "events_count": 27,
            "camera_health": {"front": True, "rear": True, "left": True, "right": True}
        },
        {
            "id": "BUS-117",
            "route_id": "R-04",
            "status": "ACTIVE",
            "lat": 28.4621,
            "lng": 77.0312,
            "speed": 28,
            "ai_status": "EDGE ONLINE",
            "last_sync": "8 sec ago",
            "events_count": 42,
            "camera_health": {"front": True, "rear": True, "left": True, "right": True}
        }
    ]

@app.get("/api/road-defects")
def get_road_defects():
    return [
        {
            "id": "DEF-10482",
            "code": "UP-10482",
            "type": "pothole",
            "title": "Severe Deep Pothole & Asphalt Degradation",
            "address": "Golf Course Road, Opp. Rapid Metro Pillar 142",
            "lat": 28.4595,
            "lng": 77.0266,
            "fusion_confidence": 96.7,
            "evidence_count": 3,
            "status": "OPEN",
            "assigned_dept": "Road Maintenance Dept"
        }
    ]

@app.post("/api/fusion/evaluate")
def evaluate_fusion(request: FusionRequest):
    # Simulated spatial fusion evaluation
    sample_sightings = [{"confidence": 82.4}, {"confidence": 91.2}, {"confidence": 96.7}]
    result = fusion_engine.fuse_sightings(sample_sightings)
    return {
        "spatial_radius_m": request.spatial_radius_meters,
        "fusion_result": result
    }

@app.post("/api/incidents/{incident_id}/verify")
def verify_incident(incident_id: str, payload: VerifyIncidentPayload):
    return {
        "incident_id": incident_id,
        "status": payload.action,
        "verified_by": payload.verifier_role,
        "timestamp": "2026-08-28T17:55:00+05:30"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
