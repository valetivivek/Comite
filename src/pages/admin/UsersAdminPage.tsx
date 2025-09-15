import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const UsersAdminPage = () => {
  const { isOwner } = useAuth();
  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('comite-admin-emails');
      if (stored) setEmails(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (list: string[]) => {
    setEmails(list);
    try { localStorage.setItem('comite-admin-emails', JSON.stringify(list)); } catch {}
  };

  const addEmail = () => {
    const email = input.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (emails.includes(email)) return;
    save([email, ...emails]);
    setInput('');
  };

  const removeEmail = (email: string) => {
    if (!isOwner) return;
    save(emails.filter(e => e !== email));
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-manga-text mb-4">Manage Admins</h1>
      {!isOwner && (
        <div className="card p-4 mb-4 text-manga-muted text-sm">Only the owner can modify admin emails.</div>
      )}
      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add admin email"
            value={input}
            onChange={e=>setInput(e.target.value)}
            disabled={!isOwner}
          />
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
            {emails.map(e => (
              <tr key={e} className="border-t border-manga-border">
                <td className="p-3 text-manga-text">{e}</td>
                <td className="p-3 text-manga-muted">admin</td>
                <td className="p-3 text-right">
                  <button className="text-red-400" onClick={()=>removeEmail(e)} disabled={!isOwner}>Remove</button>
                </td>
              </tr>
            ))}
            {emails.length === 0 && (
              <tr><td className="p-3 text-manga-muted" colSpan={3}>No admin emails configured.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default UsersAdminPage;


