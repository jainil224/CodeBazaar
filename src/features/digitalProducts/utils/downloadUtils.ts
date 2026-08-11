/**
 * Formats a file size in bytes into a human-readable string (e.g. 25.4 MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validates if the selected file is a ZIP file and within size constraints.
 */
export function validateZipFile(file: File, maxSizeBytes = 100 * 1024 * 1024): { valid: boolean; error?: string } {
  const name = file.name.toLowerCase();
  const isZipExtension = name.endsWith('.zip');

  if (!isZipExtension) {
    return { valid: false, error: 'Only ZIP files are allowed.' };
  }

  if (file.size > maxSizeBytes) {
    const readableLimit = formatBytes(maxSizeBytes);
    return { valid: false, error: `File size exceeds the maximum allowed limit of ${readableLimit}.` };
  }

  return { valid: true };
}
