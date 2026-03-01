import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import WriteClient from './WriteClient';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Write — WokPost' };

export default async function WritePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/write');

  return <WriteClient author={session.user.name ?? 'Eral'} authorId={session.user.id} />;
}
