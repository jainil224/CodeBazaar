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
 * Uploads a public product preview image to Firebase Storage under product-images/{productId}/{imageName}
 * Resolves to the public download URL of the image.
 */
export function uploadProductImage(
  productId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storagePath = `product-images/${productId}/${file.name}`;
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
        getDownloadURL(fileRef)
          .then((url) => resolve(url))
          .catch((err) => reject(err));
      }
    );
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
