import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Clipboard, Upload, X, Download } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '@/utils/constants';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Test() {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [processedText, setProcessedText] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<'anonymize' | 'redact'>('anonymize');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResults(data.results);
      setError(null);
    } catch (err) {
      setError('An error occurred during analysis');
      console.error(err);
    }
  };

  const handleProcessText = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          action,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Processing failed');
      }

      const data = await response.json();
      setProcessedText(data.processed_text);
      setError(null);
    } catch (err) {
      setError('An error occurred during processing');
      console.error(err);
    }
  };

  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      setError('Failed to copy to clipboard');
      console.error(err);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('fill', 'black');

    try {
      const response = await fetch('http://localhost:5000/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image processing failed');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setProcessedImage(imageUrl);
      setError(null);
    } catch (err) {
      setError('An error occurred during image processing');
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `redacted-${selectedFile?.name || 'image.png'}`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Privacy Processor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text Processing</TabsTrigger>
                <TabsTrigger value="image">Image Processing</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter text to process..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[150px]"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
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

                    <div>
                      <Select value={action} onValueChange={(value: 'anonymize' | 'redact') => setAction(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anonymize">Anonymize</SelectItem>
                          <SelectItem value="redact">Redact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleAnalyze}>Analyze Text</Button>
                    <Button onClick={handleProcessText}>Process Text</Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {analysisResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResults.map((result, index) => (
                          <div key={index} className="p-2 bg-secondary rounded-md">
                            <p><strong>Entity Type:</strong> {result.entity_type}</p>
                            <p><strong>Start:</strong> {result.start}</p>
                            <p><strong>End:</strong> {result.end}</p>
                            <p><strong>Score:</strong> {result.score}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {processedText && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        Processed Text
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(processedText)}
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-secondary rounded-md whitespace-pre-wrap">
                        {processedText}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="image" className="space-y-6">
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>

                  {previewImage && (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Selected"
                        className="max-w-full h-auto rounded-md mx-auto"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewImage(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleProcessImage}
                    disabled={!selectedFile}
                    className="w-full"
                  >
                    Process Image
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {processedImage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Processed Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="max-w-full h-auto rounded-md"
                      />
                    </CardContent>
                  </Card>
                )}

                {processedImage && (
                  <Button
                    onClick={handleDownload}
                    className="w-full mt-4"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Processed Image
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
