
export async function uploadDocument(file: File): Promise<{ status: string; chunks: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8000/upload", {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function queryDocument(question: string): Promise<{
  question: string;
  answer: string;
  source_clause: string;
  confidence: number;
}[]> {
  const res = await fetch("http://localhost:8000/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });

  if (!res.ok) throw new Error("Query failed");
  return res.json();
}
