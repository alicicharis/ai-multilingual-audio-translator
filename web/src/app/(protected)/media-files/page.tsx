import MediaFilesList from '@/components/media-files/media-files-list';
import MediaFilesUpload from '@/components/media-files/media-files-upload';
import { getMediaFiles } from '@/db';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const Page = async () => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect('/sign-in');
  }

  const mediaFiles = await getMediaFiles(supabase, {
    userId: data.user.id,
  }).catch((error) => {
    console.error('Error in getMediaFiles: ', error);
    return [];
  });

  return (
    <>
      <MediaFilesUpload />
      <MediaFilesList mediaFiles={mediaFiles ?? []} />
    </>
  );
};

export default Page;
