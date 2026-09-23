import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate(data.role === 'ADMIN' ? '/office' : '/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email first to request a reset link.');
      return;
    }

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message || 'Password reset instructions sent.');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset request failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
      {message && <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border p-2 rounded" />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border p-2 rounded" />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-bold">Login</button>
        <button type="button" onClick={handleForgotPassword} className="mt-3 text-sm text-indigo-600 hover:underline">Forgot Password?</button>
      </form>
    </div>
  );
};

export default Login;
