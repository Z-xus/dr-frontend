import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, AlertTriangle, Clipboard } from 'lucide-react';
import { Input } from '@/components/ui/input';

type RedactionColor = string;

const Redact: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [redactedImage, setRedactedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [colorFill, setColorFill] = useState<RedactionColor>('#000000');
  const [colorPickerMode, setColorPickerMode] = useState<'preset' | 'custom'>('preset');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const presetColorOptions: RedactionColor[] = [
    '#000000', // Black
    '#FFFFFF', // White
    '#0000FF', // Blue
    '#FF0000', // Red
    '#00FF00', // Green
    '#FFFF00'  // Yellow
  ];

  useEffect(() => {
    // Clipboard paste event listener
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              handleImagePaste(blob);
              break;
            }
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleImagePaste = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setRedactedImage(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImagePaste(file);
    }
  };

  const handleRedact = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1]; // Remove data URL prefix

        try {
          const response = await fetch('http://localhost:3000/redact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64Image,
              color_fill: colorFill.replace('#', ''), // Remove # for API
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Redaction failed');
          }

          const redactedImageBlob = await response.blob();
          const redactedImageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(redactedImageBlob);
          });

          setRedactedImage(redactedImageBase64);
        } catch (apiError) {
          if (apiError instanceof Error)
            setError(apiError.message || 'An unknown error occurred');
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      if (err instanceof Error)
        setError(err.message || 'An unknown error occurred');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Presidio Image Redactor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Upload Section */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={triggerFileInput}
                  className="flex-grow"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? selectedFile.name : 'Upload Image'}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.readText()
                      .then((text) => {
                        // Try to parse as base64 image
                        if (text.startsWith('data:image')) {
                          const blob = dataURLtoBlob(text);
                          handleImagePaste(new File([blob], 'clipboard-image.png'));
                        } else {
                          setError('No image found in clipboard');
                        }
                      })
                      .catch(() => setError('Failed to read clipboard'));
                  }}
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <label className="block">Redaction Color</label>
              <div className="flex space-x-2">
                <Select
                  value={colorPickerMode}
                  onValueChange={(value: 'preset' | 'custom') => setColorPickerMode(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Color Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preset">Preset Colors</SelectItem>
                    <SelectItem value="custom">Custom Color</SelectItem>
                  </SelectContent>
                </Select>

                {colorPickerMode === 'preset' ? (
                  <Select
                    value={colorFill}
                    onValueChange={(value) => setColorFill(value)}
                  >
                    <SelectTrigger className="flex-grow">
                      <SelectValue placeholder="Select Redaction Color" />
                    </SelectTrigger>
                    <SelectContent>
                      {presetColorOptions.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 mr-2 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-2 flex-grow">
                    <Input
                      type="color"
                      value={colorFill}
                      onChange={(e) => setColorFill(e.target.value)}
                      className="h-10 w-full p-0 border-none"
                    />
                    <span>{colorFill}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Redact Button */}
            <Button
              onClick={handleRedact}
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

            {/* Image Preview and Redacted Image */}
            <div className="grid md:grid-cols-2 gap-4">
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

              {redactedImage && (
                <Card>
                  <CardHeader>
                    <CardTitle>Redacted Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={redactedImage}
                      alt="Redacted"
                      className="max-w-full h-auto rounded-md"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Utility function to convert data URL to Blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

export default Redact;
