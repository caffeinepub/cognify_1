import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type ClassLevel = Nat; // 6-10

  type ContactInfo = {
    phone : Text;
    email : Text;
  };

  type ParentContact = {
    name : Text;
    phone : Text;
  };

  type Course = {
    id : Text;
    name : Text;
    description : Text;
    classLevel : ClassLevel;
  };

  module Course {
    public func compare(course1 : Course, course2 : Course) : Order.Order {
      Text.compare(course1.name, course2.name);
    };
  };

  // Student Profile
  type StudentProfile = {
    name : Text;
    classLevel : ClassLevel;
    contact : ContactInfo;
    parentContact : ParentContact;
    enrolledCourses : [Text]; // List of course IDs
  };

  module StudentProfile {
    public func compareByName(profile1 : StudentProfile, profile2 : StudentProfile) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };

    public func compareByClass(profile1 : StudentProfile, profile2 : StudentProfile) : Order.Order {
      if (profile1.classLevel < profile2.classLevel) {
        #less;
      } else if (profile1.classLevel > profile2.classLevel) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  type AttendanceRecord = {
    date : Time.Time;
    courseId : Text;
    present : Bool;
  };

  type TestScore = {
    date : Time.Time;
    courseId : Text;
    score : Nat;
    maxScore : Nat;
  };

  // User Profile type for frontend compatibility
  public type UserProfile = {
    name : Text;
    role : Text; // "student" or "admin"
  };

  // System State
  let courses = Map.empty<Text, Course>();
  let studentProfiles = Map.empty<Principal, StudentProfile>();
  let attendanceRecords = Map.empty<Principal, [AttendanceRecord]>();
  let testScores = Map.empty<Principal, [TestScore]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Study Material
  type StudyMaterial = {
    id : Text;
    title : Text;
    description : Text;
    fileName : Text;
    file : Storage.ExternalBlob;
    courseId : Text;
    classLevel : ClassLevel;
    uploadTime : Time.Time;
    uploadedBy : Principal;
  };

  let studyMaterials = Map.empty<Text, StudyMaterial>();

  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Add Admin Functionality
  public shared ({ caller }) func addAdmin(newAdmin : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only current admins can add new admins");
    };
    AccessControl.assignRole(accessControlState, caller, newAdmin, #admin);
  };

  // Required user profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Student Registration - Open to all (guests can register)
  public shared ({ caller }) func registerStudent(
    name : Text,
    classLevel : ClassLevel,
    contact : ContactInfo,
    parentContact : ParentContact,
    enrolledCourses : ?[Text]
  ) : async () {
    if (classLevel < 6 or classLevel > 10) {
      Runtime.trap("Invalid class level. Must be between 6 and 10");
    };

    let courses = switch (enrolledCourses) {
      case (null) { [] };
      case (?courses) { courses };
    };

    let profile : StudentProfile = {
      name;
      classLevel;
      contact;
      parentContact;
      enrolledCourses = courses;
    };
    studentProfiles.add(caller, profile);
  };

  // Student Profile Management - Students can only access their own profile
  public query ({ caller }) func getCallerStudentProfile() : async ?StudentProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view student profiles");
    };
    studentProfiles.get(caller);
  };

  public query ({ caller }) func getStudentProfile(studentId : Principal) : async ?StudentProfile {
    if (caller != studentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin access required");
    };
    studentProfiles.get(studentId);
  };

  public shared ({ caller }) func updateCallerStudentProfile(
    name : Text,
    classLevel : ClassLevel,
    contact : ContactInfo,
    parentContact : ParentContact,
    enrolledCourses : ?[Text]
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    switch (studentProfiles.get(caller)) {
      case (null) { Runtime.trap("Student profile not found") };
      case (?_) {
        let courses = switch (enrolledCourses) {
          case (null) { [] };
          case (?courses) { courses };
        };

        let updatedProfile : StudentProfile = {
          name;
          classLevel;
          contact;
          parentContact;
          enrolledCourses = courses;
        };
        studentProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Admin function to update any student profile
  public shared ({ caller }) func updateStudentProfile(
    studentId : Principal,
    name : Text,
    classLevel : ClassLevel,
    contact : ContactInfo,
    parentContact : ParentContact,
    enrolledCourses : ?[Text]
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update student profiles");
    };

    switch (studentProfiles.get(studentId)) {
      case (null) { Runtime.trap("Student profile not found") };
      case (?_) {
        let courses = switch (enrolledCourses) {
          case (null) { [] };
          case (?courses) { courses };
        };

        let updatedProfile : StudentProfile = {
          name;
          classLevel;
          contact;
          parentContact;
          enrolledCourses = courses;
        };
        studentProfiles.add(studentId, updatedProfile);
      };
    };
  };

  // Course Management (Admin only)
  public shared ({ caller }) func addCourse(
    id : Text,
    name : Text,
    description : Text,
    classLevel : ClassLevel
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add courses");
    };

    let course : Course = {
      id;
      name;
      description;
      classLevel;
    };
    courses.add(id, course);
  };

  public shared ({ caller }) func editCourse(
    id : Text,
    name : Text,
    description : Text,
    classLevel : ClassLevel
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can edit courses");
    };

    switch (courses.get(id)) {
      case (null) { Runtime.trap("Course not found") };
      case (?_) {
        let updatedCourse : Course = {
          id;
          name;
          description;
          classLevel;
        };
        courses.add(id, updatedCourse);
      };
    };
  };

  // Course Enrollment - Users only
  public shared ({ caller }) func enrollInCourse(courseId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can enroll in courses");
    };

    switch (studentProfiles.get(caller)) {
      case (null) { Runtime.trap("Student profile not found") };
      case (?profile) {
        if (profile.enrolledCourses.find(func(id) { id == courseId }) != null) {
          Runtime.trap("Already enrolled in this course");
        } else {
          let updatedProfile : StudentProfile = {
            name = profile.name;
            classLevel = profile.classLevel;
            contact = profile.contact;
            parentContact = profile.parentContact;
            enrolledCourses = profile.enrolledCourses.concat([courseId]);
          };
          studentProfiles.add(caller, updatedProfile);
        };
      };
    };
  };

  // Attendance Tracking (Admin only)
  public shared ({ caller }) func markAttendance(studentId : Principal, courseId : Text, present : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can mark attendance");
    };

    let record : AttendanceRecord = {
      date = Time.now();
      courseId;
      present;
    };

    let records = switch (attendanceRecords.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };

    let updatedRecords = records.concat([record]);
    attendanceRecords.add(studentId, updatedRecords);
  };

  // Test Results Recording (Admin only)
  public shared ({ caller }) func recordTestScore(
    studentId : Principal,
    courseId : Text,
    score : Nat,
    maxScore : Nat,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can record test scores");
    };

    let testScore : TestScore = {
      date = Time.now();
      courseId;
      score;
      maxScore;
    };

    let scores = switch (testScores.get(studentId)) {
      case (null) { [] };
      case (?scores) { scores };
    };

    let updatedScores = scores.concat([testScore]);
    testScores.add(studentId, updatedScores);
  };

  // Queries - Course listing accessible to all
  public query ({ caller }) func getCoursesForClass(classLevel : ClassLevel) : async [Course] {
    courses.values().toArray().filter(func(course) { course.classLevel == classLevel });
  };

  public query ({ caller }) func getAllCourses() : async [Course] {
    courses.values().toArray();
  };

  // Attendance queries - Students can only view their own, admins can view all
  public query ({ caller }) func getStudentAttendance(studentId : Principal) : async [AttendanceRecord] {
    if (caller != studentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own attendance or admin access required");
    };
    switch (attendanceRecords.get(studentId)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  public query ({ caller }) func getCallerAttendance() : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view attendance");
    };
    switch (attendanceRecords.get(caller)) {
      case (null) { [] };
      case (?records) { records };
    };
  };

  // Test score queries - Students can only view their own, admins can view all
  public query ({ caller }) func getStudentTestScores(studentId : Principal) : async [TestScore] {
    if (caller != studentId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own test scores or admin access required");
    };
    switch (testScores.get(studentId)) {
      case (null) { [] };
      case (?scores) { scores };
    };
  };

  public query ({ caller }) func getCallerTestScores() : async [TestScore] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view test scores");
    };
    switch (testScores.get(caller)) {
      case (null) { [] };
      case (?scores) { scores };
    };
  };

  // Admin-only search and listing functions
  public query ({ caller }) func searchStudentsByName(searchTerm : Text) : async [StudentProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can search students");
    };
    let filtered = studentProfiles.values().toArray().filter(func(profile) { profile.name.contains(#text searchTerm) });
    filtered.sort(StudentProfile.compareByName);
  };

  public query ({ caller }) func getStudentsByClass(classLevel : ClassLevel) : async [StudentProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list students by class");
    };
    let filtered = studentProfiles.values().toArray().filter(func(profile) { profile.classLevel == classLevel });
    filtered.sort(StudentProfile.compareByClass);
  };

  public query ({ caller }) func getAllStudents() : async [StudentProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all students");
    };
    let allStudents = studentProfiles.values().toArray();
    allStudents.sort(StudentProfile.compareByName);
  };

  // Dashboard statistics (Admin only)
  public query ({ caller }) func getDashboardStats() : async {
    totalStudents : Nat;
    totalCourses : Nat;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view dashboard statistics");
    };
    {
      totalStudents = studentProfiles.size();
      totalCourses = courses.size();
    };
  };

  // Study Material Management (Admin only)
  // Upload new material
  public shared ({ caller }) func uploadStudyMaterial(
    id : Text,
    title : Text,
    description : Text,
    fileName : Text,
    file : Storage.ExternalBlob,
    courseId : Text,
    classLevel : ClassLevel,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can upload study materials");
    };

    let material : StudyMaterial = {
      id;
      title;
      description;
      fileName;
      file;
      courseId;
      classLevel;
      uploadTime = Time.now();
      uploadedBy = caller;
    };
    studyMaterials.add(id, material);
  };

  // Update material metadata
  public shared ({ caller }) func updateStudyMaterial(
    id : Text,
    title : Text,
    description : Text,
    fileName : Text,
    courseId : Text,
    classLevel : ClassLevel,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update study materials");
    };

    switch (studyMaterials.get(id)) {
      case (null) { Runtime.trap("Study material not found") };
      case (?existingMaterial) {
        let updatedMaterial : StudyMaterial = {
          id;
          title;
          description;
          fileName;
          file = existingMaterial.file;
          courseId;
          classLevel;
          uploadTime = Time.now();
          uploadedBy = existingMaterial.uploadedBy;
        };
        studyMaterials.add(id, updatedMaterial);
      };
    };
  };

  // Delete material
  public shared ({ caller }) func deleteStudyMaterial(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete study materials");
    };

    switch (studyMaterials.get(id)) {
      case (null) { Runtime.trap("Study material not found") };
      case (?_) {
        studyMaterials.remove(id);
      };
    };
  };

  // Retrieve all materials with filtering (Students can view)
  public query ({ caller }) func getAllStudyMaterials(
    courseId : ?Text,
    classLevel : ?ClassLevel,
  ) : async [StudyMaterial] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view study materials");
    };

    var materials = studyMaterials.values().toArray();

    switch (courseId) {
      case (null) {};
      case (?id) {
        materials := materials.filter(func(material) { material.courseId == id });
      };
    };

    switch (classLevel) {
      case (null) {};
      case (?level) {
        materials := materials.filter(func(material) { material.classLevel == level });
      };
    };

    materials;
  };

  // Download material (Students can download)
  public shared ({ caller }) func downloadStudyMaterial(id : Text) : async StudyMaterial {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can download study materials");
    };

    switch (studyMaterials.get(id)) {
      case (null) { Runtime.trap("Study material not found") };
      case (?material) { material };
    };
  };
};
