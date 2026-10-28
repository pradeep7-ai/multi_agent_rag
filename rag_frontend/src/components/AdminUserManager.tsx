import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000';

interface User {
  _id: string;
  username: string;
  is_admin?: boolean;
}

const AdminUserManager: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
    // eslint-disable-next-line
  }, [isAdmin]);

  const handleDelete = async (userId: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      setSuccess('User deleted successfully.');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">User Management</h3>
      {loading && <div className="text-gray-500">Loading users...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user) => (
          <li key={user._id} className="flex items-center justify-between py-2">
            <div>
              <span className="font-medium text-gray-800 dark:text-gray-100">{user.username}</span>
              {user.is_admin && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded">admin</span>
              )}
            </div>
            <button
              className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
              onClick={() => handleDelete(user._id)}
              title="Delete user"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <button
        className="mt-3 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={fetchUsers}
      >
        Refresh
      </button>
    </div>
  );
};

export default AdminUserManager; 