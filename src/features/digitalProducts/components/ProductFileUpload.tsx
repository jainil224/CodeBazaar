import { useState, useRef } from 'react';
import { uploadProductFile } from '../services/productFileService';
import { validateZipFile, formatBytes } from '../utils/downloadUtils';
import { Upload, X, CheckCircle, AlertCircle, FileArchive } from 'lucide-react';

interface ProductFileUploadProps {
  productId: string;
  onUploadComplete: (storagePath: string, fileName: string, fileSize: number) => void;
  onUploadError: (error: string) => void;
  currentFileName?: string;
  currentFileSize?: number;
}

export default function ProductFileUpload({
  productId,
  onUploadComplete,
  onUploadError,
  currentFileName,
  currentFileSize,
}: ProductFileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'failed'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setUploadStatus('idle');
    setProgress(0);

    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateZipFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file.');
      onUploadError(validation.error || 'Invalid file.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;


    setUploadStatus('uploading');
    setProgress(0);

    try {
      const storagePath = await uploadProductFile(productId, selectedFile, (prog) => {
        setProgress(prog);
      });

      setUploadStatus('success');
      onUploadComplete(storagePath, selectedFile.name, selectedFile.size);
    } catch (error: any) {
      console.error("ZIP Upload error:", error);
      setUploadStatus('failed');
      const err = error.message || 'File upload failed. Please try again.';
      setErrorMsg(err);
      onUploadError(err);
    }
  };

  const handleCancelSelected = () => {
    setSelectedFile(null);
    setProgress(0);
    setUploadStatus('idle');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 text-white">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-widest font-semibold font-mono text-purple-400">
          Source Code ZIP
        </label>
        {selectedFile && uploadStatus !== 'uploading' && (
          <button
            type="button"
            onClick={handleCancelSelected}
            className="text-xs text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>

      {/* File input / Dropzone */}
      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-[2px] border-dashed border-white/20 hover:border-purple-400 rounded-xl p-6 text-center cursor-pointer transition-all bg-white/[0.02] flex flex-col items-center gap-2 group"
        >
          <Upload className="w-8 h-8 text-white/40 group-hover:text-purple-400 transition-colors" />
          <p className="text-sm font-semibold text-white/80">Choose ZIP File</p>
          <p className="text-xs text-white/40 font-mono">ZIP format only (Max 100MB)</p>
          <input
            type="file"
            accept=".zip"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-300">
              <FileArchive className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold truncate text-white">{selectedFile.name}</p>
              <p className="text-xs text-white/40 font-mono">{formatBytes(selectedFile.size)}</p>
            </div>
          </div>

          {/* Upload Status / Actions */}
          {uploadStatus === 'idle' && (
            <button
              type="button"
              onClick={handleUpload}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-purple-950/20 cursor-pointer"
            >
              Upload Secure ZIP
            </button>
          )}

          {uploadStatus === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-white/70 animate-pulse">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>ZIP file uploaded successfully!</span>
            </div>
          )}

          {uploadStatus === 'failed' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">{errorMsg || 'Upload failed.'}</span>
            </div>
          )}
        </div>
      )}

      {/* Show existing file details if editing and no file selected */}
      {!selectedFile && currentFileName && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-400">
          <div className="flex items-center gap-2 truncate text-left">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="truncate" title={currentFileName}>
              Current File: {currentFileName}
            </span>
          </div>
          {currentFileSize && (
            <span className="font-mono text-white/40 shrink-0 ml-1">
              ({formatBytes(currentFileSize)})
            </span>
          )}
        </div>
      )}

      {errorMsg && !selectedFile && (
        <div className="flex items-center gap-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
