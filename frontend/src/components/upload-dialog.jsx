"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, Download } from "lucide-react";

export function UploadDialog({ open, onOpenChange, folderId }) {
  const [files, setFiles] = useState([]); // Store selected files
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({}); // Track progress for each file

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles); // Store all files selected
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true, // Allow multiple files
  });

  const removeFile = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("No file selected!");
      return;
    }

    if (!folderId) {
      alert("Please select a folder before uploading.");
      return;
    }

    setUploading(true);
    setProgress({}); // Reset progress for all files

    try {
      // Step 1: For each file, get a pre-signed URL and upload it
      for (let file of files) {
        // Get pre-signed URL from backend
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/generate-presigned-url`,
          {
            params: { file_name: file.name }, // Pass file name for URL generation
          }
        );

        const presignedUrl = data.url;
        console.log("Presigned URL:", presignedUrl);

        // Upload the file to Cloudflare R2
        await axios.put(presignedUrl, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: (progressEvent) => {
            setProgress((prev) => ({
              ...prev,
              [file.name]: (progressEvent.loaded / progressEvent.total) * 100,
            }));
          },
        });

        // Step 2: Store the file metadata in DB
        console.log("Uploading file metadata...");
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/file`, {
          folder_id: String(folderId),
          file_name: String(file.name),
          file_size: String(file.size),
          file_path: String(file.name), // Store the file key (not full URL)
        });

        console.log(`File uploaded successfully: ${file.name}`);
      }

      alert("Files uploaded successfully!");
      setFiles([]); // Clear files after upload
      onOpenChange(false); // Close dialog after upload
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    }

    setUploading(false);
  };

  const handleDownload = async (file) => {
    try {
      const { data } = await axios.get(
        `${process.env.BACKEND_URI}/download-file`,
        {
          params: { file_name: file.name },
        }
      );

      const downloadUrl = data.url;
      console.log("Download URL:", downloadUrl);

      // Open file in a new tab or trigger download
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to get download link. Try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Drag and drop files here or click to select files
          </DialogDescription>
        </DialogHeader>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
            isDragActive ? "border-primary" : "border-muted"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop the files here..."
              : "Drag 'n' drop files here, or click to select"}
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Selected Files</h4>
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.name}
                  className="flex items-center gap-2 p-2 bg-muted rounded"
                >
                  <File className="h-4 w-4" />
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(file)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {uploading && (
          <div className="mt-4 space-y-4">
            {files.map((file) => (
              <div key={file.name}>
                <p className="text-sm">{file.name}</p>
                <Progress value={progress[file.name] || 0} className="mt-2" />
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
