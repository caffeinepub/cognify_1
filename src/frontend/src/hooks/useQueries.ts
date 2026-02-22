import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { StudentProfile, Course, AttendanceRecord, TestScore, UserProfile, ContactInfo, ParentContact } from '../backend';
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
      return actor.getStudentAttendance(Principal.fromText(studentId));
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: string; courseId: string; present: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markAttendance(Principal.fromText(data.studentId), data.courseId, data.present);
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
      return actor.getStudentTestScores(Principal.fromText(studentId));
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useRecordTestScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { studentId: string; courseId: string; score: bigint; maxScore: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordTestScore(
        Principal.fromText(data.studentId),
        data.courseId,
        data.score,
        data.maxScore
      );
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

// Admin Student Management
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

export function useGetStudentProfile(studentId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StudentProfile | null>({
    queryKey: ['studentProfile', studentId],
    queryFn: async () => {
      if (!actor || !studentId) return null;
      return actor.getStudentProfile(Principal.fromText(studentId));
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useUpdateStudentProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: string;
      name: string;
      classLevel: bigint;
      contact: ContactInfo;
      parentContact: ParentContact;
      enrolledCourses: string[] | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStudentProfile(
        Principal.fromText(data.studentId),
        data.name,
        data.classLevel,
        data.contact,
        data.parentContact,
        data.enrolledCourses
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
      toast.success('Student profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update student profile: ${error.message}`);
    }
  });
}

// Dashboard Stats
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
