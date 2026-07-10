import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { TopNav, Button } from '../tui/Primitives';

export const TopBar = () => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getRoleRingColor = () => {
    if (role?.includes('MASTER_ADMIN')) return 'ring-role-master border-role-master text-role-master';
    if (role?.includes('ADMIN')) return 'ring-warning border-warning text-warning';
    return 'ring-accent border-accent text-accent';
  };
  
  const getProfileInitial = () => {
    const email = useSelector((state: RootState) => state.auth.email) || '';
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  const links = isAuthenticated ? [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Generate', to: '/generate' },
    ...(role?.includes('ADMIN') || role?.includes('MASTER_ADMIN') ? [{ label: 'Admin', to: '/admin-dashboard' }] : []),
    ...(role?.includes('MASTER_ADMIN') ? [{ label: 'Master', to: '/master-dashboard' }] : []),
  ] : [];

  const rightElement = isAuthenticated ? (
    <div className="flex items-center gap-4">
      <div 
        onClick={() => navigate('/profile')}
        className={`w-8 h-8 rounded-full border ring-1 ${getRoleRingColor()} flex items-center justify-center text-xs bg-surface uppercase cursor-pointer hover:bg-bg transition-colors`}
      >
        {getProfileInitial()}
      </div>
      <Button variant="ghost" onClick={handleLogout}>Log Out</Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={() => navigate('/login')}>Log In</Button>
      <Button variant="primary" onClick={() => navigate('/register')}>Register</Button>
    </div>
  );

  return (
    <TopNav 
      brand="AgenticBlog"
      links={links}
      right={rightElement}
    />
  );
};
