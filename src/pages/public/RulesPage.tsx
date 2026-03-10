import React from 'react';
import EditableContent from '@/components/EditableContent';
import { User } from '@/types';

const RuleSection: React.FC<{ title: string; id: string; defaultContent: string; user: User | null }> = ({ title, id, defaultContent, user }) => (
    <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 border-b-2 border-sky-800 pb-2">
            <EditableContent id={`${id}_title`} defaultContent={title} type="text" user={user} />
        </h2>
        <div className="space-y-3 text-slate-300 leading-relaxed">
            <EditableContent id={`${id}_content`} defaultContent={defaultContent} type="textarea" user={user} />
        </div>
    </section>
);

interface RulesPageProps { user: User | null; }

const RulesPage: React.FC<RulesPageProps> = ({ user }) => {
    return (
        <div className="bg-black py-16 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-lg shadow-2xl">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                            <EditableContent id="rules_main_title" defaultContent="Rules & Regulations" type="text" user={user} />
                        </h1>
                        <div className="mt-4 text-lg text-slate-400">
                            <EditableContent id="rules_intro" defaultContent="The following rules are established to guide students towards discipline, respect, and responsibility. Every student is expected to follow them strictly." type="textarea" user={user} />
                        </div>
                    </div>

                    <RuleSection title="1. School Uniform & Appearance" id="rule_1" user={user}
                        defaultContent={`Students must wear the prescribed school uniform on all school days and official functions.\nUniform must be kept neat, clean, and presentable at all times.\n\n**Hair Regulations:**\n• Boys must maintain short, neat haircuts. Fancy hairstyles or coloring are not allowed.\n• Girls must keep their hair properly tied (braided or ponytail) during school hours.\n\n**Smoking while in school uniform:**\n• 1st instance – Fine of ₹300.\n• 2nd instance – Fine of ₹500.\n• 3rd instance – Direct expulsion.`}
                    />
                    <RuleSection title="2. Alcohol, Drugs & Intoxication" id="rule_2" user={user}
                        defaultContent="Possession, use, or intoxication of alcohol, drugs, or any banned substance will result in direct expulsion.\nOffenders will not be allowed to re-enroll under any circumstances."
                    />
                    <RuleSection title="3. Discipline & Conduct" id="rule_3" user={user}
                        defaultContent={`Fighting, bullying, or use of abusive language is strictly prohibited.\n• 1st instance – Warning & counseling.\n• 2nd instance – Suspension (3 days).\n• 3rd instance – Expulsion.\n\nDisrespect towards teachers, staff, or peers will invite serious disciplinary action.\nAny act of vandalism or damage to school property must be paid for, along with additional penalties.`}
                    />
                    <RuleSection title="4. Attendance & Truancy" id="rule_4" user={user}
                        defaultContent={`Regular attendance is compulsory.\n\n**Truancy will result in:**\n• 1st instance – Warning & parent notification.\n• 2nd instance – Fine of ₹200.\n• 3rd instance – Suspension.\n\nStudents may not leave the school campus during class hours without permission.`}
                    />
                    <RuleSection title="5. Leave & Absence" id="rule_5" user={user}
                        defaultContent="Leave in advance will not be entertained.\nOn returning after an absence, the parent/guardian must provide a written explanation on the first day back.\nRepeated absence without explanation may lead to suspension and affect promotion."
                    />
                    <RuleSection title="6. General Expectations" id="rule_6" user={user}
                        defaultContent={`• Students must be punctual and attend all assemblies, classes, and events on time.\n• Mobile phones, music players, or other electronic devices are prohibited unless permitted by the school.\n• Participation in cultural programs, sports, and school functions is expected.\n• Students should avoid any activity that brings disrepute to the school.`}
                    />
                    <RuleSection title="7. Enforcement & Responsibility" id="rule_7" user={user}
                        defaultContent={`• All disciplinary actions will be recorded in the student's file.\n• Offenders may lose eligibility for examinations, leadership posts, and extracurricular activities.\n• The school reserves the right to update or add rules when necessary.`}
                    />

                    <div className="mt-12 p-6 bg-amber-950/30 border-l-4 border-amber-500 rounded-r-lg">
                        <h3 className="font-bold text-amber-300 text-lg">
                            <EditableContent id="rules_footer_title" defaultContent="📌 Final Note for Parents & Guardians:" type="text" user={user} />
                        </h3>
                        <div className="mt-2 text-amber-200/80">
                            <EditableContent id="rules_footer_content" defaultContent="Admission to Bethel Mission School implies full acceptance of these rules. Parents are expected to support the school in ensuring discipline and guiding their children." type="textarea" user={user} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RulesPage;
