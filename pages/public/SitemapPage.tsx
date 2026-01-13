import React from 'react';
import { Link } from 'react-router-dom';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-sky-200 pb-2">{title}</h2>
        <ul className="space-y-2">
            {children}
        </ul>
    </div>
);

const SiteLink: React.FC<{ to: string; children: React.ReactNode; sub?: boolean }> = ({ to, children, sub }) => (
    <li>
        <Link to={to} className={`text-sky-700 hover:text-sky-900 hover:underline ${sub ? 'pl-4' : ''}`}>
            {children}
        </Link>
    </li>
);

const SitemapPage: React.FC = () => {
    return (
        <div className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-800">Sitemap</h1>
                    <p className="mt-4 text-lg text-slate-600">An overview of our website's structure.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Column 1: Main Website Navigation */}
                    <div>
                        <Section title="Main Website">
                            <SiteLink to="/">Home</SiteLink>
                            <SiteLink to="/news">News & Announcements</SiteLink>
                            <SiteLink to="/about">About Us</SiteLink>
                            <SiteLink to="/history" sub>History</SiteLink>
                            <SiteLink to="/faculty" sub>Faculty</SiteLink>
                            <SiteLink to="/rules" sub>Rules & Regulations</SiteLink>
                            <SiteLink to="/admissions">Admissions</SiteLink>
                            <SiteLink to="/fees" sub>Fee Structure</SiteLink>
                            <SiteLink to="/supplies" sub>School Supplies</SiteLink>
                            <SiteLink to="/student-life">Student Life</SiteLink>
                            <SiteLink to="/ncc" sub>NCC</SiteLink>
                            <SiteLink to="/arts-culture" sub>Arts & Culture</SiteLink>
                            <SiteLink to="/eco-club" sub>Eco Club</SiteLink>
                            <SiteLink to="/campus">Campus</SiteLink>
                            <SiteLink to="/facilities" sub>Facilities</SiteLink>
                            <SiteLink to="/infrastructure" sub>Infrastructure</SiteLink>
                            <SiteLink to="/hostel" sub>Hostel</SiteLink>
                            <SiteLink to="/gallery" sub>Gallery</SiteLink>
                            <SiteLink to="/contact">Contact Us</SiteLink>
                        </Section>
                    </div>

                    {/* Column 2: Portal Access */}
                    <div>
                        <Section title="Portal Access">
                            <SiteLink to="/login">Portal Login</SiteLink>
                            <SiteLink to="/parent-signup">Parent/Student Registration</SiteLink>
                            <SiteLink to="/signup">Staff Registration</SiteLink>
                            <SiteLink to="/forgot-password">Forgot Password</SiteLink>
                        </Section>
                    </div>
                    
                    {/* Column 3: Internal Portal Pages (for reference) */}
                    <div>
                        <Section title="Portal Pages (Requires Login)">
                            <SiteLink to="/portal/dashboard">Dashboard</SiteLink>
                            <SiteLink to="/portal/routine">Class Routine</SiteLink>
                            <SiteLink to="/portal/students">Student List</SiteLink>
                            <SiteLink to="/portal/classes">Class List</SiteLink>
                            <SiteLink to="/portal/staff">Staff Management</SiteLink>
                            <SiteLink to="/portal/fees">Fee Management</SiteLink>
                            <SiteLink to="/portal/transfers">Transfer Management</SiteLink>
                            <SiteLink to="/portal/inventory">Inventory</SiteLink>
                            <SiteLink to="/portal/hostel-dashboard">Hostel Dashboard</SiteLink>
                            <SiteLink to="/portal/communication">Communication</SiteLink>
                            <SiteLink to="/portal/calendar">School Calendar</SiteLink>
                            <SiteLink to="/portal/news-management">News Management (Admin)</SiteLink>
                            <SiteLink to="/portal/users">User Management (Admin)</SiteLink>
                            <SiteLink to="/portal/promotion">Promotion (Admin)</SiteLink>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SitemapPage;