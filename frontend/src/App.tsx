import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import FileGDPage from './pages/FileGDPage';
import ReportCrimePage from './pages/ReportCrimePage';
import PoliceLayout from './components/police/PoliceLayout';
import PoliceDashboard from './pages/PoliceDashboard';
import PoliceIncidents from './pages/PoliceIncidents';
import PoliceResources from './pages/PoliceResources';
import PoliceReports from './pages/PoliceReports';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Citizen Routes */}
        <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} />}>
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/file-gd" element={<FileGDPage />} />
          <Route path="/report-crime" element={<ReportCrimePage />} />
        </Route>

        {/* Police Routes */}
        <Route element={<ProtectedRoute allowedRoles={['POLICE_OFFICER']} />}>
          <Route path="/police" element={<PoliceLayout />}>
            <Route index element={<PoliceDashboard />} />
            <Route path="incidents" element={<PoliceIncidents />} />
            <Route path="resources" element={<PoliceResources />} />
            <Route path="reports" element={<PoliceReports />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
