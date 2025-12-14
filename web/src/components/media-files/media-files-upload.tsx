'use client';

import { createSignedURL } from '@/actions/media-files';
import { AlertCircle, FileAudio, FileVideo, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useRouter } from 'next/navigation';

const MediaFilesUpload = () => {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'audio/*': ['.mp3', '.wav', '.m4a', '.flac', '.ogg'],
      },
      maxSize: 100 * 1024 * 1024, // 100MB
    });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('audio/')) {
      return <FileAudio className="h-8 w-8 text-blue-500" />;
    }
    if (file.type.startsWith('video/')) {
      return <FileVideo className="h-8 w-8 text-purple-500" />;
    }
    return <Upload className="h-8 w-8 text-gray-500" />;
  };

  const uploadHandler = async () => {
    await Promise.all(
      files.map(async (file) => {
        try {
          const originalFilename = file.name;
          const duration = await getMediaDuration(file);

          const { data } = await createSignedURL({
            originalFilename,
            durationSeconds: parseInt(duration?.toFixed(2)),
            fileType: file.type,
            fileSize: file.size,
            checksum: await computeSHA256(file),
          });

          if (!data?.success || !data?.data) {
            toast.error(data?.message);
            return;
          }

          await fetch(data.data, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type,
            },
            body: file,
          });
        } catch (error) {
          console.error('Error in uploadHandler: ', error);
          toast.error('Something went wrong');
        }
      })
    );

    router.refresh();
  };

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Upload your media files</CardTitle>
        <CardDescription>
          Drag and drop your audio or video files here, or click to browse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${
              isDragActive && !isDragReject
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : ''
            }
            ${isDragReject ? 'border-red-500 bg-red-50 dark:bg-red-950/10' : ''}
            ${
              !isDragActive && !isDragReject
                ? 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                : ''
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div
              className={`
              p-4 rounded-full bg-muted/50 transition-all duration-200
              ${isDragActive && !isDragReject ? 'bg-primary/10 scale-110' : ''}
              ${isDragReject ? 'bg-red-100 dark:bg-red-950/20' : ''}
            `}
            >
              {isDragReject ? (
                <AlertCircle className="h-10 w-10 text-red-500" />
              ) : (
                <Upload
                  className={`h-10 w-10 transition-colors ${
                    isDragActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
              )}
            </div>
            <div className="space-y-2">
              {isDragReject ? (
                <p className="text-lg font-medium text-red-600 dark:text-red-400">
                  Invalid file type or size
                </p>
              ) : isDragActive ? (
                <p className="text-lg font-medium text-primary">
                  Drop your files here...
                </p>
              ) : (
                <>
                  <p className="text-lg font-medium">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports audio (MP3, WAV, M4A, FLAC, OGG)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 100MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium">Files to upload</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="shrink-0">{getFileIcon(file)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={uploadHandler}>
              Upload files
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaFilesUpload;

async function computeSHA256(file: File) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}

async function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const media = document.createElement(
      file.type.startsWith('audio/') ? 'audio' : 'video'
    );

    media.preload = 'metadata';

    media.onloadedmetadata = () => {
      URL.revokeObjectURL(media.src);
      resolve(media.duration);
    };

    media.onerror = () => {
      URL.revokeObjectURL(media.src);
      reject(new Error('Failed to load media file'));
    };

    media.src = URL.createObjectURL(file);
  });
}
