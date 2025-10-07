
"use client";

import React, { useState, useCallback, useEffect } from "react";
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
import { useFirebase, initiateAnonymousSignIn } from "@/firebase";
import { getStorage, ref, uploadBytesResumable, UploadTask } from "firebase/storage";
import { collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LANGUAGES } from "@/lib/constants";

export function UploadArea() {
  const { toast } = useToast();
  const { firestore, user, auth } = useFirebase();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("de");


  useEffect(() => {
    // Sign in anonymously if no user is present
    if (!user && auth) {
      initiateAnonymousSignIn(auth);
      toast({
        title: "Signed In",
        description: "You are signed in anonymously.",
      });
    }
  }, [user, auth, toast]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        toast({
          variant: "destructive",
          title: "File upload error",
          description: fileRejections[0].errors[0].message,
        });
        return;
      }
      setFiles(acceptedFiles);
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "text/plain": [".txt"],
    },
    maxSize: 50 * 1024 * 1024, // 50 MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload.",
      });
      return;
    }
    if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to upload files.",
        });
        return;
      }

    setIsUploading(true);
    setUploadProgress(0);
    const file = files[0];

    try {
        // 1. Create a task document in Firestore
        const taskDocRef = await addDoc(collection(firestore, "translationTasks"), {
            fileName: file.name,
            status: 'uploading',
            progress: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ownerUid: user.uid,
            sourceLang: sourceLang, 
            targetLang: targetLang,
        });

        const taskId = taskDocRef.id;

        // 2. Upload the file to Firebase Storage
        const storage = getStorage();
        const storageRef = ref(storage, `uploads/${taskId}/${file.name}`);
        const task = uploadBytesResumable(storageRef, file);
        setUploadTask(task);

        task.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
                updateDoc(taskDocRef, { progress: Math.round(progress * 0.5) }); // Upload is 50% of total
            },
            (error) => {
                console.error("Upload failed:", error);
                toast({
                    variant: "destructive",
                    title: "Upload Failed",
                    description: "An error occurred while uploading the file.",
                });
                updateDoc(taskDocRef, { status: 'failed', errors: ['Upload failed'] });
                setIsUploading(false);
            },
            () => {
                // 3. On successful upload
                toast({
                    title: "Upload Complete",
                    description: `${file.name} is now queued for processing.`,
                });
                updateDoc(taskDocRef, { status: 'pending', progress: 50 });
                setIsUploading(false);
                setFiles([]);
                setUploadTask(null);
            }
        );

    } catch (error) {
        console.error("Error creating translation task:", error);
        toast({
          variant: "destructive",
          title: "Task Creation Failed",
          description: "Could not create the translation task in the database.",
        });
        setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFiles([]);
  };

  const cancelUpload = () => {
    if (uploadTask) {
        uploadTask.cancel();
        setIsUploading(false);
        setUploadProgress(0);
        setFiles([]);
        toast({ title: "Upload Canceled" });
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="font-headline text-3xl tracking-tight text-foreground">
          Upload Document
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Drag and drop your document here or click to browse. Supported
          formats: PDF, DOCX, TXT. Max file size: 50MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 && !isUploading ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Source Language
                </label>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Target Language
                </label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
            {!isUploading && files.length > 0 && (
              <Button onClick={handleUpload} className="w-full sm:w-auto" disabled={!user}>
                Start Translation
              </Button>
            )}
            {isUploading && (
              <div className="flex gap-2">
                <Button disabled className="w-full sm:w-auto">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                </Button>
                <Button onClick={cancelUpload} variant="outline">Cancel</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
