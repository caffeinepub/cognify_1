import { useState } from 'react';
import { useGetCallerStudentProfile, useUpdateCallerStudentProfile, useGetAllCourses } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Users as UsersIcon, BookOpen, Edit, Save, X } from 'lucide-react';

export default function StudentProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useGetCallerStudentProfile();
  const { data: allCourses } = useGetAllCourses();
  const updateProfile = useUpdateCallerStudentProfile();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    classLevel: '',
    email: '',
    phone: '',
    parentName: '',
    parentPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        classLevel: profile.classLevel.toString(),
        email: profile.contact.email,
        phone: profile.contact.phone,
        parentName: profile.parentContact.name,
        parentPhone: profile.parentContact.phone
      });
      setIsEditing(true);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
    if (!validatePhone(formData.parentPhone)) newErrors.parentPhone = 'Parent phone must be 10 digits';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && profile) {
      try {
        await updateProfile.mutateAsync({
          name: formData.name.trim(),
          classLevel: BigInt(formData.classLevel),
          contact: {
            email: formData.email,
            phone: formData.phone
          },
          parentContact: {
            name: formData.parentName.trim(),
            phone: formData.parentPhone
          },
          enrolledCourses: profile.enrolledCourses
        });
        setIsEditing(false);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  if (!identity) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>No student profile found. Please register first.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const enrolledCourseDetails = allCourses?.filter((course) => profile.enrolledCourses.includes(course.id)) || [];

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your student information</p>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateProfile.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateProfile.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classLevel">Class Level</Label>
                  <Select value={formData.classLevel} onValueChange={(value) => setFormData({ ...formData, classLevel: value })}>
                    <SelectTrigger id="classLevel">
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      maxLength={10}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </div>
              </>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Class</p>
                  <Badge variant="secondary">Class {profile.classLevel.toString()}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-medium">{profile.contact.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </p>
                  <p className="font-medium">{profile.contact.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              Parent/Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent/Guardian Name</Label>
                  <Input
                    id="parentName"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  />
                  {errors.parentName && <p className="text-sm text-destructive">{errors.parentName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    maxLength={10}
                  />
                  {errors.parentPhone && <p className="text-sm text-destructive">{errors.parentPhone}</p>}
                </div>
              </>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile.parentContact.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </p>
                  <p className="font-medium">{profile.parentContact.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Enrolled Courses
            </CardTitle>
            <CardDescription>
              {enrolledCourseDetails.length === 0
                ? 'You are not enrolled in any courses yet'
                : `You are enrolled in ${enrolledCourseDetails.length} course${enrolledCourseDetails.length > 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          {enrolledCourseDetails.length > 0 && (
            <CardContent>
              <div className="space-y-3">
                {enrolledCourseDetails.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{course.name}</h4>
                      <p className="text-sm text-muted-foreground">{course.description}</p>
                    </div>
                    <Badge>Class {course.classLevel.toString()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
