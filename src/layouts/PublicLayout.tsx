import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { User, NavMenuItem } from '@/types';

const { Outlet } = ReactRouterDOM as any;

interface PublicLayoutProps {
    user: User | null;
    navigation: NavMenuItem[];
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ user, navigation }) => {
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}
        >
            <PublicHeader user={user} navigation={navigation} />
            <main className="flex-grow">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
