"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, File, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export function UploadArea() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      toast({
        variant: "destructive",
        title: "File upload error",
        description: fileRejections[0].errors[0].message,
      });
      return;
    }
    setFiles(acceptedFiles);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 50 * 1024 * 1024, // 50 MB
    multiple: false,
  });

  const handleUpload = () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload.",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Mock upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      toast({
        title: "Upload Complete (Mock)",
        description: `${files[0].name} is now being processed.`,
      });
      setFiles([]);
    }, 2500);
  };
  
  const removeFile = () => {
    setFiles([]);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="font-headline text-3xl tracking-tight text-foreground">Upload Document</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Drag and drop your document here or click to browse. Supported formats:
          PDF, DOCX, TXT. Max file size: 50MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 && !isUploading ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileUp className="h-8 w-8" />
              <p>Drag 'n' drop a file here, or click to select a file</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <File className="h-6 w-6 text-primary" />
                  <span className="font-medium">{file.name}</span>
                </div>
                {!isUploading && (
                  <Button variant="ghost" size="icon" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {isUploading && (
              <div>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2 text-center">Uploading... {Math.round(uploadProgress)}%</p>
              </div>
            )}
            {!isUploading && files.length > 0 && (
              <Button onClick={handleUpload} className="w-full sm:w-auto">
                Start Translation
              </Button>
            )}
            {isUploading && (
                <Button disabled className="w-full sm:w-auto">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
