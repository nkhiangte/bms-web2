
import React, { useState, FormEvent, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OnlineAdmission, Grade, Gender, BloodGroup } from '../../types';
import { GRADES_LIST, BLOOD_GROUP_LIST, GENDER_LIST } from '../../constants';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, UploadIcon } from '../../components/Icons';
import { resizeImage, uploadToImgBB } from '../../utils';

interface OnlineAdmissionPageProps {
    onOnlineAdmissionSubmit: (data: Omit<OnlineAdmission, 'id' | 'submissionDate' | 'status'>) => Promise<string | null>;
}

type FileUploads = {
    transferCertificate: File | null;
    birthCertificate: File | null;
    reportCard: File | null;
};

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type UploadProgress = Record<keyof FileUploads, UploadStatus>;

const FileUploadField: React.FC<{
    label: string;
    id: keyof FileUploads;
    file: File | null;
    status: UploadStatus;
    onFileChange: (id: keyof FileUploads, file: File | null) => void;
    required?: boolean;
}> = ({ label, id, file, status, onFileChange, required }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="block text-sm font-bold text-slate-800">{label} {required && <span className="text-red-600">*</span>}</label>
            <div className="mt-1 flex items-center gap-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary whitespace-nowrap">
                    <UploadIcon className="w-5 h-5"/> Choose File
                </button>
                <input type="file" ref={fileInputRef} onChange={(e) => onFileChange(id, e.target.files?.[0] || null)} accept="image/jpeg,image/png,image/webp" className="hidden"/>
                {file && <span className="text-sm text-slate-700 truncate">{file.name}</span>}
                {status === 'uploading' && <SpinnerIcon className="w-5 h-5 text-sky-600"/>}
                {status === 'success' && <CheckCircleIcon className="w-5 h-5 text-emerald-600"/>}
                {status === 'error' && <XCircleIcon className="w-5 h-5 text-red-600"/>}
            </div>
        </div>
    );
};


const OnlineAdmissionPage: React.FC<OnlineAdmissionPageProps> = ({ onOnlineAdmissionSubmit }) => {
    const navigate = useNavigate();
    const initialFormState = {
        admissionGrade: Grade.NURSERY, academicYear: '2026-27', studentName: '', dateOfBirth: '', gender: Gender.MALE,
        studentAadhaar: '', fatherName: '', motherName: '', fatherOccupation: '', motherOccupation: '', parentAadhaar: '',
        guardianName: '', guardianRelationship: '', permanentAddress: '', presentAddress: '', contactNumber: '',
        penNumber: '', motherTongue: 'Mizo', isCWSN: 'No' as 'Yes' | 'No', bloodGroup: undefined, email: '', lastSchoolAttended: '', lastDivision: '',
        generalBehaviour: 'Normal' as 'Mild' | 'Normal' | 'Hyperactive', siblingsInSchool: 0, achievements: '', healthIssues: '',
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [fileUploads, setFileUploads] = useState<FileUploads>({ transferCertificate: null, birthCertificate: null, reportCard: null });
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ transferCertificate: 'idle', birthCertificate: 'idle', reportCard: 'idle' });
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    
    // State for Last School Attended logic
    const [isOtherSchool, setIsOtherSchool] = useState(false);
    const [customSchoolInput, setCustomSchoolInput] = useState('');

    const isNursery = formData.admissionGrade === Grade.NURSERY;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) || 0 : value }));
    };
    
    const handleSchoolSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'Others') {
            setIsOtherSchool(true);
            setFormData(prev => ({ ...prev, lastSchoolAttended: customSchoolInput }));
        } else {
            setIsOtherSchool(false);
            setFormData(prev => ({ ...prev, lastSchoolAttended: val }));
        }
    };

    const handleCustomSchoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomSchoolInput(val);
        setFormData(prev => ({ ...prev, lastSchoolAttended: val }));
    };
    
    const handleFileChange = (id: keyof FileUploads, file: File | null) => {
        setFileUploads(prev => ({ ...prev, [id]: file }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            alert("You must agree to the School Rules & Regulations before submitting.");
            return;
        }
        
        if (isNursery) {
            if (!fileUploads.birthCertificate) {
                alert("Please upload the Birth Certificate.");
                return;
            }
        } else {
            if (!fileUploads.birthCertificate || !fileUploads.transferCertificate || !fileUploads.reportCard) {
                alert("Please upload all required documents: Birth Certificate, Transfer Certificate, and Report Card.");
                return;
            }
        }

        setIsSubmitting(true);
        setSubmissionError(null);

        const uploadedFileUrls: Partial<Record<keyof FileUploads, string>> = {};

        try {
            for (const key of Object.keys(fileUploads) as Array<keyof FileUploads>) {
                const file = fileUploads[key];
                if (file) {
                    setUploadProgress(prev => ({ ...prev, [key]: 'uploading' }));
                    const resized = await resizeImage(file, 1024, 1024, 0.8);
                    const url = await uploadToImgBB(resized);
                    uploadedFileUrls[key] = url;
                    setUploadProgress(prev => ({ ...prev, [key]: 'success' }));
                }
            }

            const submissionData = {
                ...formData,
                transferCertificateUrl: uploadedFileUrls.transferCertificate,
                birthCertificateUrl: uploadedFileUrls.birthCertificate,
                reportCardUrl: uploadedFileUrls.reportCard,
            };

            const newAdmissionId = await onOnlineAdmissionSubmit(submissionData);
            if (newAdmissionId) {
                // If admission is for Class IX, do not redirect to payment. Show success message instead.
                if (formData.admissionGrade === Grade.IX) {
                    setSubmissionSuccess(true);
                    window.scrollTo(0, 0);
                } else {
                    navigate(`/admissions/payment/${newAdmissionId}`, { state: { grade: formData.admissionGrade, studentName: formData.studentName, fatherName: formData.fatherName, contact: formData.contactNumber } });
                }
            } else {
                throw new Error("Failed to get admission ID from the server.");
            }

        } catch (error) {
            console.error("Submission failed:", error);
            setSubmissionError("An error occurred during submission. Please check your connection and try again.");
            setUploadProgress(prev => {
                const newProgress = {...prev};
                for (const key in newProgress) {
                    if (newProgress[key as keyof UploadProgress] === 'uploading') {
                        newProgress[key as keyof UploadProgress] = 'error';
                    }
                }
                return newProgress;
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submissionSuccess) {
        return (
            <div className="bg-slate-50 py-16 min-h-screen flex items-center justify-center">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg text-center">
                         <CheckCircleIcon className="w-20 h-20 text-emerald-500 mx-auto mb-4"/>
                         <h1 className="text-3xl font-extrabold text-slate-800">Application Submitted Successfully</h1>
                         <p className="mt-4 text-lg text-slate-600">
                             Thank you for applying to Class IX at Bethel Mission School.
                         </p>
                         <div className="mt-8 bg-sky-50 p-6 rounded-lg border border-sky-100 text-left">
                             <h3 className="font-bold text-sky-800 mb-3 text-lg">Next Steps for Class IX Admission:</h3>
                             <p className="text-sky-800 leading-relaxed mb-4">
                                 Admission to Class IX is reserved on a <strong>merit basis</strong>. Your application is currently <strong>Pending Review</strong>.
                             </p>
                             <ul className="list-disc list-inside text-sky-700 space-y-2">
                                 <li>Our administration will review your academic records and submitted documents.</li>
                                 <li>If your application is approved, you will be notified via your registered contact number.</li>
                                 <li>You will receive a Temporary ID and instructions to complete the admission payment.</li>
                             </ul>
                         </div>
                         <div className="mt-8">
                            <Link to="/" className="btn btn-primary inline-flex">Return to Homepage</Link>
                         </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
                    <div className="text-center mb-8">
                        <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Logo" className="h-24 mx-auto mb-4" />
                        <h1 className="text-3xl font-extrabold text-slate-800">Online Admission Form (Step 1 of 2)</h1>
                        <p className="mt-2 text-lg text-slate-600">Academic Year: 2026–27</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Student's Particulars */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Student's Particulars</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold">Applying for Class <span className="text-red-600">*</span></label><select name="admissionGrade" value={formData.admissionGrade} onChange={handleChange} className="form-select w-full mt-1" required><option value="" disabled>-- Select Class --</option>{GRADES_LIST.filter(g => g !== Grade.X).map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                                <div><label className="block text-sm font-bold">Name (in CAPITAL) <span className="text-red-600">*</span></label><input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="form-input w-full mt-1 uppercase" required/></div>
                                <div><label className="block text-sm font-bold">Date of Birth <span className="text-red-600">*</span></label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-input w-full mt-1" required/></div>
                                <div><label className="block text-sm font-bold">Gender <span className="text-red-600">*</span></label><select name="gender" value={formData.gender} onChange={handleChange} className="form-select w-full mt-1" required>{GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                                <div><label className="block text-sm font-bold">Aadhaar No. <span className="text-red-600">*</span></label><input type="text" name="studentAadhaar" value={formData.studentAadhaar} onChange={handleChange} className="form-input w-full mt-1" required/></div>
                                <div><label className="block text-sm font-bold">PEN No.</label><input type="text" name="penNumber" value={formData.penNumber} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">Mother Tongue</label><input type="text" name="motherTongue" value={formData.motherTongue} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">CWSN?</label><select name="isCWSN" value={formData.isCWSN} onChange={handleChange} className="form-select w-full mt-1"><option value="No">No</option><option value="Yes">Yes</option></select></div>
                                <div><label className="block text-sm font-bold">Blood Group</label><select name="bloodGroup" value={formData.bloodGroup || ''} onChange={handleChange} className="form-select w-full mt-1"><option value="">-- Select --</option>{BLOOD_GROUP_LIST.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                            </div>
                        </fieldset>

                        {/* Parent/Guardian Details */}
                         <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Parent's/Guardian's Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold">Father's Name <span className="text-red-600">*</span></label><input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="form-input w-full mt-1" required/></div>
                                <div><label className="block text-sm font-bold">Mother's Name <span className="text-red-600">*</span></label><input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="form-input w-full mt-1" required/></div>
                                <div><label className="block text-sm font-bold">Father's Occupation</label><input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">Mother's Occupation</label><input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold">Parent's Aadhaar No.</label><input type="text" name="parentAadhaar" value={formData.parentAadhaar} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">Guardian's Name</label><input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">Relationship with Guardian</label><input type="text" name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold">Permanent Address <span className="text-red-600">*</span></label><textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} className="form-textarea w-full mt-1" rows={2} required></textarea></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold">Present Address <span className="text-red-600">*</span></label><textarea name="presentAddress" value={formData.presentAddress} onChange={handleChange} className="form-textarea w-full mt-1" rows={2} required></textarea></div>
                                <div><label className="block text-sm font-bold">Contact No. <span className="text-red-600">*</span></label><input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="form-input w-full mt-1" required/></div>
                                <div><label className="block text-sm font-bold">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input w-full mt-1" /></div>
                            </div>
                         </fieldset>
                         
                         {/* Academic Details */}
                         <fieldset className="space-y-4 border p-4 rounded-lg">
                            <legend className="text-xl font-bold text-slate-800 px-2">Academic & Other Details</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold">Last School Attended <span className="text-red-600">*</span></label>
                                    <select 
                                        value={isOtherSchool ? 'Others' : (formData.lastSchoolAttended === 'Bethel Mission School' ? 'Bethel Mission School' : '')} 
                                        onChange={handleSchoolSelectChange} 
                                        className="form-select w-full mt-1"
                                        required
                                    >
                                        <option value="" disabled>-- Select School --</option>
                                        <option value="Bethel Mission School">Bethel Mission School</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    {isOtherSchool && (
                                        <input 
                                            type="text" 
                                            name="lastSchoolAttended"
                                            placeholder="Enter Name of School" 
                                            value={customSchoolInput} 
                                            onChange={handleCustomSchoolChange} 
                                            className="form-input w-full mt-2" 
                                            required 
                                        />
                                    )}
                                </div>
                                <div><label className="block text-sm font-bold">Division in which he/she passed</label><input type="text" name="lastDivision" value={formData.lastDivision} onChange={handleChange} className="form-input w-full mt-1" /></div>
                                <div><label className="block text-sm font-bold">General Behaviour</label><select name="generalBehaviour" value={formData.generalBehaviour} onChange={handleChange} className="form-select w-full mt-1"><option>Mild</option><option>Normal</option><option>Hyperactive</option></select></div>
                                <div><label className="block text-sm font-bold">Siblings in this school</label><input type="number" name="siblingsInSchool" value={formData.siblingsInSchool} onChange={handleChange} className="form-input w-full mt-1" min="0"/></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold">Achievements (Academics/Extra-curricular)</label><textarea name="achievements" value={formData.achievements} onChange={handleChange} className="form-textarea w-full mt-1" rows={2}></textarea></div>
                                <div className="md:col-span-2"><label className="block text-sm font-bold">Health issues the school should be aware of</label><textarea name="healthIssues" value={formData.healthIssues} onChange={handleChange} className="form-textarea w-full mt-1" rows={2}></textarea></div>
                            </div>
                        </fieldset>
                        
                        {/* Document Upload */}
                        <fieldset className="space-y-4 border p-4 rounded-lg">
                             <legend className="text-xl font-bold text-slate-800 px-2">Document Upload</legend>
                             <p className="text-sm text-slate-600">
                                Please upload clear images (JPG, PNG) of the following documents.
                                {isNursery && <span className="block text-sky-700 font-semibold">For Nursery admission, only the Birth Certificate is required.</span>}
                             </p>
                             <FileUploadField label="Birth Certificate" id="birthCertificate" file={fileUploads.birthCertificate} status={uploadProgress.birthCertificate} onFileChange={handleFileChange} required />
                             <FileUploadField label="Transfer Certificate" id="transferCertificate" file={fileUploads.transferCertificate} status={uploadProgress.transferCertificate} onFileChange={handleFileChange} required={!isNursery} />
                             <FileUploadField label="Previous Progress Report Card" id="reportCard" file={fileUploads.reportCard} status={uploadProgress.reportCard} onFileChange={handleFileChange} required={!isNursery} />
                        </fieldset>

                        {/* Declaration */}
                         <div className="space-y-4">
                            <div className="h-96 overflow-y-auto p-4 border border-slate-300 rounded bg-white text-sm text-slate-700 space-y-4 mb-4 shadow-inner">
                                <h3 className="font-bold text-center text-lg text-slate-800">SCHOOL RULES & REGULATIONS</h3>
                                <h4 className="font-bold text-center text-slate-800">Code of Conduct (Nursery to Class X)</h4>
                                <p className="italic">Admission to the school implies that students and parents/guardians agree to abide by all the rules, regulations, and decisions of the school authorities.</p>

                                <div>
                                    <h5 className="font-bold text-slate-800">1. Academic Integrity & Attendance</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Minimum Attendance:</strong> A minimum of 75% attendance, as prescribed by Board norms, is compulsory for eligibility to appear in final examinations.</li>
                                        <li><strong>Leave of Absence:</strong> Leave must be applied through a written application in the School Diary, duly signed by the parent/guardian.</li>
                                        <li><strong>Medical Leave:</strong> For sick leave exceeding three (3) consecutive days, a valid medical certificate must be submitted.</li>
                                        <li><strong>Punctuality:</strong> School gates will close at 8:30 AM. Latecomers will be warned twice; thereafter, they will be sent home and marked absent.</li>
                                        <li><strong>Class Attendance:</strong> Students must attend all periods, tests, and activities assigned to their class unless officially exempted.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">2. Uniform, Grooming & Decorum</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Uniform:</strong> Students must wear the prescribed school uniform, clean socks, polished shoes, and visible school ID card every working day.</li>
                                        <li><strong>Grooming:</strong>
                                            <ul className="list-circle list-inside pl-4">
                                                <li>Boys must maintain short, neat haircuts.</li>
                                                <li>Girls with long hair must tie or braid it properly.</li>
                                                <li>Nails must be trimmed and clean.</li>
                                            </ul>
                                        </li>
                                        <li><strong>Prohibited Appearance:</strong> Use of makeup, hair coloring, nail polish, jewelry (except small studs for girls), smartwatches, or expensive accessories is strictly prohibited.</li>
                                        <li><strong>Non-compliance:</strong> Repeated violation of uniform or grooming rules may result in disciplinary action.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">3. Mobile Phones & Electronic Devices</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Strict Prohibition:</strong> Students are not allowed to bring mobile phones, smart devices, cameras, earbuds, or electronic gadgets to school.</li>
                                        <li><strong>Confiscation Policy:</strong> Any confiscated device will be returned only to the parent/guardian, and may be retained until the end of the term.</li>
                                        <li><strong>School Liability:</strong> The school bears no responsibility for loss or damage of prohibited items.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">4. Fee Policy</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Due Date:</strong> School fees must be paid on or before the 10th of every month/quarter, as applicable.</li>
                                        <li><strong>Late Fee:</strong> A fine of ₹50 per day will be charged after the due date.</li>
                                        <li><strong>Non-Payment:</strong> Non-payment of fees for two consecutive months may result in the student’s name being struck off the school rolls.</li>
                                        <li><strong>Fee Refund:</strong> Fees once paid are non-refundable and non-transferable.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">5. Discipline, Behaviour & Moral Conduct</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Respect & Courtesy:</strong> Students must show respect to teachers, staff, school authorities, and fellow students at all times.</li>
                                        <li><strong>Classroom Discipline:</strong> Silence and order must be maintained during classes, assemblies, examinations, and school programs.</li>
                                        <li><strong>Prohibited Behaviour:</strong> Use of abusive language or gestures, disobedience or defiance of authority, and indecent, immoral, or disruptive behavior.</li>
                                        <li><strong>Disciplinary Action:</strong> Such acts may lead to detention, suspension, or expulsion depending on severity.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">6. Safety, Anti-Bullying & Anti-Ragging</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Zero Tolerance Policy:</strong> Bullying, ragging, intimidation, physical violence, or harassment of any kind is strictly prohibited.</li>
                                        <li><strong>Serious Consequences:</strong> Such actions may result in immediate suspension or expulsion.</li>
                                        <li><strong>Property Damage:</strong> Any damage to school property (furniture, laboratories, library books, buses, etc.) must be compensated by the parent along with a penalty.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">7. Child Protection & POCSO Compliance</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Child Safety:</strong> The school strictly follows the Protection of Children from Sexual Offences (POCSO) Act, 2012.</li>
                                        <li><strong>Mandatory Reporting:</strong> Any form of physical, emotional, or sexual abuse will be reported to the appropriate legal authorities.</li>
                                        <li><strong>Student Support:</strong> Students are encouraged to report any discomfort or inappropriate behavior without fear.</li>
                                        <li><strong>False Complaints:</strong> Proven false or malicious allegations will invite disciplinary action.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">8. Health, Hygiene & Well-being</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Personal Hygiene:</strong> Students must maintain cleanliness in person, uniform, and habits.</li>
                                        <li><strong>Medical Information:</strong> Parents must inform the school of any medical condition, allergy, or chronic illness at the time of admission.</li>
                                        <li><strong>Communicable Diseases:</strong> Students suffering from infectious diseases must not attend school until medically cleared.</li>
                                        <li><strong>Food Policy:</strong> Students should bring healthy, home-prepared food. Junk food, carbonated drinks, and packaged fast food are discouraged.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">9. Transportation Rules (If Applicable)</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Bus Discipline:</strong> Students must remain seated, behave responsibly, and follow instructions of the bus staff.</li>
                                        <li><strong>Safety:</strong> Standing, shouting, or distracting the driver is strictly prohibited.</li>
                                        <li><strong>Misconduct:</strong> Repeated misbehavior may lead to withdrawal of transport facility without refund.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">10. Examination & Assessment</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Unfair Means:</strong> Any student found cheating or using unfair means will receive zero marks in that subject and may be barred from further examinations.</li>
                                        <li><strong>Absenteeism:</strong> No re-test will be conducted for missed exams except in serious medical emergencies verified by the school.</li>
                                        <li><strong>Promotion Policy:</strong> Promotion is based on overall annual performance, including internal assessments and examinations.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">11. Library & Laboratory Rules</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Library Books:</strong> Lost or damaged books must be replaced or paid for at double the current market price.</li>
                                        <li><strong>Lab Safety:</strong> Students must strictly follow safety instructions in Science and Computer Labs.</li>
                                        <li><strong>Equipment Damage:</strong> Any damage due to negligence will be charged to parents.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">12. Campus Conduct & Social Media Policy</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Language Policy:</strong> English shall be the primary language of communication within the school campus, except during language classes.</li>
                                        <li><strong>Social Media Conduct:</strong> Posting photos/videos in school uniform or using the school’s name/logo in a defamatory manner is prohibited. Cyberbullying of students or staff will result in immediate disciplinary action, including expulsion.</li>
                                        <li><strong>Prohibited Items:</strong> Sharp objects, lighters, chemical sprays, tobacco products, vapes, or intoxicants are strictly forbidden. Bags may be inspected when required.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">13. Extracurricular Activities & School Events</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Participation:</strong> Attendance in assemblies, national programs, cultural events, and sports activities is compulsory unless medically exempted.</li>
                                        <li><strong>School Representation:</strong> Students representing the school must uphold discipline and decorum at all times.</li>
                                        <li><strong>Permission:</strong> Participation in external events in school uniform requires written permission from the Principal.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">14. Environmental Responsibility</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Clean Campus:</strong> Littering is strictly prohibited. Students must use dustbins.</li>
                                        <li><strong>Eco-Friendly Practices:</strong> Wastage of water, electricity, or damage to plants is not permitted.</li>
                                        <li><strong>Plastic-Free Initiative:</strong> Use of single-use plastic items is discouraged.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">15. Personal Belongings</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>School Liability:</strong> The school is not responsible for loss of valuables.</li>
                                        <li><strong>Labeling:</strong> All personal belongings must be clearly labeled with the student’s name and class.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">16. Withdrawal & Transfer Certificate (TC)</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Notice Period:</strong> A written withdrawal notice must be submitted at least one month or one full quarter in advance.</li>
                                        <li><strong>No-Dues Clearance:</strong> TC and Report Cards will be issued only after all dues are cleared.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800">17. Authority & Amendments</h5>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li><strong>Right to Amend:</strong> The school management reserves the right to modify rules without prior notice.</li>
                                        <li><strong>Final Authority:</strong> The Principal’s decision shall be final and binding in all matters.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800 mt-4 border-t pt-2">STUDENT & PARENT UNDERTAKING</h5>
                                    <p>We hereby declare that:</p>
                                    <ul className="list-disc list-inside pl-2 space-y-1">
                                        <li>We have carefully read and understood all the School Rules & Regulations.</li>
                                        <li>We agree to abide by all rules, policies, and disciplinary actions of the school.</li>
                                        <li>We understand that violation of rules may result in disciplinary action, including suspension or expulsion.</li>
                                        <li>We accept responsibility for the conduct, behavior, and academic performance of the student.</li>
                                        <li>We agree to cooperate with the school authorities in the best interest of the child and the institution.</li>
                                    </ul>
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"/>
                                <span className="font-semibold text-slate-800">I have read, understood, and agree to abide by the School Rules & Regulations and Code of Conduct.</span>
                            </label>
                        </div>
                        
                        {submissionError && (
                             <p className="text-red-600 font-bold text-center">{submissionError}</p>
                        )}
                        
                        <div className="pt-4 flex justify-end">
                            <button type="submit" disabled={!agreed || isSubmitting} className="btn btn-primary !text-lg !font-bold !px-8 !py-3 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                {isSubmitting ? <SpinnerIcon className="w-6 h-6"/> : null}
                                {isSubmitting ? 'Submitting...' : 'Proceed'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default OnlineAdmissionPage;
