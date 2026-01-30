
import React from 'react';
import EditableContent from '../../components/EditableContent';
import { User } from '../../types';

const RuleSection: React.FC<{ title: string; id: string; defaultContent: string; user: User | null }> = ({ title, id, defaultContent, user }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b-2 border-sky-200 pb-2">
            <EditableContent id={`${id}_title`} defaultContent={title} type="text" user={user} />
        </h2>
        <div className="space-y-3 text-slate-700 leading-relaxed">
            <EditableContent id={`${id}_content`} defaultContent={defaultContent} type="textarea" user={user} />
        </div>
    </section>
);

interface RulesPageProps {
    user: User | null;
}

const RulesPage: React.FC<RulesPageProps> = ({ user }) => {
    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-lg">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
                            <EditableContent id="rules_main_title" defaultContent="Rules & Regulations" type="text" user={user} />
                        </h1>
                        <div className="mt-4 text-lg text-slate-600">
                            <EditableContent 
                                id="rules_intro" 
                                defaultContent="The following rules are established to guide students towards discipline, respect, and responsibility. Every student is expected to follow them strictly." 
                                type="textarea" 
                                user={user} 
                            />
                        </div>
                    </div>

                    <RuleSection 
                        title="1. School Uniform & Appearance" 
                        id="rule_1" 
                        user={user}
                        defaultContent={`Students must wear the prescribed school uniform on all school days and official functions.
Uniform must be kept neat, clean, and presentable at all times.

**Hair Regulations:**
• Boys must maintain short, neat haircuts. Fancy hairstyles or coloring are not allowed.
• Girls must keep their hair properly tied (braided or ponytail) during school hours. Loose hair is not permitted.

**Smoking while in school uniform:**
• 1st instance – Fine of ₹300.
• 2nd instance – Fine of ₹500.
• 3rd instance – Direct expulsion.`}
                    />

                    <RuleSection 
                        title="2. Alcohol, Drugs & Intoxication" 
                        id="rule_2" 
                        user={user}
                        defaultContent={`Possession, use, or intoxication of alcohol, drugs, or any banned substance will result in direct expulsion.
Offenders will not be allowed to re-enroll under any circumstances.`}
                    />

                    <RuleSection 
                        title="3. Discipline & Conduct" 
                        id="rule_3" 
                        user={user}
                        defaultContent={`Fighting, bullying, or use of abusive language is strictly prohibited.
• 1st instance – Warning & counseling.
• 2nd instance – Suspension (3 days).
• 3rd instance – Expulsion.

Disrespect towards teachers, staff, or peers will invite serious disciplinary action.
Any act of vandalism or damage to school property must be paid for, along with additional penalties.
Students must maintain decorum inside and outside the campus, as they represent the school.`}
                    />

                    <RuleSection 
                        title="4. Attendance & Truancy" 
                        id="rule_4" 
                        user={user}
                        defaultContent={`Regular attendance is compulsory.

**Truancy (deliberate absence without valid reason) will result in:**
• 1st instance – Warning & parent notification.
• 2nd instance – Fine of ₹200.
• 3rd instance – Suspension.

Students may not leave the school campus during class hours without permission.`}
                    />

                    <RuleSection 
                        title="5. Leave & Absence" 
                        id="rule_5" 
                        user={user}
                        defaultContent={`Leave in advance will not be entertained.
On returning after an absence, the parent/guardian must provide a written explanation on the first day back.
Repeated absence without explanation may lead to suspension and affect promotion.`}
                    />

                    <RuleSection 
                        title="6. General Expectations" 
                        id="rule_6" 
                        user={user}
                        defaultContent={`• Students must be punctual and attend all assemblies, classes, and events on time.
• Mobile phones, music players, or other electronic devices are prohibited unless permitted by the school.
• Participation in cultural programs, sports, and school functions is expected.
• Students should avoid any activity that brings disrepute to the school.`}
                    />

                    <RuleSection 
                        title="7. Enforcement & Responsibility" 
                        id="rule_7" 
                        user={user}
                        defaultContent={`• All disciplinary actions will be recorded in the student’s file.
• Offenders may lose eligibility for examinations, leadership posts, and extracurricular activities.
• The school reserves the right to update or add rules when necessary.`}
                    />

                    <div className="mt-12 p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                        <h3 className="font-bold text-amber-800 text-lg">
                             <EditableContent id="rules_footer_title" defaultContent="📌 Final Note for Parents & Guardians:" type="text" user={user} />
                        </h3>
                        <div className="mt-2 text-amber-900">
                             <EditableContent 
                                id="rules_footer_content" 
                                defaultContent="Admission to Bethel Mission School implies full acceptance of these rules. Parents are expected to support the school in ensuring discipline and guiding their children." 
                                type="textarea" 
                                user={user} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RulesPage;
