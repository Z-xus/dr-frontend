import { motion } from 'framer-motion'
import { AlertTriangle, CheckSquare, Clipboard, Download, FileSearch, Languages, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/axios'
import { cn } from '@/lib/utils'
import { API_ENDPOINTS, ENTITY_TYPES, ERROR_MESSAGES, LANGUAGE_OPTIONS } from '@/utils/constants'

interface AnalysisResult {
  [key: string]: number;
}

export default function Analyzer() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!text) {
      setError(ERROR_MESSAGES.NO_TEXT);
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      const payload = {
        text,
        language,
        entities: selectedEntities.length ? selectedEntities : undefined,
      };
      const response = await api.post(API_ENDPOINTS.ANALYZE, payload);
      setAnalysisResult(response.data);
    } catch (err) {
      setError(ERROR_MESSAGES.ANALYSIS_FAILED);
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (analysisResult) {
      const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analysis-results.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setText(text);
    } catch (error) {
      console.error('Error pasting text:', error);
    }
  };

  useEffect(() => {
    const currentRef = textContainerRef.current;
    
    if (currentRef) {
      currentRef.addEventListener('paste', handlePaste);
    }

    // Add event listener for Esc key
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setText('');
      }
    };

    window.addEventListener('keydown', handleEscKey);

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('paste', handlePaste);
      }
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-background via-background/95 to-background/90 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border-primary/10 backdrop-blur-sm bg-background/95 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/80">
            </div>
            
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
                <div className="relative h-6 w-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-md grid grid-cols-2 grid-rows-2">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className={cn(Math.random() > 0.5 ? 'bg-primary/40' : 'bg-transparent')}></div>
                    ))}
                  </div>
                  <FileSearch className="absolute inset-0.5 text-primary" size={20} />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  PII Analyzer
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Text Input Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-muted/30 p-4 rounded-lg text-center relative overflow-hidden group"
              >
                <div className="flex items-center justify-center mb-1 relative z-10">
                  <Clipboard className="mr-2 h-5 w-5 text-primary" />
                  {text ? (
                    <span className="text-sm">Press Esc to clear the text</span>
                  ) : (
                    <span className="text-sm">Press Ctrl+V (Cmd+V on Mac) to paste text</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground relative z-10">
                  You can also drag and drop text or type directly
                </p>
              </motion.div>

              {/* Text Area */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative group"
              >
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter or paste text to analyze for sensitive information..."
                  className="min-h-[100px] resize-none"
                />
                {text && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setText('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>

              {/* Language and Entity Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Language Selection */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-medium">Language</Label>
                  </div>
                  <Select
                    value={language}
                    onValueChange={setLanguage}
                  >
                    <SelectTrigger className="w-full h-9 bg-background/50">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity Selection */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <Label className="text-sm font-medium">Entities to Analyze</Label>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ENTITY_TYPES.map(entity => (
                      <Badge
                        key={entity}
                        variant={selectedEntities.includes(entity) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
                        onClick={() => {
                          if (selectedEntities.includes(entity)) {
                            setSelectedEntities(prev => prev.filter(e => e !== entity));
                          } else {
                            setSelectedEntities(prev => [...prev, entity]);
                          }
                        }}
                      >
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-3"
              >
                <Button
                  onClick={handleAnalyze}
                  disabled={!text || isAnalyzing}
                  className="w-full h-10 bg-primary hover:bg-primary/90"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileSearch className="mr-2 h-4 w-4" />
                      Analyze Text
                    </>
                  )}
                </Button>

                {analysisResult && (
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full h-10"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Analysis Report
                  </Button>
                )}
              </motion.div>

              {/* Results */}
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-muted/30 p-3 rounded-lg"
                >
                  <div className="space-y-3">
                    {Object.entries(analysisResult).map(([entity, count]) => (
                      <div key={entity} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{entity}</span>
                        <Badge variant="outline" className="text-xs">
                          {count} found
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Alert variant="destructive" className="py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-sm">Error</AlertTitle>
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
