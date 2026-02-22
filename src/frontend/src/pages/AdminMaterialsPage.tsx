import { useState } from 'react';
import { useIsCallerAdmin, useStudyMaterials, useUploadStudyMaterial, useUpdateStudyMaterial, useDeleteStudyMaterial, useGetAllCourses } from '../hooks/useQueries';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { StudyMaterial } from '../backend';
import { ExternalBlob } from '../backend';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function AdminMaterialsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: materials, isLoading: materialsLoading } = useStudyMaterials();
  const { data: courses } = useGetAllCourses();
  const uploadMaterial = useUploadStudyMaterial();
  const updateMaterial = useUpdateStudyMaterial();
  const deleteMaterial = useDeleteStudyMaterial();

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    classLevel: ''
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', courseId: '', classLevel: '' });
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.title || !formData.courseId || !formData.classLevel) {
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

      await uploadMaterial.mutateAsync({
        id,
        title: formData.title,
        description: formData.description,
        fileName: selectedFile.name,
        file: blob,
        courseId: formData.courseId,
        classLevel: BigInt(formData.classLevel)
      });

      setIsUploadDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial || !formData.title || !formData.courseId || !formData.classLevel) {
      return;
    }

    await updateMaterial.mutateAsync({
      id: editingMaterial.id,
      title: formData.title,
      description: formData.description,
      fileName: editingMaterial.fileName,
      courseId: formData.courseId,
      classLevel: BigInt(formData.classLevel)
    });

    setIsEditDialogOpen(false);
    setEditingMaterial(null);
    resetForm();
  };

  const openEditDialog = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description,
      courseId: material.courseId,
      classLevel: material.classLevel.toString()
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (materialId: string) => {
    setDeletingMaterialId(materialId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingMaterialId) {
      await deleteMaterial.mutateAsync(deletingMaterialId);
      setIsDeleteDialogOpen(false);
      setDeletingMaterialId(null);
    }
  };

  if (adminLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const filteredMaterials = materials?.filter((material) => {
    if (filterCourse !== 'all' && material.courseId !== filterCourse) return false;
    if (filterClass !== 'all' && material.classLevel.toString() !== filterClass) return false;
    return true;
  });

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Study Materials Management</h1>
            <p className="text-muted-foreground">Upload and manage study materials for students</p>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Study Material</DialogTitle>
                <DialogDescription>Upload educational documents for students (PDF, DOC, DOCX, PPT, PPTX - Max 10MB)</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="materialTitle">Title *</Label>
                  <Input
                    id="materialTitle"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Chapter 5 Notes"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materialDescription">Description</Label>
                  <Textarea
                    id="materialDescription"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the material..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materialCourse">Course *</Label>
                  <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                    <SelectTrigger id="materialCourse">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} (Class {course.classLevel.toString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materialClass">Class Level *</Label>
                  <Select value={formData.classLevel} onValueChange={(value) => setFormData({ ...formData, classLevel: value })}>
                    <SelectTrigger id="materialClass">
                      <SelectValue placeholder="Select class level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Class {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materialFile">File *</Label>
                  <Input
                    id="materialFile"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileChange}
                    required
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <Label>Upload Progress</Label>
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground text-center">{uploadProgress}%</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={uploadMaterial.isPending || !selectedFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadMaterial.isPending ? 'Uploading...' : 'Upload Material'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  All Study Materials
                </CardTitle>
                <CardDescription>
                  {filteredMaterials?.length || 0} material{filteredMaterials?.length !== 1 ? 's' : ''} available
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={filterCourse} onValueChange={setFilterCourse}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterClass} onValueChange={setFilterClass}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {[6, 7, 8, 9, 10].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Class {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {materialsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading materials...</p>
              </div>
            ) : filteredMaterials && filteredMaterials.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => {
                    const course = courses?.find((c) => c.id === material.courseId);
                    return (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{material.description}</TableCell>
                        <TableCell>{course?.name || material.courseId}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Class {material.classLevel.toString()}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{material.fileName}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(material)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(material.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No study materials available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Study Material</DialogTitle>
              <DialogDescription>Update material information (file cannot be changed)</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Title *</Label>
                <Input
                  id="editTitle"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCourse">Course *</Label>
                <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                  <SelectTrigger id="editCourse">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} (Class {course.classLevel.toString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editClass">Class Level *</Label>
                <Select value={formData.classLevel} onValueChange={(value) => setFormData({ ...formData, classLevel: value })}>
                  <SelectTrigger id="editClass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Class {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={updateMaterial.isPending}>
                {updateMaterial.isPending ? 'Updating...' : 'Update Material'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the study material.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={deleteMaterial.isPending}>
                {deleteMaterial.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
