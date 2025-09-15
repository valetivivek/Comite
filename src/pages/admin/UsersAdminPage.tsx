import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const UsersAdminPage = () => {
  const { isOwner } = useAuth();
  const [roleMap, setRoleMap] = useState<Record<string, 'owner' | 'admin' | 'editor' | 'moderator' | 'user' | 'banned'>>({});
  const [input, setInput] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'moderator' | 'user' | 'banned'>('admin');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('comite-role-map');
      if (stored) setRoleMap(JSON.parse(stored));
    } catch {}
  }, []);

  const saveMap = (map: Record<string, any>) => {
    setRoleMap(map);
    try { localStorage.setItem('comite-role-map', JSON.stringify(map)); } catch {}
  };

  const addEmail = () => {
    const email = input.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (roleMap[email]) return;
    const next = { ...roleMap, [email]: role };
    saveMap(next);
    setInput('');
  };

  const removeEmail = (email: string) => {
    if (!isOwner) return;
    const next = { ...roleMap };
    delete next[email];
    saveMap(next);
  };

  const changeRole = (email: string, newRole: 'admin' | 'editor' | 'moderator' | 'user' | 'banned') => {
    if (!isOwner) return;
    const next = { ...roleMap, [email]: newRole };
    saveMap(next);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-manga-text mb-4">Manage Roles</h1>
      {!isOwner && (
        <div className="card p-4 mb-4 text-manga-muted text-sm">Only the owner can modify admin emails.</div>
      )}
      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add user email"
            value={input}
            onChange={e=>setInput(e.target.value)}
            disabled={!isOwner}
          />
          <select className="input w-40" value={role} onChange={e=>setRole(e.target.value as any)} disabled={!isOwner}>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
            <option value="banned">Banned</option>
          </select>
          <button className="btn-primary" onClick={addEmail} disabled={!isOwner || !input}>Add</button>
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-manga-surface text-left">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(roleMap).map(([e, r]) => (
              <tr key={e} className="border-t border-manga-border">
                <td className="p-3 text-manga-text">{e}</td>
                <td className="p-3 text-manga-muted">
                  {e === 'ultimategamervivek@gmail.com' ? (
                    <span>owner</span>
                  ) : (
                    <select className="input" value={r} onChange={ev=>changeRole(e, ev.target.value as any)} disabled={!isOwner}>
                      <option value="admin">admin</option>
                      <option value="editor">editor</option>
                      <option value="moderator">moderator</option>
                      <option value="user">user</option>
                      <option value="banned">banned</option>
                    </select>
                  )}
                </td>
                <td className="p-3 text-right">
                  {e !== 'ultimategamervivek@gmail.com' && (
                    <button className="text-red-400" onClick={()=>removeEmail(e)} disabled={!isOwner}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
            {Object.keys(roleMap).length === 0 && (
              <tr><td className="p-3 text-manga-muted" colSpan={3}>No admin emails configured.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default UsersAdminPage;


