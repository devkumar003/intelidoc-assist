import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Clock, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Brain,
  Zap
} from 'lucide-react';

interface EvaluationMetrics {
  accuracy: number;
  averageLatency: number;
  hallucinationRate: number;
  confidenceScore: number;
  totalQueries: number;
  successfulQueries: number;
  tokenEfficiency: number;
}

interface QueryPerformance {
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  isCorrect: boolean;
  latency: number;
  confidence: number;
  tokensUsed: number;
}

export const EvaluationDashboard = () => {
  const [metrics, setMetrics] = useState<EvaluationMetrics>({
    accuracy: 0,
    averageLatency: 0,
    hallucinationRate: 0,
    confidenceScore: 0,
    totalQueries: 0,
    successfulQueries: 0,
    tokenEfficiency: 0
  });

  const [performanceData, setPerformanceData] = useState<QueryPerformance[]>([]);
  const [isRunningEvaluation, setIsRunningEvaluation] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);

  useEffect(() => {
    // Load mock evaluation data
    loadMockEvaluationData();
  }, []);

  const loadMockEvaluationData = () => {
    const mockMetrics: EvaluationMetrics = {
      accuracy: 87.5,
      averageLatency: 1.2,
      hallucinationRate: 3.1,
      confidenceScore: 84.2,
      totalQueries: 48,
      successfulQueries: 42,
      tokenEfficiency: 92.3
    };

    const mockPerformance: QueryPerformance[] = [
      {
        question: "What is the grace period for premium payment?",
        expectedAnswer: "30 days grace period is provided",
        actualAnswer: "A grace period of thirty days is provided for premium payment after the due date",
        isCorrect: true,
        latency: 1.1,
        confidence: 0.92,
        tokensUsed: 245
      },
      {
        question: "Does the policy cover maternity expenses?",
        expectedAnswer: "Yes, with 24 months waiting period",
        actualAnswer: "Yes, the policy covers maternity expenses with 24 months continuous coverage requirement",
        isCorrect: true,
        latency: 1.4,
        confidence: 0.88,
        tokensUsed: 312
      },
      {
        question: "What is the waiting period for pre-existing diseases?",
        expectedAnswer: "36 months waiting period",
        actualAnswer: "There is a waiting period of thirty-six months for pre-existing diseases",
        isCorrect: true,
        latency: 0.9,
        confidence: 0.95,
        tokensUsed: 198
      }
    ];

    setMetrics(mockMetrics);
    setPerformanceData(mockPerformance);
  };

  const runEvaluation = async () => {
    setIsRunningEvaluation(true);
    setEvaluationProgress(0);

    // Simulate evaluation process
    for (let i = 0; i <= 100; i += 10) {
      setEvaluationProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Update metrics with new simulated results
    setMetrics(prev => ({
      ...prev,
      accuracy: Math.min(prev.accuracy + Math.random() * 5, 95),
      averageLatency: Math.max(prev.averageLatency - Math.random() * 0.2, 0.8),
      confidenceScore: Math.min(prev.confidenceScore + Math.random() * 3, 90),
      totalQueries: prev.totalQueries + 10
    }));

    setIsRunningEvaluation(false);
  };

  const getMetricColor = (value: number, type: 'accuracy' | 'latency' | 'hallucination' | 'efficiency') => {
    switch (type) {
      case 'accuracy':
      case 'efficiency':
        if (value >= 85) return 'text-green-600';
        if (value >= 70) return 'text-yellow-600';
        return 'text-red-600';
      case 'latency':
        if (value <= 1.0) return 'text-green-600';
        if (value <= 2.0) return 'text-yellow-600';
        return 'text-red-600';
      case 'hallucination':
        if (value <= 5) return 'text-green-600';
        if (value <= 10) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-floating bg-gradient-card border-0 overflow-hidden">
        <CardHeader className="bg-gradient-primary text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6" />
              LLM Evaluation Dashboard
            </div>
            <Button 
              onClick={runEvaluation}
              disabled={isRunningEvaluation}
              variant="secondary"
              size="sm"
            >
              {isRunningEvaluation ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Evaluation
                </>
              )}
            </Button>
          </CardTitle>
          <p className="text-white/80 text-sm">
            Real-time performance metrics and quality assessment
          </p>
        </CardHeader>
        
        {isRunningEvaluation && (
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Evaluation Progress</span>
                <span>{evaluationProgress}%</span>
              </div>
              <Progress value={evaluationProgress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="queries">Query Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-card bg-white border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className={`text-2xl font-bold ${getMetricColor(metrics.accuracy, 'accuracy')}`}>
                      {metrics.accuracy.toFixed(1)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-white border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Latency</p>
                    <p className={`text-2xl font-bold ${getMetricColor(metrics.averageLatency, 'latency')}`}>
                      {metrics.averageLatency.toFixed(1)}s
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-white border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hallucination Rate</p>
                    <p className={`text-2xl font-bold ${getMetricColor(metrics.hallucinationRate, 'hallucination')}`}>
                      {metrics.hallucinationRate.toFixed(1)}%
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-white border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Token Efficiency</p>
                    <p className={`text-2xl font-bold ${getMetricColor(metrics.tokenEfficiency, 'efficiency')}`}>
                      {metrics.tokenEfficiency.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-elegant bg-white border border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                System Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Query Success Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {metrics.successfulQueries}/{metrics.totalQueries}
                      </span>
                    </div>
                    <Progress 
                      value={(metrics.successfulQueries / metrics.totalQueries) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Confidence Score</span>
                      <span className="text-sm text-muted-foreground">
                        {metrics.confidenceScore.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={metrics.confidenceScore} className="h-2" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">High-quality responses: 78%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Needs review: 19%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Low quality: 3%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          {performanceData.map((query, index) => (
            <Card key={index} className="shadow-card bg-white border border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h4 className="font-semibold text-foreground">{query.question}</h4>
                  <div className="flex items-center gap-2">
                    {query.isCorrect ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-700 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Incorrect
                      </Badge>
                    )}
                    <Badge variant="outline">{query.latency.toFixed(1)}s</Badge>
                    <Badge variant="outline">{(query.confidence * 100).toFixed(0)}%</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Expected:</p>
                    <p className="text-foreground">{query.expectedAnswer}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Actual:</p>
                    <p className="text-foreground">{query.actualAnswer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};