import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authApi } from './lib/api/auth';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardRedirect from './pages/dashboard/DashboardRedirect';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import CoursesPage from './pages/dashboard/CoursesPage';
import ForumsPage from './pages/dashboard/ForumsPage';

// Admin Pages
import AdminUsersPage from './pages/dashboard/admin/UsersPage';
import AdminDepartmentsPage from './pages/dashboard/admin/DepartmentsPage';
import AdminCategoriesPage from './pages/dashboard/admin/CategoriesPage';
import AdminTagsPage from './pages/dashboard/admin/TagsPage';
import AdminCoursesPage from './pages/dashboard/admin/CoursesPage';
import AdminCreateCoursePage from './pages/dashboard/admin/CreateCoursePage';
import AdminEditCoursePage from './pages/dashboard/admin/EditCoursePage';
import AdminLearningPathsPage from './pages/dashboard/admin/LearningPathsPage';
import AdminSkillsPage from './pages/dashboard/admin/SkillsPage';
import AdminBadgesAchievementsPage from './pages/dashboard/admin/BadgesAchievementsPage';
import AdminReviewsPage from './pages/dashboard/admin/ReviewsPage';
import AdminStudyGroupsPage from './pages/dashboard/admin/StudyGroupsPage';
import AdminLeaderboardPage from './pages/dashboard/admin/LeaderboardPage';
import AdminNotificationsPage from './pages/dashboard/admin/NotificationsPage';
import AdminAnalyticsPage from './pages/dashboard/admin/AnalyticsPage';
import AdminSettingsPage from './pages/dashboard/admin/SettingsPage';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const data = await authApi.getProfile();
        setUser(data.user);
        
        if (requiredRole && data.user?.role !== requiredRole) {
          window.location.href = '/dashboard';
          return;
        }
      } catch (error) {
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="instructor" element={<InstructorDashboard />} />
        <Route path="student" element={<StudentDashboard />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="forums" element={<ForumsPage />} />
        
        {/* Admin Routes */}
        <Route path="admin/users" element={<AdminUsersPage />} />
        <Route path="admin/departments" element={<AdminDepartmentsPage />} />
        <Route path="admin/categories" element={<AdminCategoriesPage />} />
        <Route path="admin/tags" element={<AdminTagsPage />} />
        <Route path="admin/courses" element={<AdminCoursesPage />} />
        <Route path="admin/courses/create" element={<AdminCreateCoursePage />} />
        <Route path="admin/courses/:id/edit" element={<AdminEditCoursePage />} />
        <Route path="admin/learning-paths" element={<AdminLearningPathsPage />} />
        <Route path="admin/skills" element={<AdminSkillsPage />} />
        <Route path="admin/badges-achievements" element={<AdminBadgesAchievementsPage />} />
        <Route path="admin/reviews" element={<AdminReviewsPage />} />
        <Route path="admin/study-groups" element={<AdminStudyGroupsPage />} />
        <Route path="admin/leaderboard" element={<AdminLeaderboardPage />} />
        <Route path="admin/notifications" element={<AdminNotificationsPage />} />
        <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="admin/settings" element={<AdminSettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

