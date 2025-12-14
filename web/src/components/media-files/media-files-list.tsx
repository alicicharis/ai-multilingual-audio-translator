import { Download, Edit, FileAudio, MoreVertical, Trash2 } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const MediaFilesList = ({
  mediaFiles,
}: {
  mediaFiles: Tables<'media_files'>[];
}) => {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>All your media files</CardTitle>
        <CardDescription>Manage your media files</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaFiles.map((mediaFile) => (
          <MediaFile key={mediaFile.id} mediaFile={mediaFile} />
        ))}
      </CardContent>
    </Card>
  );
};

const MediaFile = ({ mediaFile }: { mediaFile: Tables<'media_files'> }) => {
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
            <p className="text-xs mt-0.5">
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
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
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
    </div>
  );
};

export default MediaFilesList;
