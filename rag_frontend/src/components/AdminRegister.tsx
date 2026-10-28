import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminRegister: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          username, 
          password, 
          is_admin: isAdminUser 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setMessage('User registered successfully!');
      setUsername('');
      setPassword('');
      setIsAdminUser(false);
      setError('');
    } catch (err: any) {
      setError(err.message);
      setMessage('');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4 max-w-sm mx-auto">
        <h2 className="text-xl mb-4 text-red-600">Access Denied</h2>
        <p className="text-gray-600">Only administrators can register new users.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl mb-4">Register New User</h2>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <div className="mb-2 flex items-center">
        <input
          type="checkbox"
          id="isAdmin"
          checked={isAdminUser}
          onChange={(e) => setIsAdminUser(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="isAdmin" className="text-sm">
          Grant admin privileges
        </label>
      </div>
      
      <button
        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={handleRegister}
      >
        Register User
      </button>
    </div>
  );
};

export default AdminRegister; 