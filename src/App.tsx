import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { VillaHero } from './components/villa/VillaHero';
import { VillaDetails } from './components/villa/VillaDetails';
import { BookingCard } from './components/booking/BookingCard';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { AdminRoute } from './components/auth/AdminRoute';
import { AuthRoute } from './components/auth/AuthRoute';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Provider } from 'react-redux';
import { store } from './store';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load components
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const AdminBookings = lazy(() => import('./pages/dashboard/AdminBookings'));
const AdminUsers = lazy(() => import('./pages/dashboard/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/dashboard/AdminSettings'));
const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const VerifySuccessPage = lazy(() => import('./pages/auth/VerifySuccessPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));
const CustomerInfoForm = lazy(() => import('./components/booking/CustomerInfoForm').then(module => ({ default: module.CustomerInfoForm })));
const PaymentMethod = lazy(() => import('./components/booking/PaymentMethod').then(module => ({ default: module.PaymentMethod })));
const BookingConfirmation = lazy(() => import('./components/booking/BookingConfirmation').then(module => ({ default: module.BookingConfirmation })));

function HomePage() {
  return (
    <main className="relative">
      <VillaHero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <VillaDetails />
          </div>
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <BookingCard />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Header />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/booking/:id" element={<CustomerInfoForm />} />
                    <Route path="/booking/:id/payment" element={<PaymentMethod />} />
                    <Route path="/booking/:id/confirmation" element={<BookingConfirmation />} />
                    
                    {/* Auth Routes - Redirect to appropriate page if already logged in */}
                    <Route path="/login" element={
                      <AuthRoute>
                        <LoginForm />
                      </AuthRoute>
                    } />
                    <Route path="/register" element={
                      <AuthRoute>
                        <RegisterForm />
                      </AuthRoute>
                    } />
                    <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
                    <Route path="/auth/verify-success" element={<VerifySuccessPage />} />

                    {/* Admin Routes - Protected and nested */}
                    <Route
                      path="/admin/*"
                      element={
                        <AdminRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <DashboardLayout>
                              <Routes>
                                <Route index element={<AdminDashboard />} />
                                <Route path="bookings" element={<AdminBookings />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="settings" element={<AdminSettings />} />
                              </Routes>
                            </DashboardLayout>
                          </Suspense>
                        </AdminRoute>
                      }
                    />

                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;