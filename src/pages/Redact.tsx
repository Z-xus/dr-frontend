import React, { useState, useRef, useEffect } from 'react';
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
import {
  Upload,
  AlertTriangle,
  Download,
  Clipboard,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Entities supported for redaction
const ENTITY_TYPES = [
  "PERSON",
  "EMAIL_ADDRESS",
  "PHONE_NUMBER",
  "CREDIT_CARD",
  "CRYPTO",
  "DOMAIN_NAME",
  "IP_ADDRESS",
  "DATE_TIME",
  "NRP",
  "LOCATION",
  "MEDICAL_LICENSE",
  "URL",
  "ORGANIZATION"
];

// Language options
const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "mr", label: "Marathi" }
];

// File type mapping
const FILE_TYPES = [
  "csv", "json", "xlsx", "pdf", "docx",
  "png", "jpg", "jpeg"
];

const PresidioRedactor: React.FC = () => {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedContent, setProcessedContent] = useState<string | ArrayBuffer | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [selectedEntities, setSelectedEntities] = useState<string[]>([
    "PERSON",
    "EMAIL_ADDRESS",
    "PHONE_NUMBER"
  ]);
  const [applyOCR, setApplyOCR] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);


  // Clipboard Paste Handler
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      // Ensure we're not in an input field
      if (document.activeElement !== document.body) return;

      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              handleClipboardImage(blob);
              break;
            }
          }
        }
      }
    };

    // Add event listener
    document.addEventListener('paste', handlePaste);

    // Cleanup
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Handle Clipboard Image
  const handleClipboardImage = (blob: File) => {
    // Create a file from the blob
    const file = new File([blob], 'clipboard-image.png', { type: blob.type });

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // File handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);

      // Preview image if it's an image file
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };


  // Drag and Drop Handlers
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      setSelectedFile(files[0]);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Redaction handler
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
        reader.onloadend = () => setProcessedContent(reader.result);
        reader.readAsDataURL(result);
      } else {
        reader.onloadend = () => setProcessedContent(reader.result);
        reader.readAsText(result);
      }
    } catch (err) {
      setError('An error occurred during redaction');
      console.error(err);
    }
  };

  // Download handler
  const handleDownload = () => {
    if (!processedContent) return;

    const fileExtension = selectedFile?.name.split('.').pop() || 'txt';
    const mimeTypes: { [key: string]: string } = {
      'csv': 'text/csv',
      'json': 'application/json',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg'
    };

    const blob = new Blob([processedContent], {
      type: mimeTypes[fileExtension] || 'text/plain'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redacted_document.${fileExtension}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={imageContainerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Image Redactor
            <span className="text-sm text-muted-foreground ml-2">
              (Paste or Drag & Drop Images) </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Clipboard Paste Instruction */}
          <div className="bg-secondary p-4 rounded-md mb-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clipboard className="mr-2 h-6 w-6" />
              <span>Press Ctrl+V (Cmd+V on Mac) to paste an image</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You can also drag and drop images or use the upload button
            </p>
          </div>

          {/* Image Preview */}
          {previewImage && (
            <div className="mb-4">
              <img
                src={previewImage}
                alt="Pasted or Uploaded"
                className="max-w-full h-auto rounded-md mx-auto"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="flex-grow"
              onClick={() => {
                // Trigger clipboard paste programmatically
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
              Paste from Clipboard
            </Button>
          </div>
          {/* File Upload */}
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={FILE_TYPES.map(type => `.${type}`).join(',')}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? selectedFile.name : 'Upload Document/Image'}
            </Button>

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

              {/* OCR Toggle for Images */}
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
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
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
                        {previewImage ? 'Redacted Image' : 'Redacted Document'}
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
                        <pre className="overflow-x-auto max-h-[300px]">
                          {processedContent as string}
                        </pre>
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
  );
};

export default PresidioRedactor;
