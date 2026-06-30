import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FolderPlus, LogOut, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name: newProjectName, description: newProjectDesc });
      setShowModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="glass-button" onClick={() => setShowModal(true)}>
            <FolderPlus size={18} /> New Project
          </button>
          <button className="glass-button secondary" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {projects.map(project => (
          <div key={project._id} className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{project.name}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', flex: 1 }}>{project.description || 'No description provided.'}</p>
            <Link to={`/project/${project._id}`} style={{ alignSelf: 'flex-start' }}>
              <button className="glass-button secondary" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                Open Project <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '32px', width: '400px', background: 'var(--bg-dark)' }}>
            <h2 style={{ marginBottom: '24px' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                className="glass-input"
                type="text"
                placeholder="Project Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />
              <textarea
                className="glass-input"
                placeholder="Description (Optional)"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                rows={3}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="glass-button secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="glass-button" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
