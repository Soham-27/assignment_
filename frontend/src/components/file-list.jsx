import { useEffect, useState } from "react";
import { FileIcon, FolderIcon, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

export function FileList({ currentFolder, onNavigate }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentFolder !== null) {
      fetchFiles(currentFolder);
    }
  }, [currentFolder]);

  const fetchFiles = async (folderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://127.0.0.1:8000/folders/${folderId}`
      );
      setFiles(response.data || []);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://127.0.0.1:8000/file/${file.id}`);
      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
      alert(`File "${file.name}" deleted successfully.`);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file. Please try again.");
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/download-file/", {
        params: { file_name: file.name },
      });

      const downloadUrl = response.data.url;
      if (!downloadUrl) {
        alert("Error generating download URL");
        return;
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating download URL:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    // return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div>
      {currentFolder && loading ? (
        <p>Loading files...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {files.length > 0 ? (
            files.map((file) => (
              <div
                key={file.id}
                className="group relative bg-card hover:bg-accent rounded-lg p-3 cursor-pointer"
                onClick={() => file.type === "folder" && onNavigate(file.id)}
              >
                <div className="absolute right-2 top-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(file)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-col items-center gap-2 pt-4 pb-2">
                  {file.type === "folder" ? (
                    <FolderIcon className="h-10 w-10 text-blue-500" />
                  ) : (
                    <FileIcon className="h-10 w-10 text-gray-500" />
                  )}
                  <div className="text-sm font-medium text-center truncate w-full">
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    {file.uploaded_at
                      ? formatDistanceToNow(new Date(file.uploaded_at), {
                          addSuffix: true,
                        })
                      : "Unknown Date"}
                    {file.size && <div>{formatFileSize(file.size)}</div>}
                  </div>
                </div>
              </div>
            ))
          ) : currentFolder ? (
            <p className="text-center text-gray-500 col-span-full">
              No files available.
            </p>
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              Please select a folder to view files.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
