
import React from 'react';
import NotificationToast from './NotificationToast.tsx';
import { NotificationType } from '../types';

interface NotificationContainerProps {
    notifications: { id: string; message: string; type: NotificationType; title?: string; }[];
    onDismiss: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onDismiss }) => {
    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-24 right-5 z-50 space-y-3 w-full max-w-sm">
            {notifications.map(notif => (
                <NotificationToast
                    key={notif.id}
                    message={notif.message}
                    type={notif.type}
                    title={notif.title}
                    onDismiss={() => onDismiss(notif.id)}
                />
            ))}
        </div>
    );
};

export default NotificationContainer;
