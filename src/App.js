import React, { useState, useEffect, useReducer, useRef, createContext, useContext, useMemo, useCallback } from 'react';
import './App.css';

// ---------- Theme Context ----------
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  useEffect(() => localStorage.setItem('darkMode', JSON.stringify(darkMode)), [darkMode]);
  return React.createElement(ThemeContext.Provider, { value: { darkMode, setDarkMode } }, children);
}

function useTheme() {
  return useContext(ThemeContext);
}

// ---------- Reducer ----------
function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD': return [...state, { id: Date.now(), title: action.payload, completed: false }];
    case 'DELETE': return state.filter(task => task.id !== action.payload);
    case 'TOGGLE': return state.map(task => task.id === action.payload ? { ...task, completed: !task.completed } : task);
    case 'EDIT': return state.map(task => task.id === action.payload.id ? { ...task, title: action.payload.title } : task);
    default: return state;
  }
}

// ---------- App ----------
export default function App() {
  return React.createElement(ThemeProvider, null, React.createElement(TaskManager, null));
}

// ---------- Task Manager ----------
function TaskManager() {
  const [tasks, dispatch] = useReducer(taskReducer, JSON.parse(localStorage.getItem('tasks')) || []);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState('');
  const { darkMode, setDarkMode } = useTheme();
  const inputRef = useRef(null);

  useEffect(() => inputRef.current.focus(), []);
  useEffect(() => localStorage.setItem('tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => { if (tasks.length) setNotification('Tasks Updated!'); }, [tasks]);
  useEffect(() => { const t = setTimeout(() => setNotification(''), 2000); return () => clearTimeout(t); }, [notification]);

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'completed': return tasks.filter(task => task.completed);
      case 'incomplete': return tasks.filter(task => !task.completed);
      default: return tasks;
    }
  }, [tasks, filter]);

  const addTask = useCallback(() => {
    if (!title.trim()) return;
    dispatch({ type: 'ADD', payload: title.trim() });
    setTitle('');
  }, [title]);

  const deleteTask = useCallback((id) => dispatch({ type: 'DELETE', payload: id }), []);
  const toggleTask = useCallback((id) => dispatch({ type: 'TOGGLE', payload: id }), []);
  const editTask = useCallback((id, newTitle) => dispatch({ type: 'EDIT', payload: { id, title: newTitle } }), []);

  return React.createElement('div', { className: darkMode ? 'container dark' : 'container' },
    React.createElement('h2', null, 'Task Manager (All Hooks Combined)'),
    React.createElement('button', { onClick: () => setDarkMode(!darkMode), className: 'toggle-btn' }, darkMode ? 'Light Mode' : 'Dark Mode'),
    notification && React.createElement('div', { className: 'notification' }, notification),
    React.createElement('input', { ref: inputRef, value: title, onChange: (e) => setTitle(e.target.value), placeholder: 'Enter task title...', className: 'input' }),
    React.createElement('button', { onClick: addTask, className: 'add-btn' }, 'Add Task'),
    React.createElement('select', { value: filter, onChange: (e) => setFilter(e.target.value), className: 'filter-select' },
      React.createElement('option', { value: 'all' }, 'All Tasks'),
      React.createElement('option', { value: 'completed' }, 'Completed'),
      React.createElement('option', { value: 'incomplete' }, 'Incomplete')
    ),
    React.createElement('div', { className: 'task-list' },
      filteredTasks.map(task => React.createElement(TaskItem, {
        key: task.id,
        task,
        onDelete: deleteTask,
        onToggle: toggleTask,
        onEdit: editTask
      }))
    )
  );
}

// ---------- Task Item ----------
function TaskItem({ task, onDelete, onToggle, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = () => {
    if (editTitle.trim()) onEdit(task.id, editTitle.trim());
    setIsEditing(false);
  };

  return React.createElement('div', { className: 'task-item' },
    isEditing
      ? React.createElement('input', { value: editTitle, onChange: (e) => setEditTitle(e.target.value), className: 'edit-input' })
      : React.createElement('span', { onClick: () => onToggle(task.id), className: task.completed ? 'completed' : '' }, task.title),
    React.createElement('div', null,
      isEditing
        ? React.createElement('button', { onClick: handleSave, className: 'edit-btn' }, 'Save')
        : React.createElement('button', { onClick: () => setIsEditing(true), className: 'edit-btn' }, 'Edit'),
      React.createElement('button', { onClick: () => onDelete(task.id), className: 'delete-btn' }, 'Delete')
    )
  );
}