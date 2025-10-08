'use client';
import { use } from 'react';
import { useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import { TranslationView } from '@/components/app/translation-view';

export default function ReviewPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { firestore } = useFirebase();
  const { taskId } = use(params);

  const taskDocRef = useMemoFirebase(() => {
    if (!firestore || !taskId) return null;
    return doc(firestore, 'translationTasks', taskId);
  }, [firestore, taskId]);

  const segmentsQuery = useMemoFirebase(() => {
    if (!taskDocRef) return null;
    return query(collection(taskDocRef, 'segments'));
  }, [taskDocRef]);

  const { data: segments, isLoading: isLoadingSegments } = useCollection(segmentsQuery);
  const { data: task, isLoading: isLoadingTask } = useCollection(taskDocRef as any);

  if (isLoadingTask || isLoadingSegments) {
    return <div>Loading...</div>;
  }

  if (!task) {
    return <div>Task not found.</div>;
  }

  return (
    <TranslationView
      task={task as any}
      segments={segments as any}
      isLoading={isLoadingTask || isLoadingSegments}
    />
  );
}
