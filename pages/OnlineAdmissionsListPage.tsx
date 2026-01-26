
                                        {app.status === 'approved' && app.isEnrolled && (
                                            <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
                                                <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                                                    <CheckCircleIcon className="w-5 h-5"/> Student Enrolled
                                                </h4>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    This student has been added to the <strong>{app.admissionGrade}</strong> class list.
                                                </p>
                                                {app.temporaryStudentId && (
                                                    <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                                                        Student ID: {app.temporaryStudentId}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {app.status === 'approved' && !app.isEnrolled && app.temporaryStudentId && (
                                            <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
                                                <h4 className="font-bold text-emerald-800">Temporary Student ID Generated</h4>
                                                <p className="font-mono text-lg font-bold text-slate-800 bg-white inline-block px-3 py-1 rounded mt-1">
                                                    {app.temporaryStudentId}
                                                </p>
                                                <p className="text-xs text-slate-600 mt-1">Please provide this ID to the parent/guardian to complete payment.</p>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 -mx-6 -mb-6 p-6">
                                            <label className="font-bold text-slate-800">Update Application Status:</label>
                                            <div className="flex items-center gap-2">
                                                {updatingStatus[app.id] ? <SpinnerIcon className="w-5 h-5"/> : (
                                                    <select 
                                                        value={app.status} 
                                                        onChange={e => handleStatusChange(app.id, e.target.value as any)} 
                                                        disabled={app.isEnrolled}
                                                        className="form-select border-slate-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-200 disabled:text-slate-500"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="reviewed">Reviewed</option>
                                                        <option value="approved">Approved (Enroll)</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 italic">
                                                {app.isEnrolled ? "Student is already enrolled." : "Approving will automatically enroll the student into the class."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <p className="text-center py-10 text-slate-600 border-2 border-dashed rounded-lg">No applications match the current filters.</p>
                    )}
                </div>
            </div>
            {lightboxImage && <Lightbox src={lightboxImage.src} alt={lightboxImage.alt} onClose={() => setLightboxImage(null)} />}
        </>
    );
};

export default OnlineAdmissionsListPage;
