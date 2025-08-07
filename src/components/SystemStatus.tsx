import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Database, Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface SystemStatusProps {
  documentsProcessed: number;
  totalDocuments: number;
  lastQueryTime?: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'error';
}

export const SystemStatus = ({ 
  documentsProcessed, 
  totalDocuments, 
  lastQueryTime,
  systemHealth 
}: SystemStatusProps) => {
  const getHealthIcon = () => {
    switch (systemHealth) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getHealthColor = () => {
    switch (systemHealth) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-destructive';
    }
  };

  const processingProgress = totalDocuments > 0 ? (documentsProcessed / totalDocuments) * 100 : 0;

  return (
    <Card className="shadow-floating bg-gradient-card border-0 overflow-hidden">
      <CardHeader className="bg-gradient-hero border-b border-border/20">
        <CardTitle className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          System Dashboard
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Real-time monitoring of document processing and system performance
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white/70 rounded-xl shadow-card hover:shadow-elegant transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              {getHealthIcon()}
            </div>
            <div className="text-2xl font-bold mb-2 text-foreground">
              {systemHealth.charAt(0).toUpperCase() + systemHealth.slice(1)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">System Health</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {systemHealth === 'excellent' ? 'All systems operational' : 
                 systemHealth === 'good' ? 'Processing documents' : 'Waiting for documents'}
              </span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-white/70 rounded-xl shadow-card hover:shadow-elegant transition-all duration-300">
            <div className="text-3xl font-bold text-primary mb-2">{documentsProcessed}/{totalDocuments}</div>
            <div className="text-sm text-muted-foreground font-medium">Documents Processed</div>
            <div className="w-full bg-muted rounded-full h-3 mt-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {processingProgress.toFixed(0)}% complete
            </div>
          </div>
          
          <div className="text-center p-4 bg-white/70 rounded-xl shadow-card hover:shadow-elegant transition-all duration-300">
            <div className="text-3xl font-bold text-accent mb-2">
              {lastQueryTime ? `${lastQueryTime}ms` : '--'}
            </div>
            <div className="text-sm text-muted-foreground font-medium">Query Response Time</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">
                {lastQueryTime ? 'Last analysis' : 'No queries yet'}
              </span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-white/70 rounded-xl shadow-card hover:shadow-elegant transition-all duration-300">
            <div className="text-3xl font-bold text-secondary mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground font-medium">System Uptime</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Clock className="h-4 w-4 text-secondary" />
              <span className="text-xs text-muted-foreground">
                High availability
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};