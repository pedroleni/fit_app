import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { WaterPage } from './pages/WaterPage';
import { AICoachPage } from './pages/AICoachPage';
import { RoutinePage } from './pages/RoutinePage';
import { ExerciseSearchPage } from './pages/ExerciseSearchPage';
import { ActiveWorkoutPage } from './pages/ActiveWorkoutPage';
import { WorkoutHistoryDetailPage } from './pages/WorkoutHistoryDetailPage';
import { ExerciseDirectoryPage } from './pages/ExerciseDirectoryPage';
import { ExerciseEvolutionPage } from './pages/ExerciseEvolutionPage';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="workouts" element={<WorkoutsPage />} />
            <Route path="water" element={<WaterPage />} />
            <Route path="ai-coach" element={<AICoachPage />} />

            {/* AI Training features (from Pruebas) */}
            <Route path="routine" element={<RoutinePage />} />
            <Route path="exercises" element={<ExerciseSearchPage />} />
            <Route path="active-workout" element={<ActiveWorkoutPage />} />
            <Route path="workout-history-detail" element={<WorkoutHistoryDetailPage />} />
            <Route path="directory" element={<ExerciseDirectoryPage />} />
            <Route path="exercise-evolution" element={<ExerciseEvolutionPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
