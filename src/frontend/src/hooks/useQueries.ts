import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { StudentProfile, Course, AttendanceRecord, TestScore, UserProfile, ContactInfo, ParentContact, StudyMaterial } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    }
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Admin Management
export function useAddAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      return actor.addAdmin(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      toast.success('Admin added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add admin: ${error.message}`);
    }
  });
}

// Student Profile Queries
export function useGetCallerStudentProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentProfile | null>({
    queryKey: ['callerStudentProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerStudentProfile();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetStudentProfile(principalId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentProfile | null>({
    queryKey: ['studentProfile', principalId],
    queryFn: async () => {
      if (!actor || !principalId) return null;
      const principal = Principal.fromText(principalId);
      return actor.getStudentProfile(principal);
    },
    enabled: !!actor && !actorFetching && principalId !== null,
  });
}

export function useRegisterStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      classLevel: bigint;
      contact: ContactInfo;
      parentContact: ParentContact;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerStudent(
        data.name,
        data.classLevel,
        data.contact,
        data.parentContact,
        null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerStudentProfile'] });
      toast.success('Registration successful! Please log in.');
    },
    onError: (error: Error) => {
      toast.error(`Registration failed: ${error.message}`);
    }
  });
}

export function useUpdateCallerStudentProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      classLevel: bigint;
      contact: ContactInfo;
      parentContact: ParentContact;
      enrolledCourses: string[] | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCallerStudentProfile(
        data.name,
        data.classLevel,
        data.contact,
        data.parentContact,
        data.enrolledCourses
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerStudentProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  });
}

// Course Queries
export function useGetCoursesForClass(classLevel: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Course[]>({
    queryKey: ['coursesForClass', classLevel?.toString()],
    queryFn: async () => {
      if (!actor || !classLevel) return [];
      return actor.getCoursesForClass(classLevel);
    },
    enabled: !!actor && !actorFetching && classLevel !== null,
  });
}

export function useGetAllCourses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Course[]>({
    queryKey: ['allCourses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useEnrollInCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.enrollInCourse(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerStudentProfile'] });
      toast.success('Successfully enrolled in course');
    },
    onError: (error: Error) => {
      toast.error(`Enrollment failed: ${error.message}`);
    }
  });
}

export function useAddCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name: string; description: string; classLevel: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCourse(data.id, data.name, data.description, data.classLevel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCourses'] });
      queryClient.invalidateQueries({ queryKey: ['coursesForClass'] });
      toast.success('Course added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add course: ${error.message}`);
    }
  });
}

export function useEditCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name: string; description: string; classLevel: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editCourse(data.id, data.name, data.description, data.classLevel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allCourses'] });
      queryClient.invalidateQueries({ queryKey: ['coursesForClass'] });
      toast.success('Course updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update course: ${error.message}`);
    }
  });
}

// Attendance Queries
export function useGetCallerAttendance() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['callerAttendance'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerAttendance();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetStudentAttendance(studentId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AttendanceRecord[]>({
    queryKey: ['studentAttendance', studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      const principal = Principal.fromText(studentId);
      return actor.getStudentAttendance(principal);
    },
    enabled: !!actor && !actorFetching && studentId !== null,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: Principal; courseId: string; present: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAttendance(data.studentId, data.courseId, data.present);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAttendance'] });
      toast.success('Attendance marked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    }
  });
}

// Test Score Queries
export function useGetCallerTestScores() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TestScore[]>({
    queryKey: ['callerTestScores'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerTestScores();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetStudentTestScores(studentId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TestScore[]>({
    queryKey: ['studentTestScores', studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      const principal = Principal.fromText(studentId);
      return actor.getStudentTestScores(principal);
    },
    enabled: !!actor && !actorFetching && studentId !== null,
  });
}

export function useRecordTestScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: Principal; courseId: string; score: bigint; maxScore: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordTestScore(data.studentId, data.courseId, data.score, data.maxScore);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentTestScores'] });
      toast.success('Test score recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to record test score: ${error.message}`);
    }
  });
}

// Admin Student Queries
export function useGetAllStudents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentProfile[]>({
    queryKey: ['allStudents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetStudentsByClass(classLevel: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentProfile[]>({
    queryKey: ['studentsByClass', classLevel?.toString()],
    queryFn: async () => {
      if (!actor || !classLevel) return [];
      return actor.getStudentsByClass(classLevel);
    },
    enabled: !!actor && !actorFetching && classLevel !== null,
  });
}

export function useSearchStudentsByName(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentProfile[]>({
    queryKey: ['searchStudents', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchStudentsByName(searchTerm);
    },
    enabled: !!actor && !actorFetching && searchTerm.length > 0,
  });
}

export function useGetDashboardStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardStats();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Study Material Queries
export function useStudyMaterials(courseId?: string | null, classLevel?: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudyMaterial[]>({
    queryKey: ['studyMaterials', courseId, classLevel?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudyMaterials(courseId || null, classLevel || null);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUploadStudyMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title: string;
      description: string;
      fileName: string;
      file: ExternalBlob;
      courseId: string;
      classLevel: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadStudyMaterial(
        data.id,
        data.title,
        data.description,
        data.fileName,
        data.file,
        data.courseId,
        data.classLevel
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyMaterials'] });
      toast.success('Study material uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload material: ${error.message}`);
    }
  });
}

export function useUpdateStudyMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      title: string;
      description: string;
      fileName: string;
      courseId: string;
      classLevel: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStudyMaterial(
        data.id,
        data.title,
        data.description,
        data.fileName,
        data.courseId,
        data.classLevel
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyMaterials'] });
      toast.success('Study material updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update material: ${error.message}`);
    }
  });
}

export function useDeleteStudyMaterial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteStudyMaterial(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyMaterials'] });
      toast.success('Study material deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete material: ${error.message}`);
    }
  });
}

export function useDownloadStudyMaterial() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      const material = await actor.downloadStudyMaterial(id);
      
      // Get bytes from ExternalBlob and trigger download
      const bytes = await material.file.getBytes();
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = material.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return material;
    },
    onSuccess: () => {
      toast.success('Download started');
    },
    onError: (error: Error) => {
      toast.error(`Failed to download material: ${error.message}`);
    }
  });
}
