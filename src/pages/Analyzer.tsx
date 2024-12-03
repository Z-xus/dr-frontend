
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';

export default function AnalyzerPage() {
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [entities, setEntities] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [recognizers, setRecognizers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch health status
  const fetchHealthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) throw new Error('Failed to fetch health status');
      const status = await response.text();
      setHealthStatus(status);
    } catch (err) {
      setError('Error fetching health status');
    }
  };

  // Fetch supported entities
  const fetchSupportedEntities = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/supportedentities?language=${language}`
      );
      if (!response.ok) throw new Error('Failed to fetch supported entities');
      const entities = await response.json();
      setEntities(entities);
    } catch (err) {
      setError('Error fetching supported entities');
    }
  };

  // Fetch recognizers
  const fetchRecognizers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/recognizers?language=${language}`
      );
      if (!response.ok) throw new Error('Failed to fetch recognizers');
      const recognizers = await response.json();
      setRecognizers(recognizers);
    } catch (err) {
      setError('Error fetching recognizers');
    }
  };

  // Analyze text
  const handleAnalyze = async () => {
    if (!text) {
      setError('Text input is required');
      return;
    }
    try {
      const payload = {
        text,
        language,
        entities: selectedEntities.length ? selectedEntities : undefined,
      };
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to analyze text');
      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError('Error analyzing text');
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Presidio Analyzer Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Health Status */}
            <div className="mb-6">
              <h2 className="text-lg font-medium">Server Health</h2>
              <p className="text-sm text-muted-foreground">
                {healthStatus || 'Checking server health...'}
              </p>
            </div>

            {/* Language Selection */}
            <div className="mb-6">
              <h2 className="text-lg font-medium">Select Language</h2>
              <Select
                value={language}
                onValueChange={(value) => {
                  setLanguage(value);
                  fetchSupportedEntities();
                  fetchRecognizers();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  {/* Add more languages as needed */}
                </SelectContent>
              </Select>
            </div>

            {/* Supported Entities */}
            <div className="mb-6">
              <h2 className="text-lg font-medium">Supported Entities</h2>
              <div className="grid grid-cols-3 gap-2">
                {entities.map((entity) => (
                  <label
                    key={entity}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEntities.includes(entity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEntities((prev) => [...prev, entity]);
                        } else {
                          setSelectedEntities((prev) =>
                            prev.filter((ent) => ent !== entity)
                          );
                        }
                      }}
                    />
                    <span>{entity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recognizers */}
            <div className="mb-6">
              <h2 className="text-lg font-medium">Recognizers</h2>
              <ul className="list-disc list-inside">
                {recognizers.map((recognizer) => (
                  <li key={recognizer}>{recognizer}</li>
                ))}
              </ul>
            </div>

            {/* Text Input */}
            <div className="mb-6">
              <h2 className="text-lg font-medium">Text to Analyze</h2>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text here..."
              />
            </div>

            {/* Analyze Button */}
            <Button onClick={handleAnalyze} className="w-full">
              Analyze
            </Button>

            {/* Analysis Result */}
            {analysisResult && (
              <div className="mt-6">
                <h2 className="text-lg font-medium">Analysis Result</h2>
                <pre className="bg-gray-200 p-4 rounded-md overflow-auto">
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              </div>
            )}

            {/* Error Handling */}
            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
