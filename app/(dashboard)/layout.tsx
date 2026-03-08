import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar profile={profile} userEmail={user?.email} />

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 w-full min-w-0">
        {children}
      </main>
    </div>
  );
}
