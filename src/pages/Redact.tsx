import { Upload, Clipboard, X, Download, AlertTriangle } from 'lucide-react';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';

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

import { LANGUAGE_OPTIONS, FILE_TYPES, ENTITY_TYPES } from '../utils/constants';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [processedContent, setProcessedContent] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [applyOCR, setApplyOCR] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

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

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClipboardImage = async (blob: Blob) => {
    setSelectedFile(new File([blob], 'pasted-image.png', { type: blob.type }));
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(blob);
  };

  const handleRedact = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('data', JSON.stringify({
      color_fill: '000', // Example color fill, adjust as needed
      analyzer_entities: selectedEntities,
      apply_ocr: applyOCR,
    }));
    try {
      const response = await fetch('http://localhost:3000/redact', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Redaction failed');
      }
      const result = await response.blob();
      const reader = new FileReader();
      if (selectedFile.type.startsWith('image/')) {
        reader.onloadend = () => setProcessedContent(reader.result as string | null);
        reader.readAsDataURL(result);
        setError(null);
      } else {
        reader.onloadend = () => setProcessedContent(reader.result as string | null);
        reader.readAsText(result);
      }
    } catch (err) {
      setError('An error occurred during redaction');
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (processedContent && selectedFile) {
      const link = document.createElement('a');
      const fileExtension = selectedFile.type.split('/').pop();
      const defaultExtension = previewImage ? 'png' : 'txt';
      const extension = fileExtension || defaultExtension;

      link.href = processedContent;
      link.download = `redacted-document.${extension}`;
      link.click();
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
        setPreviewImage(null);
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
                  {selectedFile ? (<span>Press Esc to remove the image</span>) : (<span>Press Ctrl+V (Cmd+V on Mac) to paste an image</span>)}

                </div>
                <p className="text-sm text-muted-foreground">
                  You can also drag and drop images or use the upload button
                </p>
              </div>

              {/* Image Preview */}
              {previewImage && (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Pasted or Uploaded"
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

              {/* File Upload and Paste Buttons */}
              {
                !selectedFile && (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
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
                )
              }

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={FILE_TYPES.map(type => `.${type}`).join(',')}
                className="hidden"
              />

              {/* Language and OCR Selection */}
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

                {selectedFile?.type.startsWith('image/') && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="apply-ocr"
                      checked={applyOCR}
                      onCheckedChange={(checked) => setApplyOCR(!!checked)}
                    />
                    <Label htmlFor="apply-ocr">Apply OCR</Label>
                  </div>
                )}
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
                onClick={handleRedact}
                disabled={!selectedFile}
                className="w-full"
              >
                Redact Document
              </Button>

              {/* Error Handling */}
              {error !== null && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{`${error} ${typeof error}`}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Preview/Result Section */}
              {(previewImage || processedContent) && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {/* Original Content */}
                  {previewImage && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Original Image</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img
                          src={previewImage}
                          alt="Original"
                          className="max-w-full h-auto rounded-md"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Processed Content */}
                  {processedContent && (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {previewImage ? 'Redacted Image' : 'Result'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {previewImage ? (
                          <img
                            src={processedContent as string}
                            alt="Redacted"
                            className="max-w-full h-auto rounded-md"
                          />
                        ) : (
                          <div className="overflow-x-auto max-h-[300px]">
                            Redact an image to see the preview here
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Download Button */}
              {processedContent && (
                <Button
                  onClick={handleDownload}
                  className="w-full mt-4"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Redacted {previewImage ? 'Image' : 'Document'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

