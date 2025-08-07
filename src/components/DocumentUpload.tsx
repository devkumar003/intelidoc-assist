import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
}

interface DocumentUploadProps {
  onDocumentsReady: (documents: Document[]) => void;
}

export const DocumentUpload = ({ onDocumentsReady }: DocumentUploadProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB limit
    
    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not a supported format. Please upload PDF, DOCX, or TXT files.`,
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB size limit.`,
          variant: "destructive",
        });
        return;
      }

      const newDoc: Document = {
        id: Math.random().toString(36),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        status: 'uploading',
        progress: 0,
      };

      setDocuments(prev => [...prev, newDoc]);
      
      // Enhanced upload simulation with realistic progress
      simulateUpload(newDoc.id);
      
      toast({
        title: "Upload started",
        description: `Processing ${file.name}...`,
      });
    });
  };

  const simulateUpload = (docId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress >= 100) {
        clearInterval(interval);
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { ...doc, status: 'processing' as const, progress: 100 }
            : doc
        ));
        
        // Simulate processing
        setTimeout(() => {
          setDocuments(prev => {
            const updated = prev.map(doc => 
              doc.id === docId 
                ? { ...doc, status: 'ready' as const, progress: 100 }
                : doc
            );
            onDocumentsReady(updated.filter(d => d.status === 'ready'));
            return updated;
          });
          
          toast({
            title: "Document processed",
            description: "Document is ready for querying",
          });
        }, 2000);
      } else {
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { ...doc, progress }
            : doc
        ));
      }
    }, 500);
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className="shadow-floating bg-gradient-card border-0 overflow-hidden">
      <CardHeader className="bg-gradient-primary text-white">
        <CardTitle className="flex items-center gap-3">
          <Upload className="h-6 w-6" />
          Document Upload
        </CardTitle>
        <p className="text-white/80 text-sm">
          Upload your documents for AI-powered analysis
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-primary bg-primary/10 shadow-glow scale-105' 
              : 'border-border hover:border-primary/50 hover:bg-gradient-hero'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <div className="relative">
            <Upload className={`h-16 w-16 mx-auto mb-4 transition-colors ${isDragOver ? 'text-primary animate-float' : 'text-muted-foreground'}`} />
            {isDragOver && (
              <div className="absolute inset-0 bg-shimmer bg-[length:200%] animate-shimmer rounded-full"></div>
            )}
          </div>
          <h3 className="text-xl font-bold mb-2">Drop documents here</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Supports PDF, DOCX, and TXT files up to 10MB each
          </p>
          <Input
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline" size="lg" className="bg-white/50 hover:bg-white shadow-card">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Browse Files
            </label>
          </Button>
        </div>

        {documents.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Uploaded Documents ({documents.length})
            </h4>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-4 bg-white/70 border border-border/50 rounded-xl shadow-card hover:shadow-elegant transition-all duration-300">
                  {getStatusIcon(doc.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-foreground">{doc.name}</p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {doc.status === 'uploading' ? 'Uploading document...' : 
                       doc.status === 'processing' ? 'Analyzing content...' : 
                       doc.status === 'ready' ? 'Ready for analysis' : 'Processing failed'}
                    </p>
                  </div>
                  {(doc.status === 'uploading' || doc.status === 'processing') && (
                    <div className="w-32">
                      <Progress value={doc.progress} className="h-3 bg-muted" />
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                        {Math.round(doc.progress)}%
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};