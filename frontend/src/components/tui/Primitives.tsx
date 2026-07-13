import React from 'react';
import { Link } from 'react-router-dom';

// BUTTON
export const Button = ({ variant = 'ghost', icon, className = '', children, ...props }: any) => {
  const baseClass = 'tui-btn group flex items-center';
  const variantClass = `tui-btn-${variant}`;
  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      <span className="w-3 text-left opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100 transition-opacity">
        ▸
      </span>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

// MODAL
export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-mono text-sm">
      <div className="bg-bg border border-border w-full max-w-md">
        <div className="flex justify-between items-center border-b border-border p-4 bg-surface">
          <h3 className="font-bold text-fg uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="text-secondary hover:text-fg font-bold px-2 py-1">✕</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// TOP NAV
export const TopNav = ({ brand, links, right, className = '' }: any) => {
  const [isSupportOpen, setIsSupportOpen] = React.useState(false);
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@blogwho.com';

  return (
    <header className={`border-b border-border bg-bg text-fg px-4 py-3 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-8">
        <div className="flex flex-col">
          <Link to="/" className="font-bold tracking-widest uppercase text-fg hover:text-primary transition-colors text-lg leading-none mb-1">
            {brand}
          </Link>
          <span className="text-[9px] uppercase tracking-widest text-secondary">agentic blogging platform</span>
        </div>
        <nav className="flex items-center gap-4">
          {links.map((link: any, i: number) => (
            <Link key={i} to={link.to} className="text-secondary hover:text-primary transition-colors text-sm font-bold">
              {link.label}
            </Link>
          ))}
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="text-secondary hover:text-primary transition-colors flex items-center ml-2"
            title="Support"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a9 9 0 0 0-9 9v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a7 7 0 0 1 14 0h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a9 9 0 0 0-9-9z"></path>
              <path d="M19 13v8"></path>
              <path d="M15 21h4"></path>
            </svg>
          </button>
        </nav>
      </div>
      <div>{right}</div>

      <Modal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="Support & Feedback">
        <p className="text-secondary mb-4 leading-relaxed">
          If you encounter any bug, want to report an issue, or have any suggestions for the platform, please contact us!
        </p>
        <div className="bg-surface border border-border p-3 text-center">
          <a href={`mailto:${supportEmail}`} className="text-accent font-bold hover:underline">
            {supportEmail}
          </a>
        </div>
      </Modal>
    </header>
  );
};

// PANEL
export const Panel = ({ title, children, className = '' }: any) => {
  return (
    <div className={`relative border border-border bg-surface pt-6 px-4 pb-4 mt-3 ${className}`}>
      {title && (
        <span className="absolute -top-2.5 left-4 bg-bg px-2 text-fg font-bold">
          {title}
        </span>
      )}
      {children}
    </div>
  );
};

// FIELD
export const Field = ({ label, children, className = '' }: any) => {
  return (
    <div className={`flex flex-col gap-2 mb-4 ${className}`}>
      {label && <label className="text-secondary text-sm font-bold">{label}</label>}
      {children}
    </div>
  );
};

// INPUT
export const Input = (props: any) => {
  return <input className="tui-input" {...props} />;
};

// STATUS BADGE
export const StatusBadge = ({ status, children, className = '' }: any) => {
  let icon = '○';
  let colorClass = 'text-secondary border-secondary';
  
  const s = String(status).toLowerCase();
  if (s.includes('success') || s.includes('published') || s.includes('active')) {
    icon = '✓';
    colorClass = 'text-success';
  } else if (s.includes('error') || s.includes('fail') || s.includes('banned') || s.includes('reject')) {
    icon = '✗';
    colorClass = 'text-error';
  } else if (s.includes('warning') || s.includes('draft') || s.includes('review')) {
    icon = '○';
    colorClass = 'text-warning';
  } else if (s.includes('running') || s.includes('building')) {
    icon = '▶';
    colorClass = 'text-accent';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs uppercase tracking-widest ${colorClass} ${className}`}>
      <span>{icon}</span>
      <span>{children}</span>
    </span>
  );
};

// ROLE BADGE
export const RoleBadge = ({ role, className = '' }: any) => {
  let displayRole = 'USER';
  let colorClass = 'text-secondary';
  
  if (role === 'MASTER_ADMIN') {
    displayRole = 'MASTER ADMIN';
    colorClass = 'text-role-master';
  } else if (role === 'ADMIN') {
    displayRole = 'AUTHOR';
    colorClass = 'text-warning';
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs border border-border uppercase tracking-widest ${colorClass} ${className}`}>
      {displayRole}
    </span>
  );
};

// TABLE
export const Table = ({ columns, data, renderRow, className = '' }: any) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-secondary font-bold">
            {columns.map((col: string, i: number) => (
              <th key={i} className="px-4 py-3 font-normal">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, i: number) => (
            <tr key={i} className="border-b border-border last:border-b-0 hover:bg-surface transition-colors">
              {renderRow(row)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// TABS
export const Tabs = ({ tabs, activeTab, onTabChange, className = '' }: any) => {
  return (
    <div className={`flex border-b border-border ${className}`}>
      {tabs.map((tab: string, i: number) => {
        const isActive = activeTab === tab;
        return (
          <div key={i} className="flex">
            {i > 0 && <div className="w-px bg-border my-2" />}
            <button
              onClick={() => onTabChange(tab)}
              className={`px-6 py-2 text-sm outline-none transition-colors -mb-[1px]
                ${isActive 
                  ? 'border-t border-l border-r border-border bg-bg text-primary font-bold border-b bg-bg border-b-bg' 
                  : 'text-secondary hover:text-fg border border-transparent'
                }`}
              style={isActive ? { borderBottomColor: 'var(--color-bg)' } : {}}
            >
              {tab}
            </button>
          </div>
        );
      })}
    </div>
  );
};

// PROGRESS
export const Progress = ({ value, max = 100, className = '' }: any) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isOverQuota = value > max;
  const fillClass = isOverQuota ? 'text-danger' : 'text-accent';
  
  const totalBlocks = 20;
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  
  return (
    <div className={`font-mono flex items-center gap-2 ${className}`}>
      <span className={fillClass}>
        ▕{'█'.repeat(filledBlocks)}{'░'.repeat(emptyBlocks)}▏
      </span>
      <span className="text-secondary">{Math.round(percentage)}%</span>
    </div>
  );
};

// THINKING DOTS
export const ThinkingDots = () => {
  const [frame, setFrame] = React.useState(0);
  const dots = ['.', '..', '...', ''];
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 4);
    }, 300);
    return () => clearInterval(interval);
  }, []);
  
  return <span className="inline-block w-4 text-left font-mono">{dots[frame]}</span>;
};

// TUI SHIMMER / LOADING SKELETON
export const TuiShimmer = ({ width = 40, className = '' }: { width?: number; className?: string }) => {
  const [position, setPosition] = React.useState(0);
  
  React.useEffect(() => {
    // Move the "shimmer" head across the width
    const interval = setInterval(() => {
      setPosition(p => (p + 1) % (width + 5)); // +5 so it sweeps off screen before looping
    }, 50);
    return () => clearInterval(interval);
  }, [width]);

  // We build a string of light shade blocks '░'
  // And overlay a "bright" spot '█▓▒' at the current position
  let blocks = Array(width).fill('░');
  
  // The sweeping head
  if (position - 2 >= 0 && position - 2 < width) blocks[position - 2] = '▒';
  if (position - 1 >= 0 && position - 1 < width) blocks[position - 1] = '▓';
  if (position >= 0 && position < width) blocks[position] = '█';
  if (position + 1 >= 0 && position + 1 < width) blocks[position + 1] = '▓';
  if (position + 2 >= 0 && position + 2 < width) blocks[position + 2] = '▒';

  return (
    <div className={`font-mono text-secondary flex w-full select-none overflow-hidden ${className}`}>
      <span>{blocks.join('')}</span>
    </div>
  );
};

// TUI PAGINATION
export const TuiPagination = ({ currentPage, totalPages, onPageChange, className = '' }: any) => {
  return (
    <div className={`flex items-center gap-4 font-mono text-sm select-none ${className}`}>
      <button 
        onClick={() => onPageChange(0)} 
        disabled={currentPage === 0}
        className="text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
      >
        [&#60;&#60;]
      </button>
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 0}
        className="text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
      >
        [&#60;]
      </button>
      
      <span className="text-fg font-bold tracking-widest">
        {currentPage + 1} <span className="text-secondary font-normal">/ {totalPages || 1}</span>
      </span>

      <button 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage >= totalPages - 1}
        className="text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
      >
        [&#62;]
      </button>
      <button 
        onClick={() => onPageChange(totalPages - 1)} 
        disabled={currentPage >= totalPages - 1}
        className="text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
      >
        [&#62;&#62;]
      </button>
    </div>
  );
};

// TUI CHECKBOX
export const TuiCheckbox = ({ checked, onChange, label, className = '' }: any) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer font-mono select-none ${className}`}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        className="hidden"
      />
      <span className={checked ? 'text-primary font-bold' : 'text-secondary'}>
        [{checked ? 'x' : ' '}]
      </span>
      {label && <span className={checked ? 'text-fg' : 'text-secondary'}>{label}</span>}
    </label>
  );
};
