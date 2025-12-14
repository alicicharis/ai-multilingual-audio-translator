'use server';

import { createMediaFile } from '@/db';
import { authActionClient } from '@/lib/safe-action';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { z } from 'zod';

const maxFileSize = 1048576 * 10 * 100;

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const createSignedURL = authActionClient
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
          userId: ctx.user.id,
          sourceUrl: process.env.AWS_CLOUDFRONT_URL! + fileName,
          fileName: fileName,
          originalFilename: originalFilename,
          durationSeconds: durationSeconds,
          mediaType: 'audio',
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
