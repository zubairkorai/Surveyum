'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const fullName = formData.get('fullName') as string;
  const avatarUrl = formData.get('avatarUrl') as string;

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/profile');
  return { success: true, message: 'Profile updated successfully!' };
}
