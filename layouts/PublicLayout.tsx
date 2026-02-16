
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PublicHeader from '/components/PublicHeader';
import PublicFooter from '/components/PublicFooter';
import { User } from '/types';

const { Outlet } = ReactRouterDOM as any;

interface PublicLayoutProps {
    user: User | null;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ user }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <PublicHeader user={user} />
            <main className="flex-grow">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};
export default PublicLayout;
