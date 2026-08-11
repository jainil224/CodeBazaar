import { storage } from '@/firebase';
import { ref, uploadBytesResumable, deleteObject, getBlob, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a secure ZIP file to Firebase Storage under products/{productId}/{zipName}
 */
export function uploadProductFile(
  productId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storagePath = `products/${productId}/${file.name}`;
    const fileRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(progress));
      },
      (error) => {
        reject(error);
      },
      () => {
        resolve(storagePath);
      }
    );
  });
}

/**
 * Uploads an image file to Firebase Storage under product-images/{productId}/{imageName}
 * Resolves to the public download URL of the uploaded image.
 */
export function uploadProductImageFirebase(
  productId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `product-images/${productId}/${Date.now()}_${safeName}`;
    const fileRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(Math.round(progress));
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(fileRef);
          resolve(downloadUrl);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

/**
 * Converts an image file to a Base64 data URL string.
 * This is 100% fail-proof: zero CORS, zero API key requirements, and instant rendering everywhere.
 */
export function fileToBase64(file: File, onProgress: (progress: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onProgress(100);
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image file."));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a public product preview image using a 3-tier fallback system:
 *   Tier 1: Cloudinary (if valid cloud name configured)
 *   Tier 2: Firebase Storage
 *   Tier 3: Base64 Data URL (100% fail-proof, zero CORS/API key issues)
 */
export async function uploadProductImage(
  productId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // ── Tier 1: Cloudinary Upload (if cloudName is valid string and not numeric API key) ──
  const isNumericCloudName = cloudName && /^\d+$/.test(cloudName);
  if (isNumericCloudName) {
    console.warn(`[Cloudinary Warning] "${cloudName}" is an API Key, not a Cloud Name (Cloud Name is a text identifier like "demo" or "mycompany").`);
  }

  if (cloudName && uploadPreset && !isNumericCloudName) {
    try {
      return await new Promise<string>((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        if (apiKey) {
          formData.append('api_key', apiKey);
        }
        formData.append('folder', `codebazaar/images/${productId}`);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(Math.round(percentComplete));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.secure_url);
            } catch (err) {
              reject(new Error('Failed to parse Cloudinary response.'));
            }
          } else {
            try {
              const response = JSON.parse(xhr.responseText);
              const errMsg = response.error?.message || `Cloudinary API status ${xhr.status}`;
              reject(new Error(errMsg));
            } catch {
              reject(new Error(`Cloudinary API status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error uploading to Cloudinary.'));
        };

        xhr.send(formData);
      });
    } catch (cloudinaryError: any) {
      console.warn(`[Cloudinary Upload Skipped]: ${cloudinaryError.message}. Switching to Firebase Storage...`);
    }
  }

  // ── Tier 2: Firebase Storage Upload ────────────────────────────────────
  try {
    return await uploadProductImageFirebase(productId, file, onProgress);
  } catch (firebaseErr: any) {
    console.warn(`[Firebase Storage Warning]: ${firebaseErr.message || 'CORS / Storage policy restriction'}. Converting to Base64 Data URL...`);
  }

  // ── Tier 3: Base64 Data URL Fallback (100% Fail-Proof) ──────────────────
  console.info("Using Base64 Data URL fallback for instant, CORS-free image preview.");
  return fileToBase64(file, onProgress);
}

/**
 * Deletes a file from Firebase Storage.
 */
export async function deleteProductFile(storagePath: string): Promise<void> {
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (error) {
    // If the file doesn't exist, we don't block deletion progress
    console.warn("Storage file deletion skipped or failed:", error);
  }
}

/**
 * Downloads a secure product ZIP file from Firebase Storage directly as a Blob.
 */
export async function downloadProductBlob(storagePath: string): Promise<Blob> {
  const fileRef = ref(storage, storagePath);
  return await getBlob(fileRef);
}
