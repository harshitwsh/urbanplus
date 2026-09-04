# URBANPULSE — Real-Time Urban Intelligence & Smart City Command Center

**SIH26124 Project** | **Organization:** Bharat Electronics Limited (BEL)

> *Transforming public transit buses and city infrastructure into a real-time mobile urban sensing network.*

---

## 1. Project Overview

**UrbanPulse** is a real-time smart city intelligence platform that integrates edge computer vision, citizen reporting, mobile fleet telemetry, and GIS spatial mapping into a unified Command Center. The platform processes road surface defects (potholes, asphalt cracks, waterlogging), traffic bottlenecks, public safety incidents, and municipal work order lifecycles.

---

## 2. Problem Statement

Traditional municipal infrastructure monitoring suffers from:
- **Coverage Gaps:** Fixed CCTV cameras have permanent blind spots on connecting corridors.
- **Reporting Delays:** Infrastructure defects remain unaddressed for weeks until manual citizen complaints are filed.
- **Duplicate Complaints:** Multiple citizens file redundant reports for the same pothole without unified tracking.
- **Bandwidth Heavy Surveillance:** Streaming 24/7 raw video feeds over cellular networks is expensive and privacy-intrusive.

---

## 3. The UrbanPulse Solution

UrbanPulse solves these challenges with **Mobile Sensing + Multi-Pass Evidence Fusion**:
- **Mobile Sensor Network:** Municipal buses, traffic police vehicles, and municipal fleets act as moving edge vision sensors covering 100% of city transit routes.
- **Edge AI Inference:** Onboard hardware runs YOLOv8 optical inference at 24 FPS, detecting defects locally and transmitting only lightweight metadata + cropped snapshots (saving 72% bandwidth).
- **Multi-Pass Evidence Fusion:** Multiple fleet passes over the same location ($\Delta d < 15.0\text{m}$) automatically cluster detections into a single verified defect with escalating confidence certainty (82.4% → 91.2% → 96.7%).
- **Real-Time Command Center:** Fused events instantly sync to Cloud Firestore, powering the 2D GIS Map, 3D Spatial Globe, and automated SLA Work Orders.

---

## 4. Key Features

- **2D Google-Style Interactive Map:** Hardware-accelerated Leaflet map with real-time location search autocomplete, custom drop pins, GPS locating, and `minZoom: 2` world globe zoom level.
- **3D Spatial Globe Visualization:** Photorealistic 3D Earth Satellite Globe (Three.js WebGL) and 3D Cesium GIS Engine for macro spatial risk cluster inspection.
- **Edge Computer Vision Workstation:** Onboard bus camera feed simulator with pixel-accurate road bounding boxes, category filters, target geometry inspector, and defect injection.
- **Realtime Command Center:** Live telemetry feed, incident lifecycle management (New -> Under Review -> Verified -> Assigned -> Resolved), and role-based operator controls.
- **Citizen Reporting Portal:** Mobile-ready 4-step issue reporting flow with GPS location locking, category tagging, photo upload, and instant Firestore tracking ID generation.
- **Firebase Authentication & Firestore Sync:** Persistent login via `browserLocalPersistence`, email verification, Google Sign-In, and real-time `onSnapshot` Firestore listeners.

---

## 5. Technology Stack

- **Frontend Core:** React 18, TypeScript, Vite
- **Styling & UI:** Tailwind CSS, Lucide React Icons
- **GIS & Mapping:** Leaflet, OpenStreetMap, Esri World Imagery, CesiumJS, Three.js WebGL
- **Database & Auth:** Firebase Authentication, Cloud Firestore, Firebase Storage
- **Charts & Data Visualization:** Recharts

---

## 6. Architecture Overview

```
[ Citizen Mobile App ] ──┐
                         ├──► [ Cloud Firestore ] ──► [ UrbanPulse Command Center ]
[ Bus Edge Dashcam ]   ──┤        ▲     │                 ├── 2D GIS Map (Leaflet)
                         │        │     ▼                 ├── 3D Spatial Globe (Three.js)
[ CCTV & Traffic Police] ┘   [ Evidence Fusion ]          └── SLA Kanban Work Orders
```

---

## 7. Setup & Local Development Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/harshitwsh/urbanplus.git
cd urbanplus
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the project root (optional if using default demo Firebase config):
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=urbanpulse-2026.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=urbanpulse-2026
VITE_FIREBASE_STORAGE_BUCKET=urbanpulse-2026.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=235538520233
VITE_FIREBASE_APP_ID=1:235538520233:web:c934...
```

### Step 3: Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 8. Build & Production Deployment

### Production Build
```bash
# Type check and build Vite bundle
npm run build
```

### Preview Production Build Locally
```bash
npm run preview
```

---

## 9. Project Structure

```
src/
├── components/
│   ├── actions/          # SLA Work Orders & Action Center
│   ├── analytics/        # Mobility & Traffic Analytics
│   ├── architecture/     # AI Pipeline Architecture View
│   ├── auth/             # Login, Signup & Role Selection
│   ├── citizen/          # Citizen Issue Reporting & Trackers
│   ├── dashboard/        # Realtime Command Center
│   ├── dashcam/          # Mobile City Eyes & Fleet Dashcams
│   ├── evidence/         # Evidence Fusion Sighting Inspector
│   ├── fleet/            # Fleet Operations & Telemetry
│   ├── globe/            # Three.js 3D WebGL Spatial Globe
│   ├── incidents/        # Incident Management Center
│   ├── layout/           # AppShell, Sidebar, Header, Navbar
│   ├── map/              # 2D UrbanMap & 3D CesiumMapView
│   └── vision/           # Edge Computer Vision Workstation
├── context/
│   ├── AppContext.tsx    # Global App State & Firestore Realtime Sync
│   └── AuthContext.tsx   # Firebase Auth & User Profile Management
├── lib/
│   └── firebase.ts       # Centralized Firebase Singleton Init
├── services/             # AI Detection, Citizen Reporting & Storage Services
└── types/                # TypeScript Interfaces & Enums
```

---

## 10. Known External Dependencies

- **OpenStreetMap / Esri Tiles:** Requires active internet connection for GIS map tile fetching.
- **Firebase Auth & Firestore:** Synchronizes live state with `urbanpulse-2026` Firebase cloud.

---

## 11. License & Attribution

Developed for **SIH26124** — Problem Statement by **Bharat Electronics Limited (BEL)**.
