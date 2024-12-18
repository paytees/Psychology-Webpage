import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function ManagePrompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Prompts
  const fetchPrompts = async () => {
    setLoading(true);
    setError(null); // Reset error before fetching
    try {
      const response = await axios.get('http://localhost:5000/prompts');
      if (response.status === 200) {
        setPrompts(response.data.prompts || []);
      } else {
        setError('Failed to fetch prompts. Unexpected response code.');
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('Failed to fetch prompts. Please check your network connection or contact support.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  if (loading) {
    return <div className="loading">Loading prompts...</div>;
  }

  return (
    <div className="manage-prompts">
      <h2>Manage Prompts</h2>

      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

      <table className="prompt-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f4f4f4' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f4f4f4' }}>Tag</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f4f4f4' }}>Prompt Text</th>
          </tr>
        </thead>
        <tbody>
          {prompts.length > 0 ? (
            prompts.map((prompt) => (
              <tr key={prompt.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{prompt.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prompt.tag}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {prompt.prompt.length > 100
                    ? `${prompt.prompt.substring(0, 100)}...`
                    : prompt.prompt}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', padding: '8px' }}>No prompts available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManagePrompts;
