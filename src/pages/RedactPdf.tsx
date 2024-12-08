import { useState, useRef } from 'react';
import { Upload, Clipboard, X, Download, AlertTriangle, FileText } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { LANGUAGE_OPTIONS, ENTITY_TYPES } from '../utils/constants';

export default function RedactPdf() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedPdf, setProcessedPdf] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setProcessedPdf(null);
      setError(null);
    } else {
      setError('Please select a PDF file');
    }
  };


  const handleRedactPdf = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('language', language);
    formData.append('entities', JSON.stringify(selectedEntities));
    formData.append('score_threshold', '0.4');
    formData.append('return_decision_process', 'true');

    try {
      const response = await fetch('http://localhost:3000/redact-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF redaction failed');
      }

      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      setProcessedPdf(pdfUrl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error(err);
    }
  };


  // const handleRedactPdf = async () => {
  //   if (!selectedFile) {
  //     setError('Please select a PDF file');
  //     return;
  //   }
  //
  //   const formData = new FormData();
  //   formData.append('file', selectedFile);
  //   formData.append('language', language);
  //   formData.append('entities', JSON.stringify(selectedEntities));
  //   formData.append('score_threshold', '0.4');
  //   formData.append('return_decision_process', 'true');
  //
  //   try {
  //     const response = await fetch('http://localhost:3000/redact-pdf', {
  //       method: 'POST',
  //       body: formData,
  //     });
  //
  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'PDF redaction failed');
  //     }
  //
  //     const blob = await response.blob();
  //     const pdfUrl = URL.createObjectURL(blob);
  //     setProcessedPdf(pdfUrl);
  //     setError(null);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'An unexpected error occurred');
  //     console.error(err);
  //   }
  // };

  const handleDownload = () => {
    if (processedPdf && selectedFile) {
      const link = document.createElement('a');
      link.href = processedPdf;
      link.download = `redacted-${selectedFile.name}`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              PDF Redactor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* PDF Upload Section */}
              <div className="bg-secondary p-4 rounded-md text-center">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="mr-2 h-6 w-6" />
                  <span>Upload a PDF to redact sensitive information</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select a PDF file to remove or mask sensitive content
                </p>
              </div>

              {/* File Input */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />

                {selectedFile && (
                  <div className="col-span-2 text-center text-sm text-muted-foreground">
                    {selectedFile.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setProcessedPdf(null);
                      }}
                      className="ml-2"
                    >
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Language Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Language</Label>
                  <Select
                    value={language}
                    onValueChange={setLanguage}
                  >
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
              </div>

              {/* Entity Selection */}
              <div>
                <Label>Select Entities to Redact</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {ENTITY_TYPES.map(entity => (
                    <div key={entity} className="flex items-center space-x-2">
                      <Checkbox
                        id={entity}
                        checked={selectedEntities.includes(entity)}
                        onCheckedChange={(checked) => {
                          setSelectedEntities(prev =>
                            checked
                              ? [...prev, entity]
                              : prev.filter(e => e !== entity)
                          );
                        }}
                      />
                      <Label htmlFor={entity}>{entity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Redact Button */}
              <Button
                onClick={handleRedactPdf}
                disabled={!selectedFile}
                className="w-full"
              >
                Redact PDF
              </Button>

              {/* Error Handling */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* PDF Preview/Result Section */}
              {(selectedFile || processedPdf) && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {/* Original PDF Preview */}
                  {selectedFile && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Original PDF</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md">
                          <FileText className="h-12 w-12 text-gray-400" />
                          <span className="ml-2 text-muted-foreground">{selectedFile.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Processed PDF Preview */}
                  {processedPdf && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Redacted PDF</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md">
                          <FileText className="h-12 w-12 text-green-500" />
                          <span className="ml-2 text-green-600">PDF Redacted Successfully</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Download Button */}
              {processedPdf && (
                <Button
                  onClick={handleDownload}
                  className="w-full mt-4"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Redacted PDF
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
