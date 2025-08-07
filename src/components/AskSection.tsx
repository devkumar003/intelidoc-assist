
import { useState } from "react";
import { queryDocument } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function AskSection() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleAsk = async () => {
    setLoading(true);
    try {
      const res = await queryDocument(question);
      setResponse(res[0]);
    } catch (err) {
      console.error(err);
      setResponse(null);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 space-y-4">
      <Textarea
        placeholder="Ask your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="min-h-[100px]"
      />
      <Button onClick={handleAsk} disabled={loading || !question}>
        {loading ? "Asking..." : "Ask"}
      </Button>

      {response && (
        <div className="bg-muted p-4 rounded-xl space-y-2 border mt-4">
          <div>
            <strong>Answer:</strong> {response.answer}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Source Clause:</strong> {response.source_clause}
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Confidence:</strong> {response.confidence.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}
