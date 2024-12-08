import { useState, useRef, useEffect } from 'react';
import { Upload, Clipboard, X, Download, AlertTriangle, Image as ImageIcon } from 'lucide-react';

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

export default function RedactImage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setProcessedImage(null);
      setError(null);
      // Create preview for original image
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedFile(file);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file (PNG, JPG, JPEG)');
    }
  };

  const handleRedactImage = async () => {
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('language', language);
    formData.append('entities', JSON.stringify(selectedEntities));

    try {
      const response = await fetch('http://localhost:3000/redact-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Image redaction failed');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setProcessedImage(imageUrl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (processedImage && selectedFile) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `redacted-${selectedFile.name}`;
      link.click();
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setProcessedImage(null);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof reader.result === 'string') {
          setSelectedFile(file);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file (PNG, JPG, JPEG)');
    }
  };

  const handleClipboardImage = async (blob: Blob) => {
    if (blob.type.startsWith('image/')) {
      setSelectedFile(new File([blob], 'pasted-image.png', { type: blob.type }));
      setProcessedImage(null);
      setError(null);
    } else {
      setError('Please paste a valid image file');
    }
  };

  useEffect(() => {
    if (imageContainerRef.current) {
      imageContainerRef.current.addEventListener('paste', (event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              const blob = items[i].getAsFile();
              if (blob) {
                handleClipboardImage(blob);
              }
              break;
            }
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedFile(null);
        setProcessedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Image Redactor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={imageContainerRef}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="space-y-6"
            >
              {/* Clipboard Paste Instruction */}
              <div className="bg-secondary p-4 rounded-md text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clipboard className="mr-2 h-6 w-6" />
                  {selectedFile ? (
                    <span>Press Esc to remove the image</span>
                  ) : (
                    <span>Press Ctrl+V (Cmd+V on Mac) to paste an image</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  You can also drag and drop images or use the upload button
                </p>
              </div>

              {/* File Input */}
              {!selectedFile && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.readImage().then(blob => {
                        if (blob) {
                          handleClipboardImage(blob);
                        } else {
                          setError('No image found in clipboard');
                        }
                      }).catch(err => {
                        if (err instanceof Error) {
                          setError('Failed to read clipboard');
                          console.error(err);
                        }
                      });
                    }}
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Paste
                  </Button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
              />

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
                onClick={handleRedactImage}
                disabled={!selectedFile}
                className="w-full"
              >
                Redact Image
              </Button>

              {/* Error Handling */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Image Preview/Result Section */}
              {(selectedFile || processedImage) && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {/* Original Image Preview */}
                  {selectedFile && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Original Image</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md overflow-hidden">
                          {selectedFile && (
                            <img
                              src={URL.createObjectURL(selectedFile)}
                              alt="Original"
                              className="max-h-full max-w-full object-contain"
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Processed Image Preview */}
                  {processedImage && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Redacted Image</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center h-48 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={processedImage}
                            alt="Redacted"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Download Button */}
              {processedImage && (
                <Button
                  onClick={handleDownload}
                  className="w-full mt-4"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Redacted Image
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 