import React, { useState, useEffect } from 'react';
import { useGetSystemSettingsQuery, useUpdateSettingMutation } from '../../store/api/masterApi';
import { Field, Input, Button, TuiShimmer } from '../../components/tui/Primitives';

export const SettingsTab: React.FC = () => {
  const { data: settings, isLoading, refetch } = useGetSystemSettingsQuery();
  const [updateSetting] = useUpdateSettingMutation();
  
  const [userLimit, setUserLimit] = useState('');
  const [adminLimit, setAdminLimit] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState('false');
  const [systemAnnouncement, setSystemAnnouncement] = useState('');

  useEffect(() => {
    if (settings) {
      const userL = settings.find((s: any) => s.settingKey === 'USER_GENERATION_LIMIT')?.settingValue;
      const adminL = settings.find((s: any) => s.settingKey === 'ADMIN_GENERATION_LIMIT')?.settingValue;
      const mm = settings.find((s: any) => s.settingKey === 'MAINTENANCE_MODE')?.settingValue;
      const sa = settings.find((s: any) => s.settingKey === 'SYSTEM_ANNOUNCEMENT_TEXT')?.settingValue;
      if (userL) setUserLimit(userL);
      if (adminL) setAdminLimit(adminL);
      if (mm) setMaintenanceMode(mm);
      if (sa) setSystemAnnouncement(sa);
    }
  }, [settings]);

  const handleUpdateLimit = async (key: string, value: string) => {
    await updateSetting({ key, settingValue: value });
    alert(`Setting ${key} updated.`);
    refetch();
  };

  return (
    <div className="w-full font-mono text-sm">
      {isLoading ? (
        <div className="py-8">
          <TuiShimmer width={60} />
          <p className="text-secondary mt-2 text-xs uppercase tracking-widest">Loading settings...</p>
        </div>
      ) : (
        <div className="w-full max-w-xl">
          <div className="bg-surface border border-border p-6 mb-6">
            <h2 className="text-md font-bold mb-4 uppercase tracking-widest text-fg">Generation Limits</h2>
            <p className="text-xs text-secondary mb-6">Control how many drafts normal users and authors (publishers) can generate.</p>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Field label="Normal User Limit">
                    <Input 
                      type="number" 
                      value={userLimit} 
                      onChange={(e: any) => setUserLimit(e.target.value)} 
                      placeholder="e.g. 6"
                    />
                  </Field>
                </div>
                <Button variant="accent" onClick={() => handleUpdateLimit('USER_GENERATION_LIMIT', userLimit)}>
                  Update User Limit
                </Button>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Field label="Author / Publisher Limit">
                    <Input 
                      type="number" 
                      value={adminLimit} 
                      onChange={(e: any) => setAdminLimit(e.target.value)} 
                      placeholder="e.g. 30"
                    />
                  </Field>
                </div>
                <Button variant="accent" onClick={() => handleUpdateLimit('ADMIN_GENERATION_LIMIT', adminLimit)}>
                  Update Author Limit
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border p-6 mb-6">
            <h2 className="text-md font-bold mb-4 uppercase tracking-widest text-fg">System Controls</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Field label="Maintenance Mode">
                    <Input 
                      value={maintenanceMode} 
                      onChange={(e: any) => setMaintenanceMode(e.target.value)} 
                      placeholder="true or false"
                    />
                  </Field>
                </div>
                <Button variant={maintenanceMode === 'true' ? 'danger' : 'accent'} onClick={() => handleUpdateLimit('MAINTENANCE_MODE', maintenanceMode)}>
                  Update Maintenance Mode
                </Button>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Field label="System Announcement Text">
                    <Input 
                      value={systemAnnouncement} 
                      onChange={(e: any) => setSystemAnnouncement(e.target.value)} 
                      placeholder="Enter announcement..."
                    />
                  </Field>
                </div>
                <Button variant="accent" onClick={() => handleUpdateLimit('SYSTEM_ANNOUNCEMENT_TEXT', systemAnnouncement)}>
                  Update Announcement
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
