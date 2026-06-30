import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { ArrowLeft, Plus, UserPlus, MessageSquare, Send, X } from 'lucide-react';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [comments, setComments] = useState([]);
  
  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Form state
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchProjectData();

    // Socket.io setup
    socketRef.current = io(SOCKET_SERVER_URL, { withCredentials: true });
    socketRef.current.emit('join_project', id);

    socketRef.current.on('receive_message', (message) => {
      setComments((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (showChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, showChat]);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes, membersRes, commentsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
        api.get(`/projects/${id}/members`),
        api.get(`/projects/${id}/comments`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, projectId: id, status: 'todo' });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
      const tasksRes = await api.get(`/tasks?projectId=${id}`);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to create task (Admins only)');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      const membersRes = await api.get(`/projects/${id}/members`);
      setMembers(membersRes.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to add member');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    socketRef.current.emit('send_message', {
      projectId: id,
      userId: user.id || user._id,
      message: chatMessage
    });
    setChatMessage('');
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  if (!project) return <div style={{ padding: '40px', color: 'white' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px 40px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={24} /></Link>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{project.name}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{members.length} members</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="glass-button secondary" onClick={() => setShowMemberModal(true)}>
            <UserPlus size={18} /> Add Member
          </button>
          <button className="glass-button" onClick={() => setShowTaskModal(true)}>
            <Plus size={18} /> New Task
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: '24px', flex: 1, overflowX: 'auto', paddingBottom: '20px' }}>
        {['todo', 'in-progress', 'done'].map(status => (
          <div key={status} className="glass-panel" style={{ flex: '1 1 350px', minWidth: '300px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ textTransform: 'capitalize', marginBottom: '16px', fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              {status.replace('-', ' ')} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({getTasksByStatus(status).length})</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
              {getTasksByStatus(status).map(task => (
                <div key={task._id} className="glass-panel animate-fade-in" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                  <h4 style={{ fontWeight: '500', marginBottom: '4px' }}>{task.title}</h4>
                  {task.assignedTo && <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '8px' }}>👤 {task.assignedTo.name}</p>}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{task.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: task.priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)', color: task.priority === 'high' ? '#fca5a5' : '#cbd5e1' }}>
                      {task.priority}
                    </span>
                    <select 
                      className="glass-input" 
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    >
                      <option value="todo" style={{color:'black'}}>Todo</option>
                      <option value="in-progress" style={{color:'black'}}>In Progress</option>
                      <option value="done" style={{color:'black'}}>Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chat Widget Button */}
      <button 
        className="glass-button" 
        style={{ position: 'fixed', bottom: '24px', right: '24px', borderRadius: '50%', width: '56px', height: '56px', padding: 0, boxShadow: '0 8px 16px rgba(0,0,0,0.3)', zIndex: 40 }}
        onClick={() => setShowChat(!showChat)}
      >
        {showChat ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Widget Panel */}
      {showChat && (
        <div className="glass-panel animate-fade-in" style={{ position: 'fixed', bottom: '96px', right: '24px', width: '350px', height: '500px', display: 'flex', flexDirection: 'column', zIndex: 40, background: 'var(--bg-dark)', border: '1px solid var(--primary)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(99, 102, 241, 0.1)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={18} /> Project Chat</h3>
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments.map((c, i) => {
              const currentUserId = user.id || user._id;
              const isMe = c.userId?._id === currentUserId || c.userId === currentUserId;
              return (
                <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>{c.userId?.name || 'Unknown'}</span>
                  <div style={{ background: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '12px', borderBottomRightRadius: isMe ? '4px' : '12px', borderBottomLeftRadius: isMe ? '12px' : '4px', marginTop: '2px', fontSize: '0.9rem' }}>
                    {c.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendChatMessage} style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px' }}>
            <input 
              className="glass-input" 
              placeholder="Type a message..." 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              style={{ padding: '8px 12px' }}
            />
            <button type="submit" className="glass-button" style={{ padding: '8px', borderRadius: '50%' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '32px', width: '450px', background: 'var(--bg-dark)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Create Task</h2>
              <button className="glass-button secondary" style={{ padding: '4px' }} onClick={() => setShowTaskModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input className="glass-input" placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
              <textarea className="glass-input" placeholder="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} rows={3} />
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <select className="glass-input" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} style={{ flex: 1 }}>
                  <option value="low" style={{color:'black'}}>Low Priority</option>
                  <option value="medium" style={{color:'black'}}>Medium Priority</option>
                  <option value="high" style={{color:'black'}}>High Priority</option>
                </select>
                
                <select className="glass-input" value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})} style={{ flex: 1 }}>
                  <option value="" style={{color:'black'}}>Unassigned</option>
                  {members.map(m => (
                    <option key={m.userId._id} value={m.userId._id} style={{color:'black'}}>{m.userId.name}</option>
                  ))}
                </select>
              </div>
              
              <button type="submit" className="glass-button" style={{ marginTop: '8px' }}>Create Task</button>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '32px', width: '400px', background: 'var(--bg-dark)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2>Manage Team</h2>
              <button className="glass-button secondary" style={{ padding: '4px' }} onClick={() => setShowMemberModal(false)}><X size={20} /></button>
            </div>
            
            <div style={{ marginBottom: '24px', maxHeight: '150px', overflowY: 'auto' }}>
              <h4 style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Current Members</h4>
              {members.map(m => (
                <div key={m.userId._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                  <span>{m.userId.name} <span style={{ color: 'var(--text-muted)' }}>({m.userId.email})</span></span>
                  <span style={{ color: 'var(--primary)' }}>{m.role}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ color: 'var(--text-muted)' }}>Add New Member</h4>
              <input className="glass-input" type="email" placeholder="User's Email Address (must be registered)" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} required />
              <button type="submit" className="glass-button" style={{ marginTop: '8px' }}>Add Member</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
