import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM as any;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8 bg-white border border-[#0B1F3A]/10 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#0B1F3A] mb-4 border-b-2 border-[#C9A84C] pb-2">{title}</h2>
        <ul className="space-y-2.5">
            {children}
        </ul>
    </div>
);

const SiteLink: React.FC<{ to: string; children: React.ReactNode; sub?: boolean }> = ({ to, children, sub }) => (
    <li>
        <Link to={to} className={`text-sm font-medium text-[#132D52] hover:text-[#8E6D1B] hover:underline transition-colors ${sub ? 'pl-4 inline-flex items-center gap-1.5 before:content-["•"] before:text-[#C9A84C]' : ''}`}>
            {children}
        </Link>
    </li>
);

const SitemapPage: React.FC = () => {
    return (
        <div className="bg-[#F4F7FB] py-12 md:py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#8E6D1B] bg-[#FBF6E8] border border-[#C9A84C]/50 px-3 py-1 rounded-full mb-3">
                        Directory
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A]">Sitemap</h1>
                    <p className="mt-3 text-base sm:text-lg text-[#132D52]/80">An overview of our website&apos;s structure.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <div>
                        <Section title="Main Website">
                            <SiteLink to="/">Home</SiteLink>
                            <SiteLink to="/news">News &amp; Announcements</SiteLink>
                            <SiteLink to="/about">About Us</SiteLink>
                            <SiteLink to="/history" sub>History</SiteLink>
                            <SiteLink to="/faculty" sub>Faculty</SiteLink>
                            <SiteLink to="/rules" sub>Rules &amp; Regulations</SiteLink>
                            <SiteLink to="/admissions">Admissions</SiteLink>
                            <SiteLink to="/supplies" sub>School Supplies</SiteLink>
                            <SiteLink to="/student-life">Student Life</SiteLink>
                            <SiteLink to="/ncc" sub>NCC</SiteLink>
                            <SiteLink to="/arts-culture" sub>Arts &amp; Culture</SiteLink>
                            <SiteLink to="/eco-club" sub>Eco Club</SiteLink>
                            <SiteLink to="/campus">Campus</SiteLink>
                            <SiteLink to="/facilities" sub>Facilities</SiteLink>
                            <SiteLink to="/infrastructure" sub>Infrastructure</SiteLink>
                            <SiteLink to="/hostel" sub>Hostel</SiteLink>
                            <SiteLink to="/gallery">Gallery</SiteLink>
                            <SiteLink to="/contact">Contact Us</SiteLink>
                            <SiteLink to="/privacy">Privacy Policy</SiteLink>
                        </Section>
                    </div>

                    <div>
                        <Section title="Portal Access">
                            <SiteLink to="/login">Portal Login</SiteLink>
                            <SiteLink to="/parent-registration">Parent/Student Registration</SiteLink>
                            <SiteLink to="/signup">Staff Registration</SiteLink>
                            <SiteLink to="/forgot-password">Forgot Password</SiteLink>
                        </Section>
                    </div>

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
