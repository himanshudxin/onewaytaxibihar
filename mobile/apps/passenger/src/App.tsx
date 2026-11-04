import React from 'react';
import { ThemeProvider } from '../../../shared/theme/ThemeContext';
import { PassengerProvider } from './context/PassengerContext';
import { PassengerNavigator } from './navigation/PassengerNavigator';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary appName="OneWay Taxi Passenger">
      <ThemeProvider>
        <PassengerProvider>
          <PassengerNavigator />
        </PassengerProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
