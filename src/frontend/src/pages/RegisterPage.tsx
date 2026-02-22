import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRegisterStudent } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerStudent = useRegisterStudent();

  const [formData, setFormData] = useState({
    name: '',
    classLevel: '',
    email: '',
    phone: '',
    parentName: '',
    parentPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.classLevel) newErrors.classLevel = 'Class level is required';
    if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (!validatePhone(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
    if (!validatePhone(formData.parentPhone)) newErrors.parentPhone = 'Parent phone must be 10 digits';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await registerStudent.mutateAsync({
          name: formData.name.trim(),
          classLevel: BigInt(formData.classLevel),
          contact: {
            email: formData.email,
            phone: formData.phone
          },
          parentContact: {
            name: formData.parentName.trim(),
            phone: formData.parentPhone
          }
        });
        navigate({ to: '/' });
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-warm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-display">Student Registration</CardTitle>
            <CardDescription>Join Cognify and start your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Student Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter student's full name"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classLevel">Class Level *</Label>
                  <Select value={formData.classLevel} onValueChange={(value) => setFormData({ ...formData, classLevel: value })}>
                    <SelectTrigger id="classLevel">
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
                  {errors.classLevel && <p className="text-sm text-destructive">{errors.classLevel}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@example.com"
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit number"
                      maxLength={10}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Parent/Guardian Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                  <Input
                    id="parentName"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Enter parent's full name"
                  />
                  {errors.parentName && <p className="text-sm text-destructive">{errors.parentName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Parent/Guardian Phone *</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="10-digit number"
                    maxLength={10}
                  />
                  {errors.parentPhone && <p className="text-sm text-destructive">{errors.parentPhone}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={registerStudent.isPending}>
                {registerStudent.isPending ? 'Registering...' : 'Register'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
