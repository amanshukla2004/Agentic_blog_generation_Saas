import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center py-6 px-8 bg-tertiary border-b border-muted">
      <Link to="/" className="headline-md font-semibold text-secondary hover:text-primary transition-colors">
        AgenticBlog<span className="text-accent">.</span>
      </Link>
      
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="label-lg hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/generate" className="label-lg hover:text-primary transition-colors">Generate</Link>
            <Link to="/profile" className="label-lg hover:text-primary transition-colors">Profile</Link>
            
            {(role?.includes('ADMIN') || role?.includes('MASTER_ADMIN')) && (
              <Link to="/admin-dashboard" className="label-lg hover:text-primary transition-colors text-emerald-600">Admin</Link>
            )}
            {role?.includes('MASTER_ADMIN') && (
              <Link to="/master-dashboard" className="label-lg hover:text-primary transition-colors text-purple-600">Master</Link>
            )}
            
            <Button variant="secondary" onClick={handleLogout} className="ml-4">
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="secondary">Log In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
