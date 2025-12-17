import Plans from '@/components/billing/plans';
import { getUserSubscription, UserSubscription } from '@/db';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const Page = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const userSubscription: UserSubscription | null = await getUserSubscription(
    supabase,
    {
      userId: user.id,
    }
  ).catch((error) => {
    console.error('Error in getUserSubscription: ', error);
    return null;
  });

  return (
    <>
      <Plans userSubscription={userSubscription} />
    </>
  );
};

export default Page;
