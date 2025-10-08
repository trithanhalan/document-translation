
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
import { useFirebase, initiateAnonymousSignIn, FirestorePermissionError, errorEmitter } from "@/firebase";
import { getStorage, ref, uploadBytesResumable, UploadTask, UploadTaskSnapshot, getDownloadURL } from "firebase/storage";
import { collection, serverTimestamp, doc, DocumentReference, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LANGUAGES } from "@/lib/constants";

export function UploadArea() {
  const { toast } = useToast();
  const { firestore, user, auth, isUserLoading } = useFirebase();
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("de");
  
  // Hold a reference to the task doc so we can cancel it
  const [taskDocRef, setTaskDocRef] = useState<DocumentReference | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, auth, isUserLoading]);

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
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ variant: "destructive", title: "No file selected" });
      return;
    }
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Authentication Error" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const file = files[0];
    
    // 1. Generate a client-side ID for the task *before* doing anything else.
    const newTaskRef = doc(collection(firestore, "translationTasks"));
    const taskId = newTaskRef.id;
    setTaskDocRef(newTaskRef); // Store ref for cancellation

    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${taskId}/${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    setUploadTask(task);

    // Create the document immediately so the UI can reflect the "uploading" state
    const initialTaskData = {
        fileName: file.name,
        status: 'uploading',
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerUid: user.uid,
        srcLang: sourceLang, 
        tgtLang: targetLang,
    };
    setDoc(newTaskRef, initialTaskData).catch(async (error) => {
        const contextualError = new FirestorePermissionError({
            path: newTaskRef.path,
            operation: 'create',
            requestResourceData: initialTaskData,
        });
        errorEmitter.emit('permission-error', contextualError);
        setIsUploading(false);
    });

    task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
        const progressData = { progress: Math.round(progress * 0.2) };
        updateDoc(newTaskRef, progressData).catch(async (error) => {
             const contextualError = new FirestorePermissionError({
                path: newTaskRef.path,
                operation: 'update',
                requestResourceData: progressData,
            });
            errorEmitter.emit('permission-error', contextualError);
        });
      },
      (error: any) => {
        if (error.code !== 'storage/canceled') {
          updateDoc(newTaskRef, { status: 'failed', errors: ['Upload failed: ' + error.code], progress: 0 })
            .catch(async (updateError) => {
                const contextualError = new FirestorePermissionError({
                    path: newTaskRef.path,
                    operation: 'update',
                    requestResourceData: { status: 'failed' },
                });
                errorEmitter.emit('permission-error', contextualError);
            });
        } else {
            deleteDoc(newTaskRef).catch(async (deleteError) => {
                 const contextualError = new FirestorePermissionError({
                    path: newTaskRef.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', contextualError);
            });
        }
        setIsUploading(false);
        setFiles([]);
        setUploadTask(null);
        setTaskDocRef(null);
      },
      async () => {
        const downloadURL = await getDownloadURL(task.snapshot.ref);
        const finalData = { status: 'pending', progress: 20, downloadURL };
        await updateDoc(newTaskRef, finalData).catch(async (error) => {
            const contextualError = new FirestorePermissionError({
                path: newTaskRef.path,
                operation: 'update',
                requestResourceData: finalData,
            });
            errorEmitter.emit('permission-error', contextualError);
        });
        
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
          const response = await fetch(`${backendUrl}/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId: taskId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Backend processing failed to start.');
          }
        } catch (error: any) {
           await updateDoc(newTaskRef, { status: 'failed', errors: ['Backend trigger failed: ' + error.message] });
        }

        setIsUploading(false);
        setFiles([]);
        setUploadTask(null);
        setTaskDocRef(null);
      }
    );
  };

  const removeFile = () => {
    setFiles([]);
  };

  const cancelUpload = () => {
    if (uploadTask) {
        uploadTask.cancel();
        toast({ title: "Upload Canceled" });
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-card/50">
      <CardHeader>
        <CardTitle className="font-headline text-3xl tracking-tight text-foreground">
          New Translation
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Upload a document to begin the translation process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 && !isUploading ? (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <FileUp className="h-12 w-12 text-primary" />
                <p className="font-semibold text-lg">Drop your document here</p>
                <p className="text-sm">or click to browse</p>
                <p className="text-xs mt-4">Supports: PDF, DOCX, TXT (Max 50MB)</p>
                </div>
            </div>
            <div className="prose prose-invert max-w-none text-muted-foreground">
                <h4 className="text-foreground font-semibold">Getting Started</h4>
                <ol>
                    <li>Select the source and target languages for your translation.</li>
                    <li>Drag and drop your document into the upload area, or click to select a file from your computer.</li>
                    <li>Once uploaded, the translation process will begin automatically.</li>
                    <li>You can monitor the progress of your translation on the main dashboard.</li>
                </ol>
            </div>
           </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Source Language
                </label>
                <Select value={sourceLang} onValueChange={setSourceLang} disabled={isUploading}>
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
                <Select value={targetLang} onValueChange={setTargetLang} disabled={isUploading}>
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
              <Button onClick={handleUpload} className="w-full sm:w-auto" disabled={!user || isUserLoading}>
                 {isUserLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 ) : null}
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

    