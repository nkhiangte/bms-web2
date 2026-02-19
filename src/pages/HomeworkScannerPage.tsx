import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Corrected import to use GoogleGenAI from @google/genai.
import { GoogleGenAI } from "@google/genai";
import { BackIcon, HomeIcon, SparklesIcon, SpinnerIcon, XIcon, CameraIcon, UploadIcon } from '../components/Icons';

const { Link, useNavigate } = ReactRouterDOM as any;

type ScanType = 'grammar' | 'math' | 'handwriting';

const HomeworkScannerPage: React.FC = () => {
    const navigate = useNavigate();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [scanType, setScanType] = useState<ScanType>('grammar');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const cleanupCamera = useCallback(() => {
        setIsCameraOpen(false);
    }, []);

    useEffect(() => {
        if (isCameraOpen) {
            const startStream = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        await videoRef.current.play();
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Could not access camera. Please ensure permissions are granted and try again.");
                    setIsCameraOpen(false);
                }
            };
            startStream();
        }

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [isCameraOpen]);
    
    const handleStartCamera = () => {
        setAnalysisResult(null);
        setError(null);
        setImageSrc(null);
        setImageFile(null);
        setIsCameraOpen(true);
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            const dataUrl = canvas.toDataURL('image/jpeg');
            setImageSrc(dataUrl);

            canvas.toBlob(blob => {
                if (blob) {
                    setImageFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
                }
            }, 'image/jpeg');

            cleanupCamera();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        cleanupCamera();
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result as string);
            };
            reader.readAsDataURL(file);
            setAnalysisResult(null);
            setError(null);
        }
    };
    
    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };

    const getPromptForType = (type: ScanType): string => {
        switch (type) {
            case 'grammar':
                return "Analyze the attached image of handwritten text. Identify and list any spelling and grammar mistakes in a markdown list. For each mistake, provide the original text and the correction. If there are no mistakes, respond with 'No mistakes found.'";
            case 'math':
                return "Analyze the attached image of a handwritten math problem and its solution. Verify the steps and the final answer. Provide a step-by-step explanation of the correct solution and point out any errors in the provided work. State clearly if the final answer is correct or incorrect. Format the response using markdown.";
            case 'handwriting':
                return "Analyze the handwriting in the attached image. Provide a qualitative assessment of its legibility and neatness. Your assessment should be one of: 'Excellent', 'Good', 'Readable but could be neater', or 'Needs Improvement'. Then, provide a short paragraph with two specific suggestions for improvement. Format the response using markdown.";
            default:
                return "Analyze this image.";
        }
    };

    const handleScan = async () => {
        if (!imageFile) {
            setError("Please upload or capture an image first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            // FIX: Corrected Gemini API initialization to use a named parameter for apiKey.
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const imagePart = await fileToGenerativePart(imageFile);
            const textPart = { text: getPromptForType(scanType) };
            
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview', 
                contents: { parts: [imagePart, textPart] },
            });

            // FIX: Updated to access generated text via the .text property rather than calling it as a method.
            setAnalysisResult(response.text ?? 'No response from AI.');
        } catch (err) {
            console.error("Gemini API error:", err);
            setError("Failed to get analysis from AI. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setImageSrc(null);
        setImageFile(null);
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
        cleanupCamera();
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-800"><BackIcon className="w-5 h-5" /> Back</button>
                <Link to="/portal/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800" title="Go to Home"><HomeIcon className="w-5 h-5" /> Home</Link>
            </div>
             <div className="flex items-center gap-3 mb-6">
                <SparklesIcon className="w-10 h-10 text-violet-600"/>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">AI Homework Scanner</h1>
                    <p className="text-slate-600 mt-1">Get instant feedback on homework assignments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 mb-2">1. Upload or Capture Homework Image</h3>
                             <div className="flex gap-4">
                                <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary w-full"><UploadIcon className="w-5 h-5"/> Upload File</button>
                                <button onClick={handleStartCamera} className="btn btn-secondary w-full"><CameraIcon className="w-5 h-5"/> Use Camera</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>
                        </div>
                        
                        {(imageSrc || isCameraOpen) && (
                            <div className="relative p-2 border-2 border-dashed rounded-lg bg-slate-50">
                                {isCameraOpen && <video ref={videoRef} className="w-full h-auto rounded-md" playsInline></video>}
                                {imageSrc && !isCameraOpen && <img src={imageSrc} alt="Homework preview" className="w-full h-auto rounded-md" />}
                                <button onClick={handleReset} className="absolute top-2 right-2 p-1.5 bg-white/70 text-slate-800 rounded-full hover:bg-white shadow-md"><XIcon className="w-5 h-5"/></button>
                            </div>
                        )}
                        {isCameraOpen && <button onClick={handleCapture} className="btn btn-primary w-full mt-2">Capture Image</button>}
                        <canvas ref={canvasRef} className="hidden"></canvas>


                        <div>
                            <h3 className="font-bold text-lg text-slate-800 mb-2">2. Select Analysis Type</h3>
                            <select value={scanType} onChange={(e) => setScanType(e.target.value as ScanType)} className="w-full form-select">
                                <option value="grammar">Spelling & Grammar</option>
                                <option value="math">Math Problem</option>
                                <option value="handwriting">Handwriting</option>
                            </select>
                        </div>
                         <button onClick={handleScan} disabled={isLoading || !imageFile} className="w-full btn btn-primary !py-3 !text-base disabled:bg-slate-400">
                            {isLoading ? <SpinnerIcon className="w-6 h-6"/> : <SparklesIcon className="w-6 h-6"/>}
                            <span>{isLoading ? 'Analyzing...' : 'Scan Homework'}</span>
                        </button>
                    </div>
                </div>
                {/* Result Section */}
                <div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">3. AI Feedback</h3>
                    <div className="p-4 border rounded-lg min-h-[300px] bg-slate-50">
                        {isLoading && <div className="flex justify-center items-center h-full"><SpinnerIcon className="w-8 h-8 text-sky-600"/></div>}
                        {error && <p className="text-red-600 font-semibold">{error}</p>}
                        {analysisResult && <div className="prose prose-sm max-w-none whitespace-pre-wrap">{analysisResult}</div>}
                        {!isLoading && !error && !analysisResult && <p className="text-slate-500 text-center mt-20">Analysis results will appear here.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeworkScannerPage;