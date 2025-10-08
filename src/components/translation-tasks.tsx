'use client';

import React, { useEffect, useState } from 'react';
import type { TranslationTask } from '@/lib/types';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  File,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader,
  Hourglass,
  Download,
} from 'lucide-react';
import { Progress } from './ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from './ui/skeleton';

const statusIcons: { [key in TranslationTask['status']]: React.ReactNode } = {
  pending: <Hourglass className="text-yellow-500" />,
  uploading: <Loader className="animate-spin text-blue-500" />,
  processing: <RefreshCw className="animate-spin text-blue-500" />,
  review: <File className="text-purple-500" />,
  completed: <CheckCircle2 className="text-green-500" />,
  failed: <AlertTriangle className="text-red-500" />,
};

const statusColors: { [key in TranslationTask['status']]: string } = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  uploading: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  review: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  completed: 'bg-green-500/10 text-green-600 border-green-500/20',
  failed: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function TranslationTasks() {
  const { firestore, user } = useFirebase();

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'translationTasks'),
      where('ownerUid', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: tasks, isLoading, error } = useCollection<TranslationTask>(tasksQuery);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="font-headline text-3xl tracking-tight">Translation Jobs</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Track the progress of your document translations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
                Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                ))
            )}
            {!isLoading && tasks && tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.fileName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{task.sourceLang.toUpperCase()}</Badge>
                    <span>→</span>
                    <Badge variant="outline">{task.targetLang.toUpperCase()}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`capitalize ${statusColors[task.status]}`}>
                    {statusIcons[task.status]}
                    <span className="ml-2">{task.status}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={task.progress} className="w-24" />
                    <span className="text-sm text-muted-foreground">
                      {task.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {task.createdAt ? formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  }) : 'Just now'}
                </TableCell>
                <TableCell className="text-right">
                  {task.status === 'completed' && (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                   {task.status === 'review' && (
                    <Button variant="default" size="sm">
                      <File className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && (!tasks || tasks.length === 0) && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        No translation jobs found. Upload a document to get started.
                    </TableCell>
                </TableRow>
            )}
             {error && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-destructive h-24">
                        Error loading tasks: {error.message}
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
