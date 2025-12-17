'use server';

import { authActionClient } from '@/lib/safe-action';
import { z } from 'zod';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { createTranslationJob } from '@/db/translation-jobs';
import crypto from 'crypto';

const client = new SQSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const createTranslationJobAction = authActionClient
  .inputSchema(
    z.object({
      mediaFileId: z.string().min(1, 'Media file ID is required'),
      targetLanguage: z.string().min(1, 'Target language is required'),
    })
  )
  .action(async ({ parsedInput: { mediaFileId, targetLanguage }, ctx }) => {
    try {
      const translationJob = await createTranslationJob(ctx.supabase, {
        mediaFileId,
        targetLanguage,
        userId: ctx.user.id,
      });

      if (!translationJob) {
        throw new Error('Failed to create translation job');
      }

      const command = new SendMessageCommand({
        QueueUrl: process.env.AWS_SQS_QUEUE_URL!,
        MessageBody: JSON.stringify({
          mediaFileId,
          targetLanguage,
          userId: ctx.user.id,
          translationJobId: translationJob.id,
        }),
        MessageGroupId: translationJob.id,
        MessageDeduplicationId: crypto.randomBytes(16).toString('hex'),
      });

      await client.send(command);

      return {
        success: true,
        message: 'Translation job created successfully',
        data: null,
      };
    } catch (error) {
      console.error('Error in createTranslationJobAction: ', error);
      return {
        success: false,
        message: 'Something went wrong',
        data: null,
      };
    }
  });
