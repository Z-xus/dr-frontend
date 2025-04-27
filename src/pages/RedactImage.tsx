import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckSquare, Clipboard, Download, Image, Languages, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { ENTITY_TYPES, LANGUAGE_OPTIONS } from '@/utils/constants';

export default function RedactImage() {
  const [image, setImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('en');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setProcessedImage(null);
      setError(null);
    } else {
      setError('Please select a valid image file (PNG, JPG, JPEG)');
    }
  };

  const handleRedactImage = async () => {
    if (!image) {
      setError('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('file', image);
    formData.append('language', language);
    formData.append('entities', JSON.stringify(selectedEntities));
    formData.append('score_threshold', '0.4');
    formData.append('return_decision_process', 'true');

    try {
      setIsProcessing(true);
      setError(null);

      const response = await api.post('/redact-image', formData, {
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      setProcessedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `redacted-${image?.name}`;
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
      setImage(file);
      setProcessedImage(null);
      setError(null);
    } else {
      setError('Please select a valid image file (PNG, JPG, JPEG)');
    }
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes('image/png')) {
          const blob = await item.getType('image/png');
          setImage(new File([blob], 'image.png', { type: 'image/png' }));
          break;
        }
      }
    } catch (error: unknown) {
      console.error('Error pasting image:', error);
    }
  };

  useEffect(() => {
    const currentRef = imageContainerRef.current;
    
    if (currentRef) {
      currentRef.addEventListener('paste', handlePaste);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('paste', handlePaste);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setImage(null);
        setProcessedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
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
                  <Image className="absolute inset-0.5 text-primary" size={20} />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Image Redactor
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div 
                ref={imageContainerRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="space-y-4"
              >
                {/* Image Upload Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-muted/30 p-4 rounded-lg text-center relative overflow-hidden group"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="flex items-center justify-center mb-1 relative z-10">
                    <Clipboard className="mr-2 h-5 w-5 text-primary" />
                    {image ? (
                      <span className="text-sm">Press Esc to remove the image</span>
                    ) : (
                      <span className="text-sm">Press Ctrl+V (Cmd+V on Mac) to paste an image</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground relative z-10">
                    You can also drag and drop images or use the upload button
                  </p>
                </motion.div>

                {/* Image Preview */}
                {image && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative group"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Uploaded"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setImage(null);
                        setProcessedImage(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

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
                      <Label className="text-sm font-medium">Entities to Redact</Label>
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
                    onClick={handleRedactImage}
                    disabled={!image || isProcessing}
                    className="w-full h-10 bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Image className="mr-2 h-4 w-4" />
                        Redact Image
                      </>
                    )}
                  </Button>

                  {processedImage && (
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full h-10"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Redacted Image
                    </Button>
                  )}
                </motion.div>

                {/* Processed Image Preview */}
                {processedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="relative group"
                  >
                    <img
                      src={processedImage}
                      alt="Redacted"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
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
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}