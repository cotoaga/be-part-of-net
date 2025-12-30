import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NetworkView from '@/components/NetworkView';

export default async function NetworkPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Get user's node from database
  const { data: userNodes } = await supabase
    .from('nodes')
    .select('id, name')
    .eq('type', 'person')
    .eq('email', user.email)
    .single();

  return (
    <NetworkView
      userEmail={user.email!}
      userNodeId={userNodes?.id || null}
      userName={userNodes?.name || 'User'}
    />
  );
}
