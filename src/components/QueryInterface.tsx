import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, MessageSquare, Brain, Clock, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface QueryResult {
  question: string;
  answer: string;
  confidence: number;
  sources: string[];
  reasoning: string;
  timestamp: Date;
}

interface QueryInterfaceProps {
  documentsReady: boolean;
  onQuerySubmit: (queries: string[]) => Promise<QueryResult[]>;
}

export const QueryInterface = ({ documentsReady, onQuerySubmit }: QueryInterfaceProps) => {
  const [queries, setQueries] = useState<string[]>(['']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<QueryResult[]>([]);
  const { toast } = useToast();

  const addQuery = () => {
    setQueries(prev => [...prev, '']);
  };

  const updateQuery = (index: number, value: string) => {
    setQueries(prev => prev.map((q, i) => i === index ? value : q));
  };

  const removeQuery = (index: number) => {
    if (queries.length > 1) {
      setQueries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const validQueries = queries.filter(q => q.trim());
    
    if (validQueries.length === 0) {
      toast({
        title: "No queries provided",
        description: "Please enter at least one question",
        variant: "destructive",
      });
      return;
    }

    if (!documentsReady) {
      toast({
        title: "Documents not ready",
        description: "Please upload and process documents first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const results = await onQuerySubmit(validQueries);
      setResults(results);
      toast({
        title: "Queries processed",
        description: `${results.length} questions answered successfully`,
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Failed to process queries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleQueries = [
    "What is the grace period for premium payment?",
    "Does this policy cover maternity expenses?",
    "What is the waiting period for pre-existing diseases?",
    "Are there any sub-limits on room rent and ICU charges?",
    "What is the No Claim Discount offered?"
  ];

  const loadSampleQuery = (query: string) => {
    const emptyIndex = queries.findIndex(q => !q.trim());
    if (emptyIndex !== -1) {
      updateQuery(emptyIndex, query);
    } else {
      setQueries(prev => [...prev, query]);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-floating bg-gradient-card border-0 overflow-hidden">
        <CardHeader className="bg-gradient-accent text-white">
          <CardTitle className="flex items-center gap-3">
            <Search className="h-6 w-6" />
            Intelligent Query Interface
          </CardTitle>
          <p className="text-white/80 text-sm">
            Ask questions about your documents and get AI-powered insights
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Quick samples:</span>
              {sampleQueries.slice(0, 3).map((query, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => loadSampleQuery(query)}
                >
                  {query}
                </Badge>
              ))}
            </div>

            {queries.map((query, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder={`Enter question ${index + 1}...`}
                  value={query}
                  onChange={(e) => updateQuery(index, e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                {queries.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeQuery(index)}
                    className="shrink-0 self-start mt-1"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={addQuery}
                disabled={isProcessing}
              >
                Add Question
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!documentsReady || isProcessing}
                className="bg-gradient-primary shadow-glow hover:shadow-floating text-white border-0 px-8"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    Analyze Documents
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="shadow-floating bg-gradient-card border-0 overflow-hidden animate-slide-in-up">
          <CardHeader className="bg-gradient-primary text-white">
            <CardTitle className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6" />
              Analysis Results ({results.length})
            </CardTitle>
            <p className="text-white/80 text-sm">
              AI-powered insights from your documents
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {results.map((result, index) => (
              <div key={index} className="bg-white/80 border border-border/50 rounded-xl p-6 space-y-4 shadow-card hover:shadow-elegant transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-bold text-lg text-primary leading-tight">{result.question}</h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge 
                      variant={result.confidence > 0.8 ? "default" : "secondary"}
                      className="px-3 py-1 font-medium"
                    >
                      {Math.round(result.confidence * 100)}% confidence
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                      <Clock className="h-3 w-3" />
                      {result.timestamp.toLocaleTimeString()}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gradient-hero p-4 rounded-lg border-l-4 border-primary">
                  <p className="text-foreground leading-relaxed font-medium">{result.answer}</p>
                </div>

                <div className="space-y-3">
                  <h5 className="font-semibold text-sm text-secondary flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Reasoning:
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-white/50 p-3 rounded-lg">
                    {result.reasoning}
                  </p>
                </div>

                {result.sources.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-semibold text-sm text-accent flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Sources:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((source, idx) => (
                        <Badge key={idx} variant="outline" className="px-3 py-1 bg-white/70">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};