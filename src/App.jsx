import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Monitoring from './pages/Monitoring.jsx';
import ErrorDetection from './pages/ErrorDetection.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication screen route */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard overview routes wrapped in Layout frame */}
        <Route 
          path="/dashboard" 
          element={
            <Layout>
              <Dashboard />
            </Layout>
          } 
        />
        
        <Route 
          path="/monitoring" 
          element={
            <Layout>
              <Monitoring />
            </Layout>
          } 
        />

        <Route 
          path="/errors" 
          element={
            <Layout>
              <ErrorDetection />
            </Layout>
          } 
        />

        <Route 
          path="/analytics" 
          element={
            <Layout>
              <Analytics />
            </Layout>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <Layout>
              <Settings />
            </Layout>
          } 
        />

        {/* Root fallback redirects */}
        <Route 
          path="*" 
          element={<Navigate to="/login" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
