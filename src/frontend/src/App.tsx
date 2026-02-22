import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import StudentProfilePage from './pages/StudentProfilePage';
import CoursesPage from './pages/CoursesPage';
import AttendancePage from './pages/AttendancePage';
import TestResultsPage from './pages/TestResultsPage';
import MaterialsPage from './pages/MaterialsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminStudentDetailPage from './pages/AdminStudentDetailPage';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import AdminTestScoresPage from './pages/AdminTestScoresPage';
import AdminMaterialsPage from './pages/AdminMaterialsPage';
import AdminSetupPage from './pages/AdminSetupPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import UserProfileSetup from './components/UserProfileSetup';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster />
    </>
  )
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: StudentProfilePage
});

const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/courses',
  component: CoursesPage
});

const attendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/attendance',
  component: AttendancePage
});

const testResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/test-results',
  component: TestResultsPage
});

const materialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/materials',
  component: MaterialsPage
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboardPage
});

const adminStudentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/students',
  component: AdminStudentsPage
});

const adminStudentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/students/$principalId',
  component: AdminStudentDetailPage
});

const adminCoursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/courses',
  component: AdminCoursesPage
});

const adminAttendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/attendance',
  component: AdminAttendancePage
});

const adminTestScoresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/test-scores',
  component: AdminTestScoresPage
});

const adminMaterialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/materials',
  component: AdminMaterialsPage
});

const adminSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-setup',
  component: AdminSetupPage
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settings',
  component: AdminSettingsPage
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  registerRoute,
  profileRoute,
  coursesRoute,
  attendanceRoute,
  testResultsRoute,
  materialsRoute,
  adminDashboardRoute,
  adminStudentsRoute,
  adminStudentDetailRoute,
  adminCoursesRoute,
  adminAttendanceRoute,
  adminTestScoresRoute,
  adminMaterialsRoute,
  adminSetupRoute,
  adminSettingsRoute
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <UserProfileSetup />;
  }

  return <RouterProvider router={router} />;
}

export default App;
