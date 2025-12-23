import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Booking from './pages/Booking';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import LabAnalysis from './pages/LabAnalysis';
import PatientProfile from './pages/PatientProfile';
import { Patient } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'patient' | null>(null);
  const [currentUser, setCurrentUser] = useState<Patient | null>(null);

  // Check storage on load to persist login across refreshes
  useEffect(() => {
    const authState = localStorage.getItem('nova_auth');
    const role = localStorage.getItem('nova_role');
    const user = localStorage.getItem('nova_user');

    if (authState === 'true') {
      setIsAuthenticated(true);
      if (role === 'admin') setUserRole('admin');
      if (role === 'patient') {
        setUserRole('patient');
        if (user) setCurrentUser(JSON.parse(user));
      }
    }
  }, []);

  const handleLogin = (role: 'admin' | 'patient', patientData?: Patient) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('nova_auth', 'true');
    localStorage.setItem('nova_role', role);
    
    if (role === 'patient' && patientData) {
      setCurrentUser(patientData);
      localStorage.setItem('nova_user', JSON.stringify(patientData));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUser(null);
    localStorage.removeItem('nova_auth');
    localStorage.removeItem('nova_role');
    localStorage.removeItem('nova_user');
  };

  return (
    <Router>
      <Layout 
        isAuthenticated={isAuthenticated} 
        userRole={userRole} 
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<Booking currentUser={currentUser} />} />
          <Route path="/labs" element={<LabAnalysis />} />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to={userRole === 'admin' ? "/admin" : "/profile"} replace /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/admin" 
            element={isAuthenticated && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated && userRole === 'patient' ? <PatientProfile user={currentUser} /> : <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;