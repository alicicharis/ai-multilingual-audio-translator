'use server';

import { signInUser, signUpUser } from '@/db';
import { actionClient } from '@/lib/safe-action';
import { createClient } from '@/lib/supabase/server';
import { signInSchema, signUpSchema } from '@/validations';

export const signUpAction = actionClient
  .inputSchema(signUpSchema)
  .action(async ({ parsedInput: { email, username, password } }) => {
    try {
      const supabase = await createClient();

      const newUser = await signUpUser(supabase, email, password, username);

      if (!newUser?.user?.id) {
        return {
          success: false,
          message: 'Something went wrong',
          data: null,
        };
      }

      return {
        success: true,
        message: 'User created successfully',
        data: null,
      };
    } catch (error) {
      console.error('Erorr in signUpAction: ', error);
      return {
        success: false,
        message: 'Something went wrong',
        data: null,
      };
    }
  });

export const signInAction = actionClient
  .inputSchema(signInSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    try {
      const supabase = await createClient();

      const { error } = await signInUser(supabase, email, password);

      if (error) {
        console.error('Erorr in signInAction: ', error);
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }

      return {
        success: true,
        message: 'User signed in successfully',
        data: null,
      };
    } catch (error) {
      console.error('Erorr in signInAction: ', error);
      return {
        success: false,
        message: 'Something went wrong',
        data: null,
      };
    }
  });
