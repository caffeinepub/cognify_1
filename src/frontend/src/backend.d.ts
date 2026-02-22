import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudentProfile {
    contact: ContactInfo;
    parentContact: ParentContact;
    name: string;
    classLevel: ClassLevel;
    enrolledCourses: Array<string>;
}
export type Time = bigint;
export interface TestScore {
    maxScore: bigint;
    date: Time;
    score: bigint;
    courseId: string;
}
export interface ParentContact {
    name: string;
    phone: string;
}
export type ClassLevel = bigint;
export interface AttendanceRecord {
    present: boolean;
    date: Time;
    courseId: string;
}
export interface ContactInfo {
    email: string;
    phone: string;
}
export interface UserProfile {
    name: string;
    role: string;
}
export interface Course {
    id: string;
    name: string;
    description: string;
    classLevel: ClassLevel;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCourse(id: string, name: string, description: string, classLevel: ClassLevel): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    editCourse(id: string, name: string, description: string, classLevel: ClassLevel): Promise<void>;
    enrollInCourse(courseId: string): Promise<void>;
    getAllCourses(): Promise<Array<Course>>;
    getAllStudents(): Promise<Array<StudentProfile>>;
    getCallerAttendance(): Promise<Array<AttendanceRecord>>;
    getCallerStudentProfile(): Promise<StudentProfile | null>;
    getCallerTestScores(): Promise<Array<TestScore>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoursesForClass(classLevel: ClassLevel): Promise<Array<Course>>;
    getDashboardStats(): Promise<{
        totalStudents: bigint;
        totalCourses: bigint;
    }>;
    getStudentAttendance(studentId: Principal): Promise<Array<AttendanceRecord>>;
    getStudentProfile(studentId: Principal): Promise<StudentProfile | null>;
    getStudentTestScores(studentId: Principal): Promise<Array<TestScore>>;
    getStudentsByClass(classLevel: ClassLevel): Promise<Array<StudentProfile>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAttendance(studentId: Principal, courseId: string, present: boolean): Promise<void>;
    recordTestScore(studentId: Principal, courseId: string, score: bigint, maxScore: bigint): Promise<void>;
    registerStudent(name: string, classLevel: ClassLevel, contact: ContactInfo, parentContact: ParentContact, enrolledCourses: Array<string> | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchStudentsByName(searchTerm: string): Promise<Array<StudentProfile>>;
    updateCallerStudentProfile(name: string, classLevel: ClassLevel, contact: ContactInfo, parentContact: ParentContact, enrolledCourses: Array<string> | null): Promise<void>;
    updateStudentProfile(studentId: Principal, name: string, classLevel: ClassLevel, contact: ContactInfo, parentContact: ParentContact, enrolledCourses: Array<string> | null): Promise<void>;
}
