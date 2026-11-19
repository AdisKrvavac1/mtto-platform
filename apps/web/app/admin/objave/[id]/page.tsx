import PostEditor from '@/components/admin/PostEditor';
export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostEditor id={id} />;
}
