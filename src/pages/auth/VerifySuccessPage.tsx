import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { login } from '../../store/slices/authSlice';
import axios from 'axios';

export default function VerifySuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Set the token in localStorage and axios headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Get user data and update store
      const fetchUserData = async () => {
        try {
          const response = await axios.get('/api/auth/me');
          if (response.data.status === 'success') {
            // Update Redux store with user data
            dispatch(login({ token, user: response.data.data.user }));
            // Redirect to admin dashboard
            navigate('/admin/dashboard');
          } else {
            navigate('/login?error=Verification failed');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          navigate('/login?error=Verification failed');
        }
      };

      fetchUserData();
    } else {
      navigate('/login?error=Invalid verification');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
