import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  Brain, 
  FileText, 
  CheckCircle2,
  TrendingUp,
  Clock,
  Lightbulb
} from 'lucide-react';
import { RAGResult, DocumentChunk } from '@/services/RAGService';

interface EnhancedResultsDisplayProps {
  results: RAGResult[];
  isLoading?: boolean;
}

export const EnhancedResultsDisplay = ({ results, isLoading }: EnhancedResultsDisplayProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const highlightSourceText = (text: string, query: string): string => {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    let highlightedText = text;
    
    queryTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-primary/20 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  if (isLoading) {
    return (
      <Card className="shadow-floating bg-gradient-card border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-lg font-medium">Processing queries with RAG system...</div>
          </div>
          <Progress value={65} className="mt-4 h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Analyzing document chunks and generating embeddings
          </p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="shadow-floating bg-gradient-card border-0">
        <CardContent className="p-8 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
          <p className="text-muted-foreground">
            Submit your queries to see intelligent AI-powered analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-floating bg-gradient-card border-0 overflow-hidden">
        <CardHeader className="bg-gradient-primary text-white">
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6" />
            RAG-Powered Query Results
          </CardTitle>
          <p className="text-white/80 text-sm">
            {results.length} intelligent responses with explainable AI reasoning
          </p>
        </CardHeader>
      </Card>

      {results.map((result, index) => (
        <Card key={index} className="shadow-elegant bg-white border border-border/50 overflow-hidden">
          <CardHeader className="bg-gradient-subtle">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {result.question}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={`${getConfidenceColor(result.confidence)} border`}>
                    <Target className="h-3 w-3 mr-1" />
                    {getConfidenceLabel(result.confidence)} ({(result.confidence * 100).toFixed(1)}%)
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Similarity: {(result.similarity_score * 100).toFixed(1)}%
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {result.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(index)}
                className="shrink-0"
              >
                {expandedItems.has(index) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs defaultValue="answer" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="answer" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Answer
                </TabsTrigger>
                <TabsTrigger value="source" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Source
                </TabsTrigger>
                <TabsTrigger value="reasoning" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Reasoning
                </TabsTrigger>
              </TabsList>

              <TabsContent value="answer" className="mt-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 leading-relaxed font-medium">
                    {result.answer}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="source" className="mt-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Primary Source Clause:</h4>
                  <div 
                    className="text-blue-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightSourceText(result.source_clause, result.question) 
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="reasoning" className="mt-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-purple-800 leading-relaxed">
                    {result.reasoning}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Collapsible open={expandedItems.has(index)}>
              <CollapsibleContent className="mt-6">
                <div className="border-t border-border pt-6">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Supporting Evidence Chunks ({result.supporting_chunks.length})
                  </h4>
                  
                  <div className="grid gap-4">
                    {result.supporting_chunks.map((chunk, chunkIndex) => (
                      <Card 
                        key={chunk.id} 
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedChunk?.id === chunk.id 
                            ? 'ring-2 ring-primary shadow-glow' 
                            : 'hover:shadow-card'
                        }`}
                        onClick={() => setSelectedChunk(selectedChunk?.id === chunk.id ? null : chunk)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <Badge variant="outline" className="capitalize">
                              {chunk.metadata.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Chunk {chunkIndex + 1}
                            </span>
                          </div>
                          <div 
                            className="text-sm text-muted-foreground leading-relaxed"
                            dangerouslySetInnerHTML={{ 
                              __html: highlightSourceText(
                                chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''),
                                result.question
                              )
                            }}
                          />
                          {selectedChunk?.id === chunk.id && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div 
                                className="text-sm text-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightSourceText(chunk.content, result.question)
                                }}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};