from pydantic import BaseModel
from typing import List, Optional

class EventPayload(BaseModel):
    bus_id: str
    route_id: str
    event_type: str
    latitude: float
    longitude: float
    confidence: float
    timestamp: str

class FusionRequest(BaseModel):
    latitude: float
    longitude: float
    time_window_mins: int = 30
    spatial_radius_meters: float = 15.0

class VerifyIncidentPayload(BaseModel):
    action: str  # VERIFIED, REJECTED, ESCALATED
    verifier_role: str
    comments: Optional[str] = None
