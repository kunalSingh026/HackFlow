import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeamDashboard from '../components/dashboard/TeamDashboard';
import JudgeDashboard from './JudgeDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Route the user based on their RBAC (Role-Based Access Control)
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'judge') {
    return <JudgeDashboard />;
  }

  return <TeamDashboard />;
};

export default Dashboard;
