import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from './config';
import './ManageUsers.css'; // Import the CSS file

function ManageUsers({ adminToken }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${config.api.baseUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to fetch users.');
    }
  };

  const handleStatusChange = async (userId, action) => {
    const newStatus = action === 'approve' ? 'approved' : 'reverted';
    try {
      await axios.post(
        `${config.api.baseUrl}/admin/approve-revert`, 
        { userId, action },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setUsers(users.map(user => user.id === userId ? { ...user, approval_status: newStatus } : user));
    } catch (err) {
      setError('Failed to update user status.');
    }
  };

  return (
    <div className="manage-users">
      <h2>Manage Users</h2>
      {error && <p className="error">{error}</p>}
      <ul className="user-list">
        {users.map(user => (
          <li key={user.id} className="user-item">
            <span className="username">{user.username}</span>
            <span className={`status ${user.approval_status}`}>
              Status: {user.approval_status.charAt(0).toUpperCase() + user.approval_status.slice(1)}
            </span>
            <div className="action-buttons">
              <button onClick={() => handleStatusChange(user.id, 'approve')} className="approve-button">Approve</button>
              <button onClick={() => handleStatusChange(user.id, 'revert')} className="revert-button">Revert</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManageUsers;
