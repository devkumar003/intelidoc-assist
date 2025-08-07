
import { useState } from "react";
import { uploadDocument } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadDocument(file);
      setStatus(`Indexed ${res.chunks} chunks successfully.`);
    } catch (err) {
      console.error(err);
      setStatus("Upload failed");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 space-y-4">
      <Input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Uploading..." : "Upload & Index"}
      </Button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}
