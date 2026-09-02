import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FooterProps {
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

type LegalDocType = 'privacy' | 'terms' | 'data-protection' | 'compliance';

interface LegalDoc {
  id: LegalDocType;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: { title: string; content: string }[];
}

const legalDocs: Record<LegalDocType, LegalDoc> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'Protego Municipal Public Safety and Telemetry Privacy Guidelines',
    lastUpdated: 'September 2026',
    sections: [
      {
        title: '1. Citizen Anonymity & Data Protection',
        content: 'Protego is engineered to protect citizen privacy while enabling rapid public safety response. General Diary (GD) records and crime reports are encrypted with AES-256 at rest and TLS 1.3 in transit. Your identity is shared solely with authorized law enforcement officers assigned to your specific case.'
      },
      {
        title: '2. Live Telemetry & GPS Tracking Policy',
        content: 'GPS location access is strictly opt-in and is only broadcast during an active Emergency SOS trigger or when filing an incident report. Officers cannot track citizen location without an active distress beacon or explicit emergency dispatch trigger.'
      },
      {
        title: '3. Evidence Storage & Retention',
        content: 'Uploaded photos, documents, and digital media are stored in an encrypted evidence vault. Cryptographic SHA-256 hashes are generated upon upload to maintain an indisputable chain of custody for legal court admissibility.'
      }
    ]
  },
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    subtitle: 'Official Conditions of Use for Protego Public Safety Network',
    lastUpdated: 'September 2026',
    sections: [
      {
        title: '1. Binding Legal Authenticity',
        content: 'Digital General Diaries (GD) and crime reports submitted through Protego carry legal standing under the National Electronic Records Act. Submitting knowingly false reports is punishable under municipal and federal penal codes.'
      },
      {
        title: '2. Emergency SOS Responsibilities',
        content: 'The Emergency SOS distress button is reserved strictly for life-threatening situations, active violent crimes, or immediate medical crises. Malicious or frivolous SOS triggers are logged and subject to civil penalties.'
      },
      {
        title: '3. Digital Receipts & Evidentiary Value',
        content: 'Digital receipts generated upon GD filing serve as authentic verification for government offices, insurance providers, and consular passport replacement authorities.'
      }
    ]
  },
  'data-protection': {
    id: 'data-protection',
    title: 'Data Protection & GDPR',
    subtitle: 'Citizen Data Rights & Information Security Protocol',
    lastUpdated: 'September 2026',
    sections: [
      {
        title: '1. Right to Access & Erasure',
        content: 'Citizens have the right to request a complete export of their filed records and personal data. Resolved General Diaries can be archived or redacted in accordance with statutory statute of limitations guidelines.'
      },
      {
        title: '2. Zero Third-Party Commercial Data Sharing',
        content: 'Under no circumstances is citizen telemetry, location data, or contact information sold, monetized, or shared with commercial entities, advertisers, or third-party brokers.'
      }
    ]
  },
  compliance: {
    id: 'compliance',
    title: 'Security & Compliance Standards',
    subtitle: 'CJIS, ISO/IEC 27001 & Law Enforcement Transparency',
    lastUpdated: 'September 2026',
    sections: [
      {
        title: '1. CJIS & ISO 27001 Certifications',
        content: 'Protego infrastructure adheres to FBI Criminal Justice Information Services (CJIS) security policies and holds ISO/IEC 27001 certification for information security management.'
      },
      {
        title: '2. Tamper-Evident Ledger Integrity',
        content: 'Every officer status change, incident dispatch, and case resolution is immutably logged in an audit ledger to ensure complete civilian oversight and prevent retrospective evidence tampering.'
      }
    ]
  }
};

const Footer: React.FC<FooterProps> = () => {
  const [activeLegalModal, setActiveLegalModal] = useState<LegalDocType | null>(null);

  const openLegalDoc = (docType: LegalDocType) => {
    setActiveLegalModal(docType);
  };

  return (
    <footer className="bg-[#040812] text-slate-400 border-t border-slate-800/80 font-sans relative overflow-hidden py-5 sm:py-6">
      
      {/* Subtle background ambient glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Clean Minimalist Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs">
        
        {/* Legal & Policy Links (Shown on top on mobile, right on desktop) */}
        <div className="order-1 sm:order-2 flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-400">
          <button onClick={() => openLegalDoc('privacy')} className="hover:text-slate-200 transition cursor-pointer">Privacy Policy</button>
          <button onClick={() => openLegalDoc('terms')} className="hover:text-slate-200 transition cursor-pointer">Terms of Service</button>
          <button onClick={() => openLegalDoc('data-protection')} className="hover:text-slate-200 transition cursor-pointer">Data Protection</button>
          <button onClick={() => openLegalDoc('compliance')} className="hover:text-slate-200 transition cursor-pointer">Security Protocol</button>
        </div>

        {/* Copyright (Shown below on mobile, left on desktop) */}
        <p className="order-2 sm:order-1 text-slate-500 font-medium text-center sm:text-left text-[11px] sm:text-xs">
          © {new Date().getFullYear()} Protego Emergency Systems. All rights reserved.
        </p>

      </div>

      {/* Interactive Legal Policy Modal */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveLegalModal(null)} />
          <div className="relative bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-5 sm:p-8 z-10 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
                  OFFICIAL MUNICIPAL LEGAL DOCUMENT
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {legalDocs[activeLegalModal].title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {legalDocs[activeLegalModal].subtitle} · Last Updated: {legalDocs[activeLegalModal].lastUpdated}
                </p>
              </div>
              <button 
                onClick={() => setActiveLegalModal(null)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Document Switcher Tabs */}
            <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
              {(Object.keys(legalDocs) as LegalDocType[]).map(docKey => (
                <button
                  key={docKey}
                  onClick={() => setActiveLegalModal(docKey)}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition text-center whitespace-nowrap ${
                    activeLegalModal === docKey
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {legalDocs[docKey].title}
                </button>
              ))}
            </div>

            {/* Document Body Sections */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[50vh] overflow-y-auto pr-1">
              {legalDocs[activeLegalModal].sections.map((section, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {section.title}
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                Certified compliant with CJIS & GDPR Information Security Standards.
              </span>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Close Document
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
};

export default Footer;
