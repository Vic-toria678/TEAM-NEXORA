'use client';
import EditorView from '@/components/EditorView';
import ImportView from '@/components/ImportView';
import ProcessingView from '@/components/ProcessingView';
import { useSabi } from '@/store/useSabi';

export default function Page() {
  const view = useSabi((s) => s.view);
  if (view === 'import') return <ImportView />;
  if (view === 'processing') return <ProcessingView />;
  return <EditorView />;
}
