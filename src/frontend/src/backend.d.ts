import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export type ClassLevel = bigint;
export interface Course {
    id: string;
    name: string;
    description: string;
    classLevel: ClassLevel;
}
export interface StudentProfile {
    contact: ContactInfo;
    parentContact: ParentContact;
    name: string;
    classLevel: ClassLevel;
    enrolledCourses: Array<string>;
}
export interface TestScore {
    maxScore: bigint;
    date: Time;
    score: bigint;
    courseId: string;
}
export interface StudyMaterial {
    id: string;
    title: string;
    file: ExternalBlob;
    description: string;
    fileName: string;
    classLevel: ClassLevel;
    courseId: string;
    uploadTime: Time;
    uploadedBy: Principal;
}
export interface ParentContact {
    name: string;
    phone: string;
}
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdmin(newAdmin: Principal): Promise<void>;
    addCourse(id: string, name: string, description: string, classLevel: ClassLevel): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteStudyMaterial(id: string): Promise<void>;
    downloadStudyMaterial(id: string): Promise<StudyMaterial>;
    editCourse(id: string, name: string, description: string, classLevel: ClassLevel): Promise<void>;
    enrollInCourse(courseId: string): Promise<void>;
    getAllCourses(): Promise<Array<Course>>;
    getAllStudents(): Promise<Array<StudentProfile>>;
    getAllStudyMaterials(courseId: string | null, classLevel: ClassLevel | null): Promise<Array<StudyMaterial>>;
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
    updateStudyMaterial(id: string, title: string, description: string, fileName: string, courseId: string, classLevel: ClassLevel): Promise<void>;
    uploadStudyMaterial(id: string, title: string, description: string, fileName: string, file: ExternalBlob, courseId: string, classLevel: ClassLevel): Promise<void>;
}
