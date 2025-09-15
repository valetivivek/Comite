import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

type Preferences = {
  theme: 'dark' | 'light';
  notifications: boolean;
  itemsPerPage: number;
  autoMarkAsRead: boolean;
};

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [prefs, setPrefs] = useState<Preferences>({ theme: theme, notifications: true, itemsPerPage: 10, autoMarkAsRead: true });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('manga-reader-user');
      if (userData) {
        const user = JSON.parse(userData);
        const p = user.preferences || {};
        setPrefs({
          theme: (localStorage.getItem('theme') as 'dark' | 'light') || p.theme || theme,
          notifications: p.notifications ?? true,
          itemsPerPage: p.itemsPerPage ?? 10,
          autoMarkAsRead: p.autoMarkAsRead ?? true,
        });
      }
    } catch {}
  }, []);

  const save = () => {
    try {
      const existing = localStorage.getItem('manga-reader-user');
      const user = existing ? JSON.parse(existing) : {};
      user.preferences = { ...(user.preferences || {}), ...prefs };
      localStorage.setItem('manga-reader-user', JSON.stringify(user));
      // Apply theme immediately if changed
      if (prefs.theme !== theme) toggleTheme();
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-manga-bg section-spacing">
      <div className="container-spacing">
        <h1 className="text-2xl font-bold text-manga-text mb-4">App Settings</h1>

        <div className="card p-4 space-y-6">
          <div>
            <h2 className="font-semibold text-manga-text mb-2">Theme</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input type="radio" name="theme" checked={prefs.theme==='dark'} onChange={()=>setPrefs({...prefs, theme: 'dark'})} />
                <span className="text-manga-text">Dark</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="theme" checked={prefs.theme==='light'} onChange={()=>setPrefs({...prefs, theme: 'light'})} />
                <span className="text-manga-text">Light</span>
              </label>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-manga-text mb-2">Notifications</h2>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={prefs.notifications} onChange={e=>setPrefs({...prefs, notifications: e.target.checked})} />
              <span className="text-manga-text">Enable in-app notifications</span>
            </label>
          </div>

          <div>
            <h2 className="font-semibold text-manga-text mb-2">Items per page</h2>
            <input type="number" min={5} max={50} step={1} className="input w-24" value={prefs.itemsPerPage} onChange={e=>setPrefs({...prefs, itemsPerPage: Math.max(5, Math.min(50, Number(e.target.value)||10))})} />
          </div>

          <div>
            <h2 className="font-semibold text-manga-text mb-2">Reader</h2>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={prefs.autoMarkAsRead} onChange={e=>setPrefs({...prefs, autoMarkAsRead: e.target.checked})} />
              <span className="text-manga-text">Auto mark chapters as read</span>
            </label>
          </div>

          <div>
            <button className="btn-primary" onClick={save}>Save Changes</button>
            {saved && <span className="ml-3 text-manga-muted text-sm">Saved</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


