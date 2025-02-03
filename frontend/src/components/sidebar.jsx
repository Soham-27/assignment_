import { useState } from "react";
import {
  FolderIcon,
  Home,
  Star,
  Clock,
  Trash,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";

export function Sidebar({ folders, currentFolder, onNavigate, setFolders }) {
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleRename = async () => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/folders/${selectedFolder.id}`,
        {
          name: newFolderName,
        }
      );
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === selectedFolder.id ? response.data : folder
        )
      );
    } catch (error) {
      console.error("Error renaming folder", error);
    }
    setRenameModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/folders/${selectedFolder.id}`
      );
      setFolders((prevFolders) =>
        prevFolders.filter((folder) => folder.id !== selectedFolder.id)
      );
    } catch (error) {
      console.error("Error deleting folder", error);
    }
    setDeleteModalOpen(false);
  };

  return (
    <div
      className="h-full overflow-y-auto"
      onClick={() => setContextMenu(null)}
    >
      <div className="space-y-2 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Folders
          </h2>
          <div className="space-y-1">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between relative"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 text-sm",
                    currentFolder === folder.id && "bg-accent"
                  )}
                  onClick={() => onNavigate(folder.id)}
                >
                  <FolderIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setContextMenu({ x: e.clientX, y: e.clientY, folder });
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
                {contextMenu && contextMenu.folder.id === folder.id && (
                  <div className="absolute bg-white shadow-md rounded-md p-2 right-0 top-8 z-10">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedFolder(folder);
                        setRenameModalOpen(true);
                      }}
                    >
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedFolder(folder);
                        setDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter new folder name"
          />
          <DialogFooter>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this folder?</p>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
