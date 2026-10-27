'use client';
// Server state (data from the backend) lives in React Query. UI state lives in the Zustand store.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Language } from './types';

export const useLanguages = () => useQuery({ queryKey: ['languages'], queryFn: api.languages, staleTime: Infinity });

export const useClips = () =>
  useQuery({
    queryKey: ['clips'],
    queryFn: api.listClips,
    refetchInterval: (q) =>
      q.state.data?.some((c) => c.status === 'queued' || c.status === 'processing') ? 1000 : false,
  });

export const useClip = (id: string | null) =>
  useQuery({ queryKey: ['clip', id], queryFn: () => api.getClip(id!), enabled: !!id });

export const useSearch = (q: string) =>
  useQuery({ queryKey: ['search', q], queryFn: () => api.search(q), enabled: q.trim().length > 1 });

export function useUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { files: File[]; language: Language }) => api.uploadFiles(v.files, v.language),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clips'] }),
  });
}

export function useEditSegment(clipId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { index: number; text: string }) => api.editSegment(clipId, v.index, v.text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clip', clipId] }),
  });
}
