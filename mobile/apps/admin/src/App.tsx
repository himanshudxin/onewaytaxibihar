import React from 'react';
import { ThemeProvider } from '../../../shared/theme/ThemeContext';
import { AdminProvider } from './context/AdminContext';
import { AdminNavigator } from './navigation/AdminNavigator';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary appName="OneWay Taxi Admin">
      <ThemeProvider>
        <AdminProvider>
          <AdminNavigator />
        </AdminProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
