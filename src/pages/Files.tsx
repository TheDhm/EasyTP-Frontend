import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFiles, useUploadFile, useDownloadFile, useDeleteFile } from '@/hooks/use-api';
import {
  Upload,
  Download,
  Folder,
  File,
  FileText,
  Image,
  Archive,
  Loader2,
  AlertCircle,
  HardDrive,
  Search,
  ArrowLeft,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { FileItem } from '@/types/api';

export default function Files() {
  const [currentPath, setCurrentPath] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: files, isLoading, error } = useFiles(currentPath);
  const uploadMutation = useUploadFile();
  const downloadMutation = useDownloadFile();
  const deleteMutation = useDeleteFile();
  const queryClient = useQueryClient();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.files.list(currentPath)
    });
    setIsRefreshing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      uploadMutation.mutate(
        { path: currentPath, file },
        {
          onSuccess: () => {
            setSelectedFile(null);
            // Reset input
            event.target.value = '';
          },
        }
      );
    }
  };

  const handleDownload = (filePath: string, filename: string) => {
    downloadMutation.mutate({ path: filePath, filename });
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    setSearchTerm('');
  };

  const goBack = () => {
    if (files?.current_path !== '/') {
      setCurrentPath(files?.parent_path_encoded || '');
    }
  };

  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) return <Folder className="h-5 w-5 text-blue-500" />;

    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'txt':
      case 'md':
      case 'json':
        return <FileText className="h-5 w-5 text-gray-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <Image className="h-5 w-5 text-green-500" />;
      case 'zip':
      case 'tar':
      case 'gz':
      case 'rar':
        return <Archive className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Transform FilesResponse to unified array
  const allFiles: (FileItem & { is_directory: boolean; modified_at?: string })[] = files ? [
    ...files.files.map(file => ({ ...file, is_directory: false, modified_at: undefined })),
    ...files.directories.map(dir => ({ ...dir, is_directory: true, modified_at: undefined }))
  ] : [];

  const filteredFiles = allFiles.filter((file: FileItem & { is_directory: boolean }) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">
            Failed to load files
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              File Explorer
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Upload, download, and manage your files
            </p>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadMutation.isPending}
              />
              <Button disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload File
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadMutation.isPending && selectedFile && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Uploading {selectedFile.name}...
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Error Messages */}
        {(uploadMutation.error || downloadMutation.error || deleteMutation.error) && (
          <Card className="p-4 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800 dark:text-red-200">
                {uploadMutation.error?.message || downloadMutation.error?.message || deleteMutation.error?.message}
              </p>
            </div>
          </Card>
        )}

        {/* Breadcrumb Navigation */}
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            {files?.current_path !== '/' && (
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <HardDrive className="h-4 w-4" />
              <span>
                {files?.current_path === '/' ? 'Root' : files?.current_path}
              </span>
            </div>
          </div>
        </Card>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Files List */}
        <Card>
          {!filteredFiles || filteredFiles.length === 0 ? (
            <div className="p-12 text-center">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No files found' : 'No files in this directory'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Upload files to get started'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFiles.map((file: FileItem & { is_directory: boolean; modified_at?: string }) => (
                <div
                  key={file.name}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {getFileIcon(file.name, file.is_directory)}
                      <div className="flex-1 min-w-0">
                        <button
                          className="text-left w-full"
                          onClick={() => {
                            if (file.is_directory) {
                              navigateToPath(file.path);
                            }
                          }}
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {!file.is_directory && file.size && (
                              <span>{formatFileSize(file.size)}</span>
                            )}
                            {file.modified_at && (
                              <span>{formatDate(file.modified_at)}</span>
                            )}
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {file.is_directory ? 'Directory' : 'File'}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {!file.is_directory && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleDownload(file.path, file.name);
                          }}
                          disabled={downloadMutation.isPending}
                        >
                          {downloadMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>

                        {files?.permissions?.can_delete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{file.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    deleteMutation.mutate({ path: file.path, currentPath });
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Storage Stats */}
        {files && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {filteredFiles.filter((f: FileItem & { is_directory: boolean }) => !f.is_directory).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Files</p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {filteredFiles.filter((f: FileItem & { is_directory: boolean }) => f.is_directory).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Folders</p>
              </div>
            </Card>
            {files?.storage_usage ? (
              <Card className="p-4">
                <div className="text-center space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {files.storage_usage.current_mb.toFixed(1)} MB / {files.storage_usage.limit_mb} MB
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Storage Usage</p>
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {files.storage_usage.percentage.toFixed(1)}% used
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          files.storage_usage.percentage >= 90
                            ? 'bg-red-500'
                            : files.storage_usage.percentage >= 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, files.storage_usage.percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    ∞
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">No Storage Limit</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}