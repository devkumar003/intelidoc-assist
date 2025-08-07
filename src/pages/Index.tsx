import { useState, useCallback } from 'react';
import { DocumentUpload } from '@/components/DocumentUpload';
import { QueryInterface } from '@/components/QueryInterface';
import { SystemStatus } from '@/components/SystemStatus';
import { EnhancedDocumentService } from '@/services/EnhancedDocumentService';
import { RAGResult } from '@/services/RAGService';
import { EnhancedResultsDisplay } from '@/components/EnhancedResultsDisplay';
import { EvaluationDashboard } from '@/components/EvaluationDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Brain, FileSearch, Zap } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
}

interface QueryResult {
  question: string;
  answer: string;
  confidence: number;
  sources: string[];
  reasoning: string;
  timestamp: Date;
}

const Index = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [results, setResults] = useState<RAGResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQueryTime, setLastQueryTime] = useState<number>();
  const { toast } = useToast();

  const handleDocumentsReady = useCallback(async (readyDocs: Document[]) => {
    setDocuments(readyDocs);
    
    // Process documents with RAG
    for (const doc of readyDocs) {
      if (doc.url && doc.url.startsWith('blob:')) {
        try {
          const response = await fetch(doc.url);
          const blob = await response.blob();
          const file = new File([blob], doc.name, { type: doc.type });
          await EnhancedDocumentService.processDocumentWithRAG(file);
        } catch (error) {
          console.warn('Failed to process document with RAG:', error);
        }
      }
    }
    
    toast({
      title: "Documents Ready",
      description: `${readyDocs.length} document(s) processed with RAG embeddings`,
    });
  }, [toast]);

  const handleQuerySubmit = useCallback(async (queries: string[]): Promise<QueryResult[]> => {
    if (!queries.length) return [];
    
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const queryResults = await EnhancedDocumentService.processQueriesWithRAG(queries);
      setResults(queryResults);
      
      const endTime = Date.now();
      setLastQueryTime(endTime - startTime);
      
      toast({
        title: "Queries Processed",
        description: `${queries.length} queries analyzed with RAG intelligence`,
      });

      // Convert RAG results to legacy QueryResult format for compatibility
      return queryResults.map(result => ({
        question: result.question,
        answer: result.answer,
        confidence: result.confidence,
        sources: ['RAG-Enhanced Analysis'],
        reasoning: result.reasoning,
        timestamp: result.timestamp
      }));
    } catch (error) {
      console.error('Query processing failed:', error);
      toast({
        title: "Processing Failed",
        description: "There was an error processing your queries. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const readyDocuments = documents.filter(doc => doc.status === 'ready').length;
  const totalDocuments = documents.length;
  const systemHealth = readyDocuments === totalDocuments && totalDocuments > 0 ? 'excellent' : 
                      readyDocuments > 0 ? 'good' : 'warning';

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Enhanced Header with floating animation */}
      <div className="bg-gradient-card backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-float">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  IntelliQuery
                </h1>
                <p className="text-sm text-muted-foreground font-medium">
                  AI-Powered Document Intelligence Platform
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg shadow-card">
                <FileSearch className="h-4 w-4 text-accent" />
                <span className="font-medium">Semantic Search</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg shadow-card">
                <Zap className="h-4 w-4 text-secondary" />
                <span className="font-medium">Real-time Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* System Status */}
        <SystemStatus
          documentsProcessed={readyDocuments}
          totalDocuments={totalDocuments}
          lastQueryTime={lastQueryTime}
          systemHealth={systemHealth}
        />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Upload */}
          <DocumentUpload onDocumentsReady={handleDocumentsReady} />

          {/* Query Interface */}
          <QueryInterface
            documentsReady={readyDocuments > 0}
            onQuerySubmit={handleQuerySubmit}
          />
        </div>

        {/* Results and Evaluation */}
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="results">RAG-Enhanced Results</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            <EnhancedResultsDisplay results={results} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="evaluation">
            <EvaluationDashboard />
          </TabsContent>
        </Tabs>

        {/* Enhanced Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="group text-center p-8 bg-gradient-card rounded-2xl shadow-floating hover:shadow-glow transition-all duration-500 hover:-translate-y-2">
            <div className="h-16 w-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary">Intelligent Processing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Advanced LLM-powered analysis with semantic understanding, contextual reasoning, and multi-domain expertise
            </p>
          </div>
          
          <div className="group text-center p-8 bg-gradient-card rounded-2xl shadow-floating hover:shadow-glow transition-all duration-500 hover:-translate-y-2">
            <div className="h-16 w-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow">
              <FileSearch className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-accent">Multi-format Support</h3>
            <p className="text-muted-foreground leading-relaxed">
              Seamlessly process PDF, DOCX, and text documents with specialized parsing for legal, insurance, and compliance content
            </p>
          </div>
          
          <div className="group text-center p-8 bg-gradient-card rounded-2xl shadow-floating hover:shadow-glow transition-all duration-500 hover:-translate-y-2">
            <div className="h-16 w-16 bg-secondary/90 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-glow">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-secondary">Explainable AI</h3>
            <p className="text-muted-foreground leading-relaxed">
              Transparent decision-making with clause traceability, confidence scoring, and detailed reasoning explanations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
