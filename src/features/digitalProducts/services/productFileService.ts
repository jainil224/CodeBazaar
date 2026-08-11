import { storage } from '@/firebase';
import { ref, uploadBytesResumable, deleteObject, getBlob } from 'firebase/storage';

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
 * Uploads a public product preview image to Firebase Storage under product-images/{productId}/{imageName}
 * Resolves to the public download URL of the image.
 */
export function uploadProductImage(
  productId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return Promise.reject(new Error("Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file."));
  }

  return new Promise((resolve, reject) => {
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
          reject(new Error(response.error?.message || 'Failed to upload image.'));
        } catch {
          reject(new Error('Image upload failed.'));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error uploading to Cloudinary.'));
    };

    xhr.send(formData);
  });
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
