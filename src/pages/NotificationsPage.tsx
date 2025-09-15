import { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { Notification } from '../types';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    dataService.getNotifications().then(setNotifications);
  }, []);

  return (
    <div className="min-h-screen bg-manga-bg section-spacing">
      <div className="container-spacing">
        <h1 className="text-2xl font-bold text-manga-text mb-4">Notifications</h1>
        <div className="card p-0">
          <ul>
            {notifications.map(n => (
              <li key={n.id} className="p-4 border-t border-manga-border first:border-t-0">
                <p className="text-manga-text font-medium">{n.seriesTitle}</p>
                <p className="text-manga-muted text-sm">{n.message}</p>
              </li>
            ))}
            {notifications.length === 0 && (
              <li className="p-4 text-manga-muted text-sm">No notifications</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;


