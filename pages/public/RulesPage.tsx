import React from 'react';

const RuleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-sky-200 pb-2">{title}</h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
            {children}
        </div>
    </section>
);

const RulesPage: React.FC = () => {
    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-lg">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">Rules & Regulations</h1>
                        <p className="mt-4 text-lg text-slate-600">
                            The following rules are established to guide students towards discipline, respect, and responsibility. Every student is expected to follow them strictly.
                        </p>
                    </div>

                    <RuleSection title="1. School Uniform & Appearance">
                        <p>Students must wear the prescribed school uniform on all school days and official functions.</p>
                        <p>Uniform must be kept neat, clean, and presentable at all times.</p>
                        <div>
                            <h3 className="font-bold text-slate-800">Hair Regulations:</h3>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Boys</strong> must maintain short, neat haircuts. Fancy hairstyles or coloring are not allowed.</li>
                                <li><strong>Girls</strong> must keep their hair properly tied (braided or ponytail) during school hours. Loose hair is not permitted.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Smoking while in school uniform:</h3>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>1st instance</strong> – Fine of ₹300.</li>
                                <li><strong>2nd instance</strong> – Fine of ₹500.</li>
                                <li><strong>3rd instance</strong> – Direct expulsion.</li>
                            </ul>
                        </div>
                    </RuleSection>

                    <RuleSection title="2. Alcohol, Drugs & Intoxication">
                        <p>Possession, use, or intoxication of alcohol, drugs, or any banned substance will result in direct expulsion.</p>
                        <p>Offenders will not be allowed to re-enroll under any circumstances.</p>
                    </RuleSection>

                    <RuleSection title="3. Discipline & Conduct">
                        <p>Fighting, bullying, or use of abusive language is strictly prohibited.</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li><strong>1st instance</strong> – Warning & counseling.</li>
                            <li><strong>2nd instance</strong> – Suspension (3 days).</li>
                            <li><strong>3rd instance</strong> – Expulsion.</li>
                        </ul>
                        <p>Disrespect towards teachers, staff, or peers will invite serious disciplinary action.</p>
                        <p>Any act of vandalism or damage to school property must be paid for, along with additional penalties.</p>
                        <p>Students must maintain decorum inside and outside the campus, as they represent the school.</p>
                    </RuleSection>

                    <RuleSection title="4. Attendance & Truancy">
                        <p>Regular attendance is compulsory.</p>
                        <div>
                            <h3 className="font-bold text-slate-800">Truancy (deliberate absence without valid reason) will result in:</h3>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>1st instance</strong> – Warning & parent notification.</li>
                                <li><strong>2nd instance</strong> – Fine of ₹200.</li>
                                <li><strong>3rd instance</strong> – Suspension.</li>
                            </ul>
                        </div>
                        <p>Students may not leave the school campus during class hours without permission.</p>
                    </RuleSection>

                    <RuleSection title="5. Leave & Absence">
                        <p>Leave in advance will not be entertained.</p>
                        <p>On returning after an absence, the parent/guardian must provide a written explanation on the first day back.</p>
                        <p>Repeated absence without explanation may lead to suspension and affect promotion.</p>
                    </RuleSection>

                    <RuleSection title="6. General Expectations">
                        <ul className="list-disc list-inside space-y-2">
                            <li>Students must be punctual and attend all assemblies, classes, and events on time.</li>
                            <li>Mobile phones, music players, or other electronic devices are prohibited unless permitted by the school.</li>
                            <li>Participation in cultural programs, sports, and school functions is expected.</li>
                            <li>Students should avoid any activity that brings disrepute to the school.</li>
                        </ul>
                    </RuleSection>

                    <RuleSection title="7. Enforcement & Responsibility">
                        <ul className="list-disc list-inside space-y-2">
                            <li>All disciplinary actions will be recorded in the student’s file.</li>
                            <li>Offenders may lose eligibility for examinations, leadership posts, and extracurricular activities.</li>
                            <li>The school reserves the right to update or add rules when necessary.</li>
                        </ul>
                    </RuleSection>

                    <div className="mt-12 p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                        <h3 className="font-bold text-amber-800 text-lg">📌 Final Note for Parents & Guardians:</h3>
                        <p className="mt-2 text-amber-900">
                            Admission to Bethel Mission School implies full acceptance of these rules. Parents are expected to support the school in ensuring discipline and guiding their children.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RulesPage;