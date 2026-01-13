
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

const { Outlet } = ReactRouterDOM as any;

const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <PublicHeader />
            <main className="flex-grow">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};
export default PublicLayout;
