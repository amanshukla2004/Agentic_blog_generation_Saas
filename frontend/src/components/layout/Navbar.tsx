import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { TopNav, Button } from '../tui/Primitives';

export const Navbar = () => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getRoleRingColor = () => {
    if (role?.includes('MASTER_ADMIN')) return 'ring-role-master';
    if (role?.includes('ADMIN')) return 'ring-warning';
    return 'ring-accent';
  };
  
  const getRoleInitial = () => {
    if (role?.includes('MASTER_ADMIN')) return 'M';
    if (role?.includes('ADMIN')) return 'A';
    return 'U';
  };

  const links = isAuthenticated ? [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Generate', to: '/generate' },
    { label: 'Profile', to: '/profile' },
    ...(role?.includes('ADMIN') || role?.includes('MASTER_ADMIN') ? [{ label: 'Admin', to: '/admin-dashboard' }] : []),
    ...(role?.includes('MASTER_ADMIN') ? [{ label: 'Master', to: '/master-dashboard' }] : []),
  ] : [];

  const rightElement = isAuthenticated ? (
    <div className="flex items-center gap-4">
      <span className={`w-8 h-8 rounded-full border border-bg ring-1 ${getRoleRingColor()} flex items-center justify-center text-xs bg-surface text-fg uppercase`}>
        {getRoleInitial()}
      </span>
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
