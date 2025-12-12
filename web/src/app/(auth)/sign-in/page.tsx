import SignInForm from '@/components/auth/sign-in-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const Page = async () => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (data?.user) redirect('/');

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <SignInForm />
    </main>
  );
};

export default Page;
