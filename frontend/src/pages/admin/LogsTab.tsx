import React, { useState } from 'react';
import { useGetSystemErrorsQuery } from '../../store/api/masterApi';
import { TuiShimmer } from '../../components/tui/Primitives';
import { CaretDown, CaretRight } from '@phosphor-icons/react';

export const LogsTab: React.FC = () => {
  const { data: logs, isLoading: logsLoading } = useGetSystemErrorsQuery();
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const toggleLog = (id: number) => {
    const newSet = new Set(expandedLogs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedLogs(newSet);
  };

  return (
    <div className="w-full font-mono text-sm">
      {logsLoading ? (
        <div className="py-8">
          <TuiShimmer width={60} />
          <p className="text-secondary mt-2 text-xs uppercase tracking-widest">Loading system logs...</p>
        </div>
      ) : (
        <div className="bg-surface border border-border p-4">
          {logs?.length === 0 && <p className="text-secondary text-xs uppercase tracking-widest">No errors recorded.</p>}
          {logs?.map((log) => {
            const isExpanded = expandedLogs.has(log.id);
            return (
              <div key={log.id} className="mb-2 border border-border bg-bg/50">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-surface/50 transition-colors"
                  onClick={() => toggleLog(log.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-secondary">{new Date(log.createdAt).toLocaleString()}</span>
                    <span className="text-xs text-danger font-bold border border-danger/50 bg-danger/10 px-2 py-0.5">{log.endpoint}</span>
                  </div>
                  <div className="text-secondary">
                    {isExpanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="p-4 border-t border-border bg-bg">
                    <pre className="text-xs text-fg whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {log.errorMessage}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
