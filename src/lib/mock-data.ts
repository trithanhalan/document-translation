import type { TranslationTask } from './types';

export const mockTasks: TranslationTask[] = [
  {
    id: 'task-1',
    fileName: 'Annual_Report_2023.docx',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sourceLang: 'en',
    targetLang: 'de',
  },
  {
    id: 'task-2',
    fileName: 'Marketing_Presentation_Q2.pdf',
    status: 'review',
    progress: 100,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sourceLang: 'en',
    targetLang: 'fr',
  },
  {
    id: 'task-3',
    fileName: 'Technical_Specification_v3.pdf',
    status: 'processing',
    progress: 65,
    createdAt: new Date().toISOString(),
    sourceLang: 'en',
    targetLang: 'ja',
  },
  {
    id: 'task-4',
    fileName: 'legal_agreement.txt',
    status: 'failed',
    progress: 40,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sourceLang: 'es',
    targetLang: 'en',
  },
    {
    id: 'task-5',
    fileName: 'User_Manual_Final.docx',
    status: 'uploading',
    progress: 30,
    createdAt: new Date().toISOString(),
    sourceLang: 'en',
    targetLang: 'it',
  },
];
