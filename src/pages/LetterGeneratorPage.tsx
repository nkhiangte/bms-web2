import React, { useState, useRef, useEffect } from "react";
import { User } from "@/types";
import { SCHOOL_BANNER_URL } from "@/constants";
import {
  PrinterIcon,
  DocumentPlusIcon,
  InboxArrowDownIcon,
} from "@/components/Icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { db, firebase } from "@/firebaseConfig";

interface LetterData {
  letterNo: string;
  senderName: string;
  senderDesignation: string;
  date: string;
  recipientName: string;
  recipientDesignation: string;
  recipientOrganization: string;
  recipientAddress: string;
  subject: string;
  salutation: string;
  body: string;
  signOffName: string;
  signOffDesignation: string;
}

const LetterGeneratorPage: React.FC<{
  user: User;
  schoolConfig: { udiseCode?: string };
}> = ({ user, schoolConfig }) => {
  const generateLetterNo = () => {
    const randomNum = Math.floor(1000000 + Math.random() * 9000000);
    return `BMSAPP${randomNum}`;
  };

  const [letterData, setLetterData] = useState<LetterData>({
    letterNo: generateLetterNo(),
    senderName: user.name || "[Your Name]",
    senderDesignation:
      user.role === "admin" ? "Principal" : "Administrative Assistant",
    date: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    recipientName: "",
    recipientDesignation: "",
    recipientOrganization: "",
    recipientAddress: "",
    subject: "",
    salutation: "Respected Sir/Madam,",
    body: "",
    signOffName: user.name || "[Your Name]",
    signOffDesignation:
      user.role === "admin" ? "Principal" : "Administrative Assistant",
  });

  const [savedLetters, setSavedLetters] = useState<
    (LetterData & { id: string; createdAt: any })[]
  >([]);

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const snapshot = await db
          .collection("officeLetters")
          .orderBy("createdAt", "desc")
          .limit(50)
          .get();
        const letters = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as any)
        );
        setSavedLetters(letters);
      } catch (error) {
        console.error("Error fetching letters:", error);
      }
    };
    fetchLetters();
  }, []);

  const letterRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLetterData((prev) => ({ ...prev, [name]: value }));
  };

  const saveLetterToFirebase = async () => {
    try {
      const letterToSave = {
        ...letterData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: user.uid,
      };
      const docRef = await db.collection("officeLetters").add(letterToSave);
      setSavedLetters((prev) => [
        { id: docRef.id, ...letterToSave } as any,
        ...prev,
      ]);
    } catch (error) {
      console.error("Error saving letter:", error);
    }
  };

  const handlePrint = async () => {
    await saveLetterToFirebase();
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!letterRef.current) return;

    await saveLetterToFirebase();

    const oldScrollY = window.scrollY;
    window.scrollTo(0, 0);

    const canvas = await html2canvas(letterRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Official_Letter_${letterData.letterNo}.pdf`);

    window.scrollTo(0, oldScrollY);
  };

  const loadLetter = (letter: LetterData) => {
    setLetterData({
      ...letter,
      // optionally regenerate letter no or date if you want, but keeping original is usually fine for viewing/reprinting
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Form Section */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-sky-100 rounded-lg">
              <DocumentPlusIcon className="w-6 h-6 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Official Letter Generator
            </h1>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                Letter Reference
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Letter No.
                  </label>
                  <input
                    type="text"
                    name="letterNo"
                    value={letterData.letterNo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    name="date"
                    value={letterData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                Sender Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    name="senderName"
                    value={letterData.senderName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sender Designation
                  </label>
                  <input
                    type="text"
                    name="senderDesignation"
                    value={letterData.senderDesignation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                Recipient Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Recipient Name/Title
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={letterData.recipientName}
                    onChange={handleInputChange}
                    placeholder="e.g. The Director"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Recipient Designation
                  </label>
                  <input
                    type="text"
                    name="recipientDesignation"
                    value={letterData.recipientDesignation}
                    onChange={handleInputChange}
                    placeholder="e.g. Education Board"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    name="recipientOrganization"
                    value={letterData.recipientOrganization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="recipientAddress"
                    value={letterData.recipientAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                Letter Content
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={letterData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g. Application for [Purpose]"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Salutation
                  </label>
                  <input
                    type="text"
                    name="salutation"
                    value={letterData.salutation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Body Paragraphs
                  </label>
                  <textarea
                    name="body"
                    value={letterData.body}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="Type your letter content here..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                Sign-off
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sign-off Name
                  </label>
                  <input
                    type="text"
                    name="signOffName"
                    value={letterData.signOffName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sign-off Designation
                  </label>
                  <input
                    type="text"
                    name="signOffDesignation"
                    value={letterData.signOffDesignation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
            </section>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
              >
                <PrinterIcon className="w-5 h-5" />
                Print Letter
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <InboxArrowDownIcon className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="w-full md:w-[600px] lg:w-[800px] print:w-full print:m-0">
          <div className="sticky top-8 bg-slate-200 p-4 rounded-xl print:bg-transparent print:p-0">
            <div
              ref={letterRef}
              className="bg-white w-full aspect-[1/1.414] p-12 shadow-xl print:shadow-none print:p-0 mx-auto overflow-hidden"
              style={{ fontFamily: "serif", color: "#000000" }}
            >
              {/* Header */}
              <div
                className="pb-4 mb-8 text-center"
                style={{ borderBottom: "2px solid #1e293b" }}
              >
                <img
                  src={SCHOOL_BANNER_URL}
                  alt="School Banner"
                  className="w-full max-h-24 object-contain mb-2"
                />
                <div className="text-sm font-bold" style={{ color: "#334155" }}>
                  CHAMPHAI, MIZORAM | DISE Code:{" "}
                  {schoolConfig.udiseCode || "[DISE Code]"}
                </div>
              </div>

              {/* Date & Sender */}
              <div className="flex justify-between mb-8 text-sm">
                <div>
                  <div className="font-bold">Ref No: {letterData.letterNo}</div>
                  <div className="font-bold mt-2">{letterData.senderName}</div>
                  <div>{letterData.senderDesignation}</div>
                  <div>Bethel Mission School</div>
                  <div>Champhai, Mizoram</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">Date: {letterData.date}</div>
                </div>
              </div>

              {/* Recipient */}
              <div className="mb-8 text-sm">
                <div className="font-bold">To,</div>
                <div>{letterData.recipientName}</div>
                {letterData.recipientDesignation && (
                  <div>{letterData.recipientDesignation}</div>
                )}
                {letterData.recipientOrganization && (
                  <div>{letterData.recipientOrganization}</div>
                )}
                {letterData.recipientAddress && (
                  <div>{letterData.recipientAddress}</div>
                )}
              </div>

              {/* Subject */}
              <div className="mb-6 text-sm">
                <span className="font-bold underline">
                  Subject: {letterData.subject || "[Subject Line]"}
                </span>
              </div>

              {/* Salutation */}
              <div className="mb-4 text-sm">{letterData.salutation}</div>

              {/* Body */}
              <div className="mb-12 text-sm leading-relaxed whitespace-pre-wrap min-h-[300px]">
                {letterData.body ||
                  "Type your letter content in the form to see the preview here..."}
              </div>

              {/* Sign-off */}
              <div className="text-sm">
                <div className="mb-12">Yours faithfully,</div>
                <div className="font-bold">( {letterData.signOffName} )</div>
                <div>{letterData.signOffDesignation}</div>
                <div>Bethel Mission School</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Letters Section */}
      <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Saved Letters</h2>
        {savedLetters.length === 0 ? (
          <p className="text-slate-500 text-sm">No letters saved yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3 font-semibold text-slate-700">
                    Letter No
                  </th>
                  <th className="p-3 font-semibold text-slate-700">Date</th>
                  <th className="p-3 font-semibold text-slate-700">
                    Recipient
                  </th>
                  <th className="p-3 font-semibold text-slate-700">Subject</th>
                  <th className="p-3 font-semibold text-slate-700 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {savedLetters.map((letter) => (
                  <tr
                    key={letter.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3 font-medium text-slate-800">
                      {letter.letterNo}
                    </td>
                    <td className="p-3 text-slate-600">{letter.date}</td>
                    <td className="p-3 text-slate-600">
                      {letter.recipientName}
                      {letter.recipientOrganization && (
                        <span className="block text-xs text-slate-400">
                          {letter.recipientOrganization}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">
                      {letter.subject}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => loadLetter(letter)}
                        className="text-sky-600 hover:text-sky-800 font-medium text-sm"
                      >
                        Load
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LetterGeneratorPage;
