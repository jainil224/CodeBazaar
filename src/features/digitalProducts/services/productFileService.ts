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
 * Uploads a public product preview image.
 * Tries Cloudinary first if configured. If Cloudinary fails (e.g. invalid API Key / Upload Preset),
 * logs the detailed Cloudinary API error and seamlessly falls back to Firebase Storage.
 */
export async function uploadProductImage(
  productId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.warn("Cloudinary configuration missing. Uploading directly via Firebase Storage...");
    return uploadProductImageFirebase(productId, file, onProgress);
  }

  try {
    return await new Promise<string>((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
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
            const errMsg = response.error?.message || `Cloudinary API returned status ${xhr.status}`;
            reject(new Error(errMsg));
          } catch {
            reject(new Error(`Cloudinary API returned status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error uploading to Cloudinary.'));
      };

      xhr.send(formData);
    });
  } catch (cloudinaryError: any) {
    console.warn(`Cloudinary Upload Failed: "${cloudinaryError.message}". Falling back to Firebase Storage...`);
    return uploadProductImageFirebase(productId, file, onProgress);
  }
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
