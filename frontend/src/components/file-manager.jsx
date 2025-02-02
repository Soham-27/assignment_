"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { FileList } from "./file-list";
import { CreateFolderDialog } from "./create-folder-dialog";
import { UploadDialog } from "./upload-dialog";
import { RenameFolderDialog } from "./rename-folder-dialog";
import axios from "axios"; // Import axios
import { Search, ChevronLeft, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function FileManager() {
  const [files, setFiles] = useState([]); // Holds file and folder data
  const [currentFolder, setCurrentFolder] = useState(null); // Set initial folder to null or a valid folder ID
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRenameFolderOpen, setIsRenameFolderOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);

  // Fetch folders from the API
  useEffect(() => {
    axios
      .get("http://localhost:8000/folders/")
      .then((response) => {
        const fetchedFolders = response.data.map((folder) => ({
          id: folder.id,
          name: folder.name,
          type: "folder",
          parentId: null, // Parent ID can be added later if needed
          createdAt: new Date(), // Just a placeholder
        }));
        setFiles(fetchedFolders); // Set the fetched folders to the state
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
      <div className="hidden md:block w-80 border-r">{renderSidebar()}</div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-4 border-b px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  {renderSidebar()}
                </SheetContent>
              </Sheet>
              {currentFolder && (
                <Button variant="ghost" size="icon" onClick={navigateUp}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {/* <h2 className="text-lg font-semibold truncate">
                {currentFolder ? `Folder ${currentFolder}` : "No Folder"}
              </h2> */}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateFolderOpen(true)}
                className="hidden sm:inline-flex"
              >
                New Folder
              </Button>
              {currentFolder && (
                <Button onClick={() => setIsUploadOpen(true)}>Upload</Button>
              )}
            </div>
          </div>
          {/* <div className="relative flex-1 max-w-md mx-auto">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search files..." className="pl-8" />
          </div> */}
        </header>
        <main className="flex-1 overflow-auto p-4">
          <FileList
            currentFolder={currentFolder} // Pass currentFolder here
            onNavigate={setCurrentFolder}
          />
        </main>
      </div>
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
