import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';
import { User, NavMenuItem } from '@/types';  // ← add NavMenuItem

const { Outlet } = ReactRouterDOM as any;

interface PublicLayoutProps {
    user: User | null;
    navigation: NavMenuItem[];  // ← add this
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ user, navigation }) => {  // ← destructure it
    return (
        <div className="min-h-screen flex flex-col">
            <PublicHeader user={user} navigation={navigation} />  {/* ← pass it down */}
            <main className="flex-grow">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
