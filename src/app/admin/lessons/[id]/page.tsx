import RequireAuth from '@/components/RequireAuth';
import AdminLessonEditClient from './AdminLessonEditClient';

export default async function AdminLessonEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth adminOnly>
      <AdminLessonEditClient lessonId={id} />
    </RequireAuth>
  );
}
