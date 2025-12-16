'use client';

import { deleteMediaFileAction } from '@/actions/media-files';
import { createTranslationJobAction } from '@/actions/translation-jobs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TranslationJobWithMedia } from '@/db/translation-jobs';
import {
  Download,
  FileAudio,
  Languages,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Tables } from '../../../database.types';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'queued':
      return 'bg-amber-500';
    case 'processing':
      return 'bg-blue-500';
    case 'failed':
      return 'bg-red-500';
    case 'completed':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-500';
  }
};

const TranslationJobs = ({
  translationJobs,
}: {
  translationJobs: TranslationJobWithMedia[];
}) => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Translation jobs</CardTitle>
        <CardDescription>Manage your translation jobs</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {translationJobs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              No translation jobs found
            </p>
          </div>
        ) : (
          <TranslationJobsTable translationJobs={translationJobs} />
        )}
      </CardContent>
    </Card>
  );
};

const TranslationJobsTable = ({
  translationJobs,
}: {
  translationJobs: TranslationJobWithMedia[];
}) => {
  return (
    <Table>
      <TableCaption>A list of your recent translation jobs.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Original filename</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Target language</TableHead>
          <TableHead>TTS provider</TableHead>
          <TableHead>GPT model</TableHead>
          <TableHead className="text-right">Created at</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {translationJobs.map((translationJob) => (
          <TableRow key={translationJob.id}>
            <TableCell className="font-medium">
              {translationJob.media_files?.original_filename}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                    translationJob.status ?? ''
                  )}`}
                />
                <span className="capitalize">{translationJob.status}</span>
              </div>
            </TableCell>
            <TableCell className="capitalize">
              {translationJob.target_language}
            </TableCell>
            <TableCell className="capitalize">
              {translationJob.tts_provider}
            </TableCell>
            <TableCell className="capitalize">
              {translationJob.gpt_model}
            </TableCell>
            <TableCell className="text-right" suppressHydrationWarning>
              {new Date(translationJob.created_at ?? '').toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const MediaFile = ({ mediaFile }: { mediaFile: Tables<'media_files'> }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);

  return (
    <div className="group relative flex flex-col gap-2 border bg-primary-foreground rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center">
            <FileAudio className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">
              {mediaFile.original_filename}
            </h3>
            <p className="text-xs mt-0.5" suppressHydrationWarning>
              {new Date(mediaFile.created_at ?? '').toLocaleDateString()}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                setTranslateDialogOpen(true);
              }}
            >
              <Languages className="mr-2 h-4 w-4" />
              Translate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => {
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 rounded-md bg-primary text-accent-foreground font-bold">
          {mediaFile.media_type || 'Audio'}
        </span>
      </div>

      <DeleteMediaFileDialog
        mediaFile={mediaFile}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
      <TranslateMediaFileDialog
        mediaFile={mediaFile}
        open={translateDialogOpen}
        onOpenChange={setTranslateDialogOpen}
      />
    </div>
  );
};

const DeleteMediaFileDialog = ({
  mediaFile,
  open,
  onOpenChange,
}: {
  mediaFile: Tables<'media_files'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMediaFileAction({ id: mediaFile.id });

      if (result?.data?.success) {
        toast.success(result.data.message || 'Media file deleted successfully');
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result?.data?.message || 'Failed to delete media file');
      }
    } catch (error) {
      console.error('Error deleting media file:', error);
      toast.error('An error occurred while deleting the media file');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Media File</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{mediaFile.original_filename}"?
            This action cannot be undone and will permanently delete the media
            file from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const languages = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
];

const TranslateMediaFileDialog = ({
  mediaFile,
  open,
  onOpenChange,
}: {
  mediaFile: Tables<'media_files'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [isTranslating, setIsTranslating] = useState(false);
  const router = useRouter();

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const result = await createTranslationJobAction({
        mediaFileId: mediaFile.id,
        targetLanguage: selectedLanguage,
      });
      if (result?.data?.success) {
        toast.success(
          result.data.message || 'Translation job created successfully'
        );
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(
          result?.data?.message || 'Failed to create translation job'
        );
      }
    } catch (error) {
      console.error('Error in handleTranslate: ', error);
      toast.error('Something went wrong');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Translate Media File</DialogTitle>
          <DialogDescription>
            Translate the media file to your preferred language.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label>Language</Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isTranslating}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleTranslate}
            disabled={isTranslating}
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TranslationJobs;
