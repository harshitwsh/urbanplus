import { CitizenReport, DefectType, EventSeverity } from '../types/urbanpulse';
import { db, storage } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class CitizenReportService {
  private static COLLECTION_NAME = 'incidents';

  // Haversine distance formula in meters
  public static calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Check for potential duplicate reports within 50m radius and same type
  public static findNearbyDuplicates(
    existingReports: CitizenReport[],
    lat: number,
    lng: number,
    type: DefectType,
    radiusMeters: number = 50
  ): CitizenReport[] {
    return existingReports.filter((report) => {
      const distance = this.calculateDistanceMeters(lat, lng, report.lat, report.lng);
      return distance <= radiusMeters && report.type === type && report.status !== 'Resolved';
    });
  }

  // Generate unique Report ID: UP-2026-XXXXX
  public static generateReportId(): string {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `UP-2026-${randomNum}`;
  }

  // Upload image to Firebase Storage (or fallback data URL)
  public static async uploadEvidenceImage(reportId: string, fileOrDataUrl: File | string): Promise<string> {
    try {
      if (typeof fileOrDataUrl === 'string') {
        // Data URL
        return fileOrDataUrl;
      }
      const storageRef = ref(storage, `evidence/${reportId}_${Date.now()}_${fileOrDataUrl.name}`);
      const snapshot = await uploadBytes(storageRef, fileOrDataUrl);
      return await getDownloadURL(snapshot.ref);
    } catch (err) {
      console.warn('Firebase Storage upload fallback:', err);
      return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : URL.createObjectURL(fileOrDataUrl);
    }
  }

  // Submit Citizen Report to Firestore
  public static async submitReport(reportData: Partial<CitizenReport>): Promise<CitizenReport> {
    const reportId = this.generateReportId();
    const nowISO = new Date().toISOString();

    const fullReport: CitizenReport = {
      id: reportId,
      type: reportData.type || 'pothole',
      title: reportData.title || `${(reportData.type || 'Urban Hazard').replace('_', ' ').toUpperCase()} Reported`,
      description: reportData.description || 'Reported via Citizen Public Reporting Mobile Portal.',
      images: reportData.images && reportData.images.length > 0 
        ? reportData.images 
        : ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80'],
      lat: reportData.lat || 28.4595,
      lng: reportData.lng || 77.0266,
      locationName: reportData.locationName || 'Gurugram Urban Corridor',
      severity: reportData.severity || 'HIGH',
      status: 'Reported',
      source: 'citizen',
      reporterId: reportData.reporterId || 'ANON_CITIZEN',
      reporterEmail: reportData.reporterEmail || 'citizen@gurugram.gov.in',
      createdAt: nowISO,
      updatedAt: nowISO,
      assignedDepartment: 'Road Maintenance Dept',
      verified: false
    };

    try {
      const docRef = doc(db, this.COLLECTION_NAME, reportId);
      await setDoc(docRef, {
        ...fullReport,
        firestoreTimestamp: serverTimestamp()
      });
      console.log('🔥 CITIZEN REPORT FIRESTORE SYNC SUCCESS:', reportId);
    } catch (err) {
      console.warn('Firestore write fallback:', err);
    }

    return fullReport;
  }

  // Real-time Firestore Listener for Government Dashboard Sync
  public static subscribeToRealtimeIncidents(callback: (reports: CitizenReport[]) => void): () => void {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const reports: CitizenReport[] = [];
        snapshot.forEach((docSnap) => {
          reports.push(docSnap.data() as CitizenReport);
        });
        callback(reports);
      }, (err) => {
        console.warn('Firestore real-time listener subscription fallback:', err);
      });
    } catch (err) {
      console.warn('Firestore realtime listener error:', err);
      return () => {};
    }
  }

  // Update Status in Firestore
  public static async updateReportStatus(reportId: string, status: CitizenReport['status'], assignedDept?: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, reportId);
      await updateDoc(docRef, {
        status: status,
        updatedAt: new Date().toISOString(),
        ...(assignedDept ? { assignedDepartment: assignedDept } : {})
      });
    } catch (err) {
      console.warn('Firestore update fallback:', err);
    }
  }
}
