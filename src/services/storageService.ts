import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
  filename: string;
}

/**
 * Upload an evidence image for a specific event to Firebase Storage at evidence/{eventId}/{filename}
 */
export const uploadEvidenceImage = async (
  eventId: string,
  file: File | Blob,
  customFilename?: string
): Promise<UploadResult> => {
  const filename = customFilename || (file instanceof File ? file.name : `evidence_${Date.now()}.jpg`);
  const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storagePath = `evidence/${eventId}/${safeFilename}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);

  return { downloadUrl, storagePath, filename: safeFilename };
};

/**
 * Upload a repair verification image for a work order to Firebase Storage at workOrders/{workOrderId}/{filename}
 */
export const uploadWorkOrderImage = async (
  workOrderId: string,
  file: File | Blob,
  customFilename?: string
): Promise<UploadResult> => {
  const filename = customFilename || (file instanceof File ? file.name : `repair_proof_${Date.now()}.jpg`);
  const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storagePath = `workOrders/${workOrderId}/${safeFilename}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);

  return { downloadUrl, storagePath, filename: safeFilename };
};

/**
 * Upload evidence photo and update Firestore document
 */
export const uploadAndSaveEvidence = async (
  eventId: string,
  file: File | Blob
): Promise<UploadResult> => {
  const result = await uploadEvidenceImage(eventId, file);

  // Update in Firestore collections if document exists
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      imageUrl: result.downloadUrl,
      evidenceImages: arrayUnion(result.downloadUrl),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`Firestore event doc ${eventId} update skipped/failed:`, err);
  }

  return result;
};

/**
 * Upload work order photo and update Firestore document
 */
export const uploadAndSaveWorkOrderProof = async (
  workOrderId: string,
  file: File | Blob
): Promise<UploadResult> => {
  const result = await uploadWorkOrderImage(workOrderId, file);

  try {
    const woRef = doc(db, 'workOrders', workOrderId);
    await updateDoc(woRef, {
      proofImageUrl: result.downloadUrl,
      status: 'RESOLVED',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`Firestore work order doc ${workOrderId} update skipped/failed:`, err);
  }

  return result;
};
