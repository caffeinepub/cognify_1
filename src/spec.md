# Specification

## Summary
**Goal:** Add study material upload functionality for admins and a download area for students, and display a contact phone number in the footer.

**Planned changes:**
- Create backend data type and CRUD functions for study materials (upload, retrieve, update, delete)
- Build admin page at /admin/materials for uploading and managing study materials with filtering by course and class level
- Create student page at /materials displaying available study materials filtered by enrolled courses with download capability
- Add React Query hooks for all study material operations
- Update navigation menus with new study materials links
- Add phone number 7780951766 to the footer

**User-visible outcome:** Admins can upload educational documents (PDF, DOC, DOCX, PPT, PPTX) associated with courses and class levels. Students can view and download study materials relevant to their enrolled courses. The contact phone number is visible in the footer.
