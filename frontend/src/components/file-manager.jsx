"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { FileList } from "./file-list";
import { CreateFolderDialog } from "./create-folder-dialog";
import { UploadDialog } from "./upload-dialog";
import { RenameFolderDialog } from "./rename-folder-dialog";
import axios from "axios"; // Import axios
import { ChevronLeft, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function FileManager() {
  const [files, setFiles] = useState([]); // Holds file and folder data
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRenameFolderOpen, setIsRenameFolderOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const backendUri = process.env.NEXT_PUBLIC_BACKEND_URI;

  // Fetch folders from the API
  useEffect(() => {
    axios
      .get(`${backendUri}/folders/`)
      .then((response) => {
        const fetchedFolders = response.data.map((folder) => ({
          id: folder.id,
          name: folder.name,
          type: "folder",
          parentId: null,
          createdAt: new Date(),
        }));
        setFiles(fetchedFolders);
      })
      .catch((error) => {
        console.error("Error fetching folders:", error);
      });
  }, []);

  const handleCreateFolder = (name) => {
    const newFolder = {
      id: Math.random().toString(36).substring(7),
      name,
      type: "folder",
      parentId: currentFolder,
      createdAt: new Date(),
    };
    setFiles([...files, newFolder]);
    setIsCreateFolderOpen(false);
  };

  const handleFileUpload = (uploadedFiles) => {
    const newFiles = uploadedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      type: "file",
      parentId: currentFolder,
      createdAt: new Date(),
      size: file.size,
    }));
    setFiles([...files, ...newFiles]);
    setIsUploadOpen(false);
  };

  const handleRenameFolder = (id, newName) => {
    setFiles(
      files.map((file) => (file.id === id ? { ...file, name: newName } : file))
    );
    setFolderToRename(null);
  };

  const navigateUp = () => {
    if (currentFolder) {
      const parentFolder = files.find((f) => f.id === currentFolder);
      setCurrentFolder(parentFolder ? parentFolder.parentId : null);
    }
  };

  const renderSidebar = () => (
    <Sidebar
      folders={files}
      onNavigate={setCurrentFolder}
      currentFolder={currentFolder}
    />
  );

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 border-r">{renderSidebar()}</div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-4 border-b px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* Mobile Sidebar (Sheet) */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  {renderSidebar()}
                  {/* Add New Folder button inside mobile sidebar */}
                  <div className="p-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsCreateFolderOpen(true)}
                    >
                      New Folder
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Navigate Up Button */}
              {currentFolder && (
                <Button variant="ghost" size="icon" onClick={navigateUp}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Buttons for New Folder & Upload */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateFolderOpen(true)}
              >
                New Folder
              </Button>
              {currentFolder && (
                <Button onClick={() => setIsUploadOpen(true)}>Upload</Button>
              )}
            </div>
          </div>
        </header>

        {/* File List */}
        <main className="flex-1 overflow-auto p-4">
          <FileList
            currentFolder={currentFolder}
            onNavigate={setCurrentFolder}
          />
        </main>
      </div>

      {/* Modals */}
      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        onSubmit={handleCreateFolder}
      />
      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUpload={handleFileUpload}
        folderId={currentFolder}
      />
      <RenameFolderDialog
        open={isRenameFolderOpen}
        onOpenChange={setIsRenameFolderOpen}
        onRename={handleRenameFolder}
        folderToRename={folderToRename}
      />
    </div>
  );
}
