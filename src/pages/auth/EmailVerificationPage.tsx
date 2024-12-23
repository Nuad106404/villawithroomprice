import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { login } from '../../store/slices/authSlice';
import api from '../../utils/axios';
import { toast } from 'sonner';

export default function EmailVerificationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log('Verifying token:', token);
        
        // Call the verification endpoint
        const response = await api.get(`/auth/verify/${token}`);
        console.log('Verification response:', response.data);
        
        if (response.data.status === 'success') {
          const { token: authToken, data } = response.data;
          
          // Set the token in localStorage
          localStorage.setItem('token', authToken);
          
          // Update Redux store with user data
          dispatch(login({ token: authToken, user: data.user }));
          
          // Show success message
          toast.success('Email verified successfully! Redirecting to dashboard...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        const errorMessage = error.response?.data?.message || 'Email verification failed';
        setError(errorMessage);
        toast.error(errorMessage);
        
        // Redirect to login after showing error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setError('No verification token provided');
      navigate('/login');
    }
  }, [token, navigate, dispatch]);

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Verifying your email...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Success! </strong>
        <span className="block sm:inline">Your email has been verified.</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
    </div>
  );
}
