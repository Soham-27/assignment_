"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RenameFolderDialog({
  open,
  onOpenChange,
  onRename,
  folderToRename,
}) {
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (folderToRename) {
      setNewName(folderToRename.name);
    }
  }, [folderToRename]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !folderToRename) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/folders/${folderToRename.id}`,
        {
          name: newName.trim(),
        }
      );
      console.log(response.data);
      onRename(response.data.name); // Pass updated folder to parent
      onOpenChange(false); // Close the dialog
    } catch (error) {
      setError(error.response?.data?.error || "Failed to rename folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>
            Enter a new name for the folder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">New folder name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="My Renamed Folder"
                disabled={loading}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Renaming..." : "Rename Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
