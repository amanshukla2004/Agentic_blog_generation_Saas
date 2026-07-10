import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../ui/Button';

export const TopBar: React.FC = () => {
  const { isAuthenticated, email, role } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getInitial = () => {
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <nav className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center px-4 lg:px-8">
      <Link to="/" className="text-xl font-bold text-zinc-900 hover:text-zinc-600 transition-colors">
        AgenticBlog<span className="text-zinc-400">.</span>
      </Link>
      
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors hidden sm:block">Dashboard</Link>
            <Link to="/generate" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors hidden sm:block">Generate</Link>
            
            {(role?.includes('ADMIN') || role?.includes('MASTER_ADMIN')) && (
              <Link to="/admin-dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors hidden sm:block">Admin</Link>
            )}
            {role?.includes('MASTER_ADMIN') && (
              <Link to="/master-dashboard" className="text-sm font-medium text-purple-600 hover:text-purple-900 transition-colors hidden sm:block">Master</Link>
            )}
            
            <div className="flex items-center gap-3 ml-2 border-l border-zinc-200 pl-4">
              <Link to="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white font-semibold text-sm hover:ring-2 hover:ring-zinc-900 hover:ring-offset-2 transition-all">
                {getInitial()}
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="secondary" className="active:scale-95 text-sm h-9 px-4">Log In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" className="active:scale-95 text-sm h-9 px-4 bg-zinc-900 text-white hover:bg-zinc-800">Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
