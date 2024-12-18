import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import config from './config'; // Ensure you have this configuration file
import './ManageUsers.css'; // Import the CSS styles

function ManageUsers({ adminToken }) {
  const [users, setUsers] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [error, setError] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [editingRequest, setEditingRequest] = useState({ id: null, response: '' });

  // Fetch users (excluding admin)
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError('');
    try {
      const response = await axios.get(`${config.api.baseUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.status === 200 && response.data.users) {
        const filteredUsers = response.data.users.filter(
          (user) => user.username !== 'admin' // Exclude "admin"
        );
        setUsers(filteredUsers);
      } else {
        setError('No users found.');
      }
    } catch (err) {
      console.error('Error fetching users:', err.message);
      setError('Failed to fetch users.');
    } finally {
      setLoadingUsers(false);
    }
  }, [adminToken]);

  // Fetch user requests
  const fetchUserRequests = useCallback(async () => {
    setLoadingRequests(true);
    setError('');
    try {
      const response = await axios.get(`${config.api.baseUrl}/user-requests`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (response.status === 200 && response.data.userRequests) {
        setUserRequests(response.data.userRequests);
      } else {
        setError('No user requests found.');
      }
    } catch (err) {
      console.error('Error fetching user requests:', err.message);
      setError('Error fetching user requests.');
    } finally {
      setLoadingRequests(false);
    }
  }, [adminToken]);

  // Edit request handler
  const handleAdminResponseChange = (id, response) => {
    setEditingRequest({ id, response });
  };

  // Save updated admin response
  const saveAdminResponse = async (id) => {
    try {
      await axios.put(`${config.api.baseUrl}/user-requests/${id}/admin-response`, { adminResponse: editingRequest.response });
      setEditingRequest({ id: null, response: '' });
      fetchUserRequests(); // Refresh the table data after saving the response
    } catch (err) {
      setError('Failed to save admin response.');
    }
  };

  // Handle ChatGPT Response and Update in Existing Column
  const handleChatGPTResponse = async (id, question) => {
    try {
      const response = await axios.post(`${config.api.baseUrl}/chat`, { message: question });
      const chatGPTResponse = response.data.reply;

      // Update the User Request with ChatGPT response
      await axios.put(`${config.api.baseUrl}/user-requests/${id}/chatgpt-response`, { chatGPTResponse });

      // Refresh the user requests
      fetchUserRequests();
    } catch (err) {
      console.error('Error handling ChatGPT response:', err);
      setError('Failed to handle ChatGPT response');
    }
  };

  // Handle user status change (approve/revert)
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

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
    fetchUserRequests();
  }, [fetchUsers, fetchUserRequests]);

  return (
    <div className="manage-users">
      <h2>Manage Users</h2>
      {error && <p className="error">{error}</p>}
      {loadingUsers ? (
        <p>Loading users...</p>
      ) : (
        <ul className="user-list">
          {users.map((user) => (
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
      )}

      <h2>Manage User Requests</h2>
      {loadingRequests ? (
        <p>Loading user requests...</p>
      ) : userRequests.length > 0 ? (
        <table className="request-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>ChatGPT Response</th>
              <th>Admin Response</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userRequests.map((request) => (
              <tr key={request.id}>
                <td>{request.username}</td>
                <td>{request.chatGPTResponse || 'Cognitive biases are systematic patterns of deviation from rationality in decision-making...'}</td>
                <td>
                  {editingRequest.id === request.id ? (
                    <textarea
                      value={editingRequest.response}
                      onChange={(e) => handleAdminResponseChange(request.id, e.target.value)}
                    />
                  ) : (
                    request.adminResponse || 'No response yet'
                  )}
                </td>
                <td>
                  {editingRequest.id === request.id ? (
                    <button onClick={() => saveAdminResponse(request.id)} className="save-button">
                      Save
                    </button>
                  ) : (
                    <button onClick={() => handleAdminResponseChange(request.id, request.adminResponse || '')} className="edit-button">
                      Edit
                    </button>
                  )}
                  <button onClick={() => handleChatGPTResponse(request.id, request.chatGPTResponse)} className="chatgpt-button">
                    Update ChatGPT Response
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No user requests available.</p>
      )}
    </div>
  );
}

export default ManageUsers;
