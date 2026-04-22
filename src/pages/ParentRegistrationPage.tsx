
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { auth, db, firebase } from '@/firebaseConfig';
import { 
    UserIcon, MailIcon, PhoneIcon, HomeIcon, LockClosedIcon, 
    CheckCircleIcon, BackIcon, SpinnerIcon, PlusIcon, TrashIcon
} from '@/components/Icons';
import { StudentClaim } from '@/types';

const { useNavigate, Link } = ReactRouterDOM as any;

const RELATIONSHIPS = ['Mother', 'Father', 'Legal Guardian', 'Grandparent', 'Other'];
const LANGUAGES = ['English', 'Mizo', 'Hindi', 'Other'];
const SECURITY_QUESTIONS = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What is the name of the street you grew up on?",
    "What was your favorite food as a child?"
];

const ParentRegistrationPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Auth States
    const [otp, setOtp] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1
        fullName: '',
        relationship: 'Mother',
        contactNumber: '',
        email: '',
        optionalPassword: '',
        address: '',
        city: '',
        state: 'Mizoram',
        zip: '',
        language: 'English',
        
        // Step 2
        securityQuestion: SECURITY_QUESTIONS[0],
        securityAnswer: '',
        comms_sms: true,
        comms_email: true,
        comms_push: false,

        // Step 3
        students: [
            { fullName: '', dob: '', studentId: '', relationship: 'Mother' }
        ] as StudentClaim[],

        // Step 4
        agreeTerms: false,
        agreePrivacy: false,
        agreeIdentity: false,
        agreePhoto: false
    });

    // Check if user is already authenticated with Phone
    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && user.phoneNumber) {
                setIsPhoneVerified(true);
                updateFormData('contactNumber', user.phoneNumber);
            }
        });
        return () => unsubscribe();
    }, []);

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateStudentData = (index: number, field: keyof StudentClaim, value: string) => {
        const newStudents = [...formData.students];
        newStudents[index] = { ...newStudents[index], [field]: value };
        setFormData(prev => ({ ...prev, students: newStudents }));
    };

    const addStudent = () => {
        setFormData(prev => ({
            ...prev,
            students: [...prev.students, { fullName: '', dob: '', studentId: '', relationship: formData.relationship }]
        }));
    };

    const removeStudent = (index: number) => {
        if (formData.students.length > 1) {
            setFormData(prev => ({
                ...prev,
                students: prev.students.filter((_, i) => i !== index)
            }));
        }
    };

    // OTP Send Handler
    const handleSendOtp = async () => {
        if (!formData.contactNumber || formData.contactNumber.length < 10) {
            alert("Please enter a valid 10-digit mobile number in Step 1.");
            return;
        }

        setVerifyLoading(true);
        try {
            // Cross-verify with students database
            const cleanPhone = (phone: string) => phone.replace(/\D/g, '');
            const phoneSuffix = cleanPhone(formData.contactNumber).slice(-10);
            
            const studentsSnapshot = await db.collection('students').get();
            let isVerifiedBySchool = false;
            
            for (const doc of studentsSnapshot.docs) {
                const s = doc.data();
                const studentContactSuffix = cleanPhone(s.contact || s.contactNumber || '').slice(-10);
                if (studentContactSuffix.length === 10 && studentContactSuffix === phoneSuffix) {
                    isVerifiedBySchool = true;
                    break;
                }
            }

            if (!isVerifiedBySchool) {
                alert("This mobile number is not found in the school's student database. Please enter the number registered with the school or contact administration.");
                setVerifyLoading(false);
                return;
            }

            if (!(window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier = new (window as any).firebase.auth.RecaptchaVerifier('recaptcha-container-reg', {
                    size: 'invisible'
                });
            }
            
            const formattedPhone = formData.contactNumber.startsWith('+') ? formData.contactNumber : `+91${formData.contactNumber}`;
            const appVerifier = (window as any).recaptchaVerifier;
            const confirmationResult = await auth.signInWithPhoneNumber(formattedPhone, appVerifier);
            
            (window as any).confirmationResultReg = confirmationResult;
            setShowOtpInput(true);
            alert(`OTP sent to ${formattedPhone}`);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to send OTP. Please check the phone number.');
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
            }
        } finally {
            setVerifyLoading(false);
        }
    };

    // OTP Verify Handler
    const handleVerifyOtp = async () => {
        if (!(window as any).confirmationResultReg) return;
        
        setVerifyLoading(true);
        try {
            await (window as any).confirmationResultReg.confirm(otp);
            setIsPhoneVerified(true);
            alert("Mobile Number successfully verified.");
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Invalid OTP. Please try again.');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleNext = () => {
        // Basic validation logic per step
        if (step === 1) {
            if (!formData.fullName || !formData.contactNumber || !formData.address) {
                alert("Please fill in all required fields.");
                return;
            }
        }
        if (step === 2) {
            if (!isPhoneVerified) {
                alert("Please verify your mobile number with OTP to continue.");
                return;
            }
            if (!formData.securityAnswer) {
                alert("Please answer the security question.");
                return;
            }
        }
        if (step === 3) {
            for (const s of formData.students) {
                if (!s.fullName || !s.dob || !s.studentId) {
                    alert("Please complete all student information fields.");
                    return;
                }
            }
        }

        setStep(prev => prev + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.agreeTerms || !formData.agreePrivacy || !formData.agreeIdentity) {
            alert("You must agree to the mandatory terms to proceed.");
            return;
        }

        setIsSubmitting(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User authentication failed. Please verify your mobile number again.");
            }

            // 2. Update Profile Name
            await user.updateProfile({ displayName: formData.fullName });

            // Link email/password if provided
            if (formData.email && formData.optionalPassword) {
                try {
                    const credential = firebase.auth.EmailAuthProvider.credential(formData.email, formData.optionalPassword);
                    await user.linkWithCredential(credential);
                } catch (linkError: any) {
                    // Ignore error if already linked to same credential, or show warning
                    console.warn('Could not link credential:', linkError);
                    alert(`Note: We could not set up the Email fallback login (Error: ${linkError.message}). Your phone login is still valid.`);
                }
            }

            // 3. Save detailed record to Firestore
            await db.collection('users').doc(user.uid).set({
                displayName: formData.fullName,
                email: formData.email, // Can be empty now
                phone: formData.contactNumber,
                role: 'pending_parent',
                    claimedStudents: formData.students, // New structure for array of students
                    registrationDetails: {
                        fullName: formData.fullName,
                        relationship: formData.relationship,
                        contactNumber: formData.contactNumber,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        zip: formData.zip,
                        language: formData.language,
                        communicationPreferences: {
                            sms: formData.comms_sms,
                            email: formData.comms_email,
                            push: formData.comms_push
                        },
                        securityQuestion: formData.securityQuestion,
                        securityAnswer: formData.securityAnswer,
                        agreements: {
                            terms: formData.agreeTerms,
                            privacy: formData.agreePrivacy,
                            identity: formData.agreeIdentity,
                            photoRelease: formData.agreePhoto
                        }
                    },
                    createdAt: new Date().toISOString()
                });

                alert("Account created successfully! Please wait for admin approval. You will be notified once your account is active.");
                navigate('/login');
        } catch (error: any) {
            console.error("Registration Error:", error);
            alert(`Registration failed: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex justify-between items-center mb-8">
            {[1, 2, 3, 4].map(num => (
                <div key={num} className="flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                        step >= num ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                        {step > num ? <CheckCircleIcon className="w-5 h-5" /> : num}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${step >= num ? 'text-sky-700' : 'text-slate-400'}`}>
                        {num === 1 && 'Info'}
                        {num === 2 && 'Security'}
                        {num === 3 && 'Students'}
                        {num === 4 && 'Consent'}
                    </span>
                </div>
            ))}
            {/* Progress Bar Background */}
            <div className="absolute top-4 left-0 w-full h-1 bg-slate-200 -z-0"></div>
            {/* Active Progress Bar */}
            <div 
                className="absolute top-4 left-0 h-1 bg-sky-600 -z-0 transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <img src="https://i.ibb.co/v40h3B0K/BMS-Logo-Color.png" alt="Logo" className="h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-extrabold text-slate-900">Parent Portal Registration</h1>
                    <p className="mt-2 text-slate-600">Create an account to track your child's progress</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 relative">
                    {renderStepIndicator()}

                    <form onSubmit={handleSubmit}>
                        {/* STEP 1: Core Info */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Parent/Guardian Information</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700">Full Legal Name</label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <UserIcon className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input type="text" value={formData.fullName} onChange={e => updateFormData('fullName', e.target.value)} className="pl-10 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="John Doe" />
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700">Relationship to Student</label>
                                        <select value={formData.relationship} onChange={e => updateFormData('relationship', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500">
                                            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700">Mobile Number</label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <PhoneIcon className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <input type="tel" value={formData.contactNumber} onChange={e => updateFormData('contactNumber', e.target.value)} className="pl-10 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="+91 9876543210" />
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700">Home Address</label>
                                        <div className="mt-1 relative">
                                             <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                                                <HomeIcon className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <textarea rows={2} value={formData.address} onChange={e => updateFormData('address', e.target.value)} className="pl-10 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Street Address" />
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700">City / Town</label>
                                        <input type="text" value={formData.city} onChange={e => updateFormData('city', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Champhai" />
                                    </div>
                                    
                                     <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700">Preferred Language</label>
                                        <select value={formData.language} onChange={e => updateFormData('language', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500">
                                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Security */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Verify Mobile Number & Security</h2>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700">Mobile Verification</label>
                                        
                                        {!isPhoneVerified ? (
                                            <div className="mt-2 border rounded-lg p-4 bg-slate-50 border-slate-200">
                                                <p className="text-sm font-medium text-slate-700 mb-2">We will verify your mobile number: <strong>{formData.contactNumber}</strong></p>
                                                {!showOtpInput ? (
                                                    <>
                                                        <div id="recaptcha-container-reg"></div>
                                                        <button 
                                                            type="button" 
                                                            className="w-full btn btn-primary text-sm py-2"
                                                            onClick={handleSendOtp}
                                                            disabled={verifyLoading}
                                                        >
                                                            {verifyLoading ? "Sending OTP..." : "Get OTP"}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <input 
                                                            type="text" 
                                                            className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 font-mono text-center tracking-widest" 
                                                            placeholder="6-digit OTP" 
                                                            maxLength={6}
                                                            value={otp}
                                                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                                        />
                                                        <button 
                                                            type="button" 
                                                            className="w-full btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-sm py-2"
                                                            onClick={handleVerifyOtp}
                                                            disabled={verifyLoading || otp.length < 6}
                                                        >
                                                            {verifyLoading ? "Verifying..." : "Verify OTP"}
                                                        </button>
                                                        <p className="text-xs text-center text-slate-500 mt-2">
                                                            <button type="button" className="text-sky-600 hover:underline" onClick={() => { setShowOtpInput(false); setOtp(''); }}>Resend OTP / Change Number</button>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-2 border rounded-lg p-4 bg-emerald-50 border-emerald-200 flex items-center gap-3">
                                                <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-800">Verified</p>
                                                    <p className="text-xs text-emerald-600">{formData.contactNumber}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700">Security Question</label>
                                        <select value={formData.securityQuestion} onChange={e => updateFormData('securityQuestion', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500">
                                            {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-semibold text-slate-700">Answer</label>
                                        <input type="text" value={formData.securityAnswer} onChange={e => updateFormData('securityAnswer', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Your account recovery answer..." />
                                    </div>
                                </div>

                                <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
                                    <h3 className="font-semibold text-sky-800 mb-2">Optional Fallback Login</h3>
                                    <p className="text-xs text-sky-700 mb-3">If you ever lose access to your phone or clear your browser cache, you can log in using an Email and Password. Highly recommended.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700">Email Address (Optional)</label>
                                            <input type="email" value={formData.email} onChange={e => updateFormData('email', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="parent@example.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700">Password (Optional)</label>
                                            <input type="password" value={formData.optionalPassword} onChange={e => updateFormData('optionalPassword', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" placeholder="Leave empty if not using" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg border">
                                    <h3 className="font-semibold text-slate-800 mb-3">Communication Preferences</h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={formData.comms_sms} onChange={e => updateFormData('comms_sms', e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 rounded border-slate-300" />
                                            <span className="text-slate-700">SMS Alerts (Absences, Emergencies)</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={formData.comms_email} onChange={e => updateFormData('comms_email', e.target.checked)} className="form-checkbox h-5 w-5 text-sky-600 rounded border-slate-300" />
                                            <span className="text-slate-700">Email Notifications (Newsletters, Grades)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Student Linking */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Link Student Accounts</h2>
                                <p className="text-sm text-slate-600 bg-sky-50 p-3 rounded border border-sky-100">
                                    <span className="font-bold">Important:</span> You must provide the correct Student ID found on your child's report card or ID card to link accounts successfully.
                                </p>

                                {formData.students.map((student, index) => (
                                    <div key={index} className="bg-slate-50 p-5 rounded-lg border border-slate-200 relative">
                                        {index > 0 && (
                                            <button type="button" onClick={() => removeStudent(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 p-1 rounded-full" title="Remove Student">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        <h3 className="font-bold text-slate-700 mb-4">Student {index + 1}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                                <input type="text" value={student.fullName} onChange={e => updateStudentData(index, 'fullName', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-sm" placeholder="As per school records" />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Student ID Number</label>
                                                <input type="text" value={student.studentId} onChange={e => updateStudentData(index, 'studentId', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-sm" placeholder="e.g. BMS240101" />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                                                <input type="date" value={student.dob} onChange={e => updateStudentData(index, 'dob', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-sm" />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-bold text-slate-500 uppercase">Relationship</label>
                                                <select value={student.relationship} onChange={e => updateStudentData(index, 'relationship', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-sm">
                                                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button type="button" onClick={addStudent} className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold text-sm">
                                    <PlusIcon className="w-5 h-5" /> Add Another Student
                                </button>
                            </div>
                        )}

                        {/* STEP 4: Agreements */}
                        {step === 4 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Agreements & Consent</h2>
                                
                                <div className="space-y-4">
                                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded hover:bg-slate-50">
                                        <input type="checkbox" checked={formData.agreeTerms} onChange={e => updateFormData('agreeTerms', e.target.checked)} className="mt-1 form-checkbox h-5 w-5 text-sky-600 rounded border-slate-300" />
                                        <span className="text-sm text-slate-700">I agree to the <span className="text-sky-600 underline">Terms of Service</span> and <span className="text-sky-600 underline">Acceptable Use Policy</span> for the school portal.</span>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded hover:bg-slate-50">
                                        <input type="checkbox" checked={formData.agreePrivacy} onChange={e => updateFormData('agreePrivacy', e.target.checked)} className="mt-1 form-checkbox h-5 w-5 text-sky-600 rounded border-slate-300" />
                                        <span className="text-sm text-slate-700">I acknowledge the <span className="text-sky-600 underline">Privacy Policy</span> regarding how my data and my child's data is handled.</span>
                                    </label>

                                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded hover:bg-slate-50 bg-amber-50 border border-amber-200">
                                        <input type="checkbox" checked={formData.agreeIdentity} onChange={e => updateFormData('agreeIdentity', e.target.checked)} className="mt-1 form-checkbox h-5 w-5 text-amber-600 rounded border-slate-300" />
                                        <span className="text-sm text-amber-900 font-semibold">I affirm that I am the legal parent or guardian of the student(s) listed. I understand that misrepresenting my identity is prohibited and will result in account suspension.</span>
                                    </label>

                                    <hr className="border-slate-200" />

                                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded hover:bg-slate-50">
                                        <input type="checkbox" checked={formData.agreePhoto} onChange={e => updateFormData('agreePhoto', e.target.checked)} className="mt-1 form-checkbox h-5 w-5 text-sky-600 rounded border-slate-300" />
                                        <span className="text-sm text-slate-700">(Optional) I consent to the use of my child's photo for school directory and internal portal identification.</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-10 flex justify-between pt-6 border-t border-slate-100">
                            {step > 1 ? (
                                <button type="button" onClick={() => setStep(prev => prev - 1)} className="btn btn-secondary">
                                    <BackIcon className="w-5 h-5" /> Back
                                </button>
                            ) : (
                                <button type="button" onClick={() => { if(auth.currentUser) { auth.signOut().then(() => navigate('/login')) } else { navigate('/login') } }} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1">
                                    Cancel
                                </button>
                            )}
                            
                            {step < 4 ? (
                                <button type="button" onClick={handleNext} className="btn btn-primary ml-auto">
                                    Next Step
                                </button>
                            ) : (
                                <button type="submit" className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 ml-auto" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <SpinnerIcon className="w-5 h-5"/> Creating Account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ParentRegistrationPage;
