import React from 'react';
import { ThemeProvider } from '../../../shared/theme/ThemeContext';
import { DriverProvider } from './context/DriverContext';
import { DriverNavigator } from './navigation/DriverNavigator';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary appName="OneWay Taxi Chauffeur">
      <ThemeProvider>
        <DriverProvider>
          <DriverNavigator />
        </DriverProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
