import Image from "next/image";
import FileManager from "../components/file-manager";
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <FileManager />
    </div>
  );
}
