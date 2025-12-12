import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Upload, FolderPlus, File, FileText, Image, Download, Trash2, 
  Folder, Search, Grid, List, MoreVertical 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileRecord {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  folder: string;
  description: string | null;
  is_shared: boolean;
  created_at: string;
  uploaded_by: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
  if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
  return <File className="h-8 w-8 text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileVault: React.FC = () => {
  const { user, profile } = useAuth();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [folders, setFolders] = useState<string[]>(['root']);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [fileDescription, setFileDescription] = useState('');

  const fetchFiles = async () => {
    if (!profile?.family_id) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFiles(data || []);
      
      // Extract unique folders
      const uniqueFolders = new Set(['root', ...data?.map(f => f.folder) || []]);
      setFolders(Array.from(uniqueFolders));
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [profile?.family_id]);

  const handleUpload = async () => {
    if (!uploadFile || !profile?.family_id || !user) {
      toast.error('Please select a file');
      return;
    }

    try {
      const fileExt = uploadFile.name.split('.').pop();
      const filePath = `${profile.family_id}/${currentFolder}/${Date.now()}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile);
      
      if (uploadError) throw uploadError;

      // Create file record
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          family_id: profile.family_id,
          uploaded_by: user.id,
          file_name: uploadFile.name,
          file_path: filePath,
          file_size: uploadFile.size,
          file_type: uploadFile.type,
          folder: currentFolder,
          description: fileDescription || null,
        });

      if (dbError) throw dbError;
      
      toast.success('File uploaded successfully');
      setIsUploadOpen(false);
      setUploadFile(null);
      setFileDescription('');
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleDownload = async (file: FileRecord) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(file.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (file: FileRecord) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([file.file_path]);
      
      if (storageError) throw storageError;

      // Delete record
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;
      
      toast.success('File deleted');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const folderName = newFolderName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!folders.includes(folderName)) {
      setFolders([...folders, folderName]);
    }
    setNewFolderName('');
    setIsNewFolderOpen(false);
    toast.success('Folder created');
  };

  const filteredFiles = files.filter(file => 
    file.folder === currentFolder &&
    (searchQuery === '' || file.file_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>File Vault | SplitSchedule</title>
        <meta name="description" content="Secure document storage for important custody documents" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">File Vault</h1>
              <p className="text-muted-foreground">Secure storage for important documents</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="folderName">Folder Name</Label>
                      <Input
                        id="folderName"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name"
                      />
                    </div>
                    <Button onClick={handleCreateFolder} className="w-full">
                      Create Folder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Select File</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="folder">Folder</Label>
                      <Select value={currentFolder} onValueChange={setCurrentFolder}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {folders.map(folder => (
                            <SelectItem key={folder} value={folder}>
                              {folder === 'root' ? 'Root' : folder}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        value={fileDescription}
                        onChange={(e) => setFileDescription(e.target.value)}
                        placeholder="Add a description..."
                      />
                    </div>
                    <Button onClick={handleUpload} className="w-full" disabled={!uploadFile}>
                      Upload
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={currentFolder} onValueChange={setCurrentFolder}>
                <SelectTrigger className="w-[180px]">
                  <Folder className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folders.map(folder => (
                    <SelectItem key={folder} value={folder}>
                      {folder === 'root' ? 'Root' : folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* File Grid/List */}
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading files...
              </CardContent>
            </Card>
          ) : !profile?.family_id ? (
            <Card className="border-warning bg-warning/10">
              <CardContent className="py-4">
                <p className="text-warning-foreground">
                  You need to create or join a family to use the file vault. Go to Settings to set up your family.
                </p>
              </CardContent>
            </Card>
          ) : filteredFiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Folder className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No files found matching your search' : 'No files in this folder'}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsUploadOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload your first file
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3">
                        {getFileIcon(file.file_type)}
                      </div>
                      <p className="font-medium text-sm truncate w-full" title={file.file_name}>
                        {file.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatFileSize(file.file_size)}
                      </p>
                      <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(file)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(file)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        {getFileIcon(file.file_type)}
                        <div>
                          <p className="font-medium">{file.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.file_size)} • {format(parseISO(file.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(file)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default FileVault;
