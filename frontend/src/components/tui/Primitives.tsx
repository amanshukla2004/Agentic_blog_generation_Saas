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

// TOP NAV
export const TopNav = ({ brand, links, right, className = '' }: any) => {
  return (
    <header className={`border-b border-border bg-bg text-fg px-4 py-3 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold tracking-widest uppercase text-fg hover:text-primary transition-colors">
          {brand}
        </Link>
        <nav className="flex items-center gap-4">
          {links.map((link: any, i: number) => (
            <Link key={i} to={link.to} className="text-secondary hover:text-primary transition-colors text-sm font-bold">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div>{right}</div>
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
  } else if (s.includes('error') || s.includes('fail') || s.includes('banned')) {
    icon = '✗';
    colorClass = 'text-error';
  } else if (s.includes('warning') || s.includes('draft')) {
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
  const isMaster = role === 'MASTER_ADMIN';
  const colorClass = isMaster ? 'text-role-master' : 'text-warning';
  const displayRole = isMaster ? 'MASTER' : 'ADMIN';
  
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
  const frames = ['·  ', '·· ', '···', ' ··', '  ·', '   '];
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, 300);
    return () => clearInterval(interval);
  }, []);
  
  return <span className="inline-block font-mono whitespace-pre">{frames[frame]}</span>;
};
