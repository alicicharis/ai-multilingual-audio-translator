'use server';

import { createMediaFile, deleteMediaFile } from '@/db';
import { authActionClient } from '@/lib/safe-action';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { z } from 'zod';

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

const allowedFileTypes = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/ogg',
  'audio/flac',
  'audio/m4a',
  'audio/mp3',
];

const maxFileSize = 1048576 * 10 * 100;

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const createSignedURLAction = authActionClient
  .inputSchema(
    z.object({
      originalFilename: z.string().min(1, 'Original filename is required'),
      durationSeconds: z.number().min(1, 'Duration is required'),
      fileType: z.string().min(1, 'File type is required'),
      fileSize: z.number().min(1, 'File size is required'),
      checksum: z.string().min(1, 'Checksum is required'),
    })
  )
  .action(
    async ({
      parsedInput: {
        originalFilename,
        durationSeconds,
        fileType,
        fileSize,
        checksum,
      },
      ctx,
    }) => {
      try {
        if (fileSize > maxFileSize) {
          return {
            success: false,
            message: 'File size is too large',
            data: null,
          };
        }

        if (!allowedFileTypes.includes(fileType)) {
          return {
            success: false,
            message: 'File type is not allowed',
            data: null,
          };
        }

        const fileName = generateFileName();

        const putObjectCommand = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: fileName,
          ContentType: fileType,
          ContentLength: fileSize,
          ChecksumSHA256: checksum,
          Metadata: {
            userId: ctx.user.id,
          },
        });

        const url = await getSignedUrl(s3Client, putObjectCommand, {
          expiresIn: 60,
        });

        await createMediaFile(ctx.supabase, {
          user_id: ctx.user.id,
          source_url: process.env.AWS_CLOUDFRONT_URL! + fileName,
          file_name: fileName,
          original_filename: originalFilename,
          duration_seconds: durationSeconds,
          media_type: 'audio',
        });

        return {
          success: true,
          message: 'Signed URL generated successfully',
          data: url,
        };
      } catch (error) {
        console.error('Error in uploadMediaFiles: ', error);
        return {
          success: false,
          message: 'Something went wrong',
          data: null,
        };
      }
    }
  );

export const deleteMediaFileAction = authActionClient
  .inputSchema(
    z.object({
      id: z.string().min(1, 'ID is required'),
    })
  )
  .action(async ({ parsedInput: { id }, ctx }) => {
    try {
      await deleteMediaFile(ctx.supabase, id, ctx.user.id);
      return {
        success: true,
        message: 'Media file deleted successfully',
        data: null,
      };
    } catch (error) {
      console.error('Error in deleteMediaFileAction: ', error);
      return {
        success: false,
        message: 'Something went wrong',
        data: null,
      };
    }
  });
