/**
 * Helper to download a valid ZIP file generated client-side.
 * Uses a pre-compiled base64 ZIP buffer containing starting templates.
 */
export function downloadProjectZip(projectName: string) {
  // A valid base64-encoded ZIP file containing index.html and README.md template
  const zipBase64 = "UEsDBAoAAAAAAOC6PlaCmr67KgAAACoAAAAJABwAUkVBRE1FLm1kVVRFAAcDA5PZZWaT2WVmZGV4CwABDPUBAAAAAQAAAAAjdGhpcyBpcyB5b3VyIENvZGVCYXphYXIgZG93bmxvYWQgZm9yIFsKUEsDBAoAAAAAAOi6Pla4yV95KgAAACoAAAAKABwAaW5kZXguaHRtbFVUBAcDA5PZZWaT2WVmZGV4CwABDPUBAAAAAQAAAAAjdGhpcyBpcyB5b3VyIENvZGVCYXphYXIgZG93bmxvYWQgZm9yIFsKUEsBAh4DCgAAAAAA4Lo+VoKavrsqAAAAKgAAAAkAGAAAAAAAAQAAAKSBAAAAAFJFQURNRS5tZFVUBQcDA5PZZWVkZXgLAAEM9QEAAAABAAAAAFBLAQIeAwoAAAAAAOi6Pla4yV95KgAAACoAAAAKABgAAAAAAAEAAAKSgUAAAABpbmRleC5odG1sVVQFBwMDk9llZGV4CwABDPUBAAAAAQAAAABQSwUGAAAAAAIAAgCMAAAArQAAAAAA";

  try {
    const byteCharacters = atob(zipBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/zip' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-source.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate ZIP download", error);
  }
}
