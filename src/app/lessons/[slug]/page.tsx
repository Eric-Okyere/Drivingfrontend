import LessonDetailClient from './LessonDetailClient';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LessonDetailClient slug={slug} />;
}
