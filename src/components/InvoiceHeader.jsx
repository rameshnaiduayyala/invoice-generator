import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import TiptapEditor from './TiptapEditor';

const InvoiceHeader = ({ logoData, setLogoData, company, setCompany, client, setClient, meta, setMeta, visible, theme = { primary: '#15803d' } }) => {
  const fileInputRef = useRef(null);

  // --- Image Handlers ---
  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoData({ src: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 pb-4 font-sans bg-white">
      
      {/* --- THE GREEN BORDER BOX --- */}
      <div className="border-[3px] p-6 relative mb-6" style={{ borderColor: theme.primary }}>
        
        {/* Flex Column to stack Logo -> Text */}
        <div className="flex flex-col items-center relative z-10">
          
          {/* 1. LOGO (Centered at Top) */}
          {visible && (
            <div 
              className="mb-4 w-32 h-32 flex items-center justify-center cursor-pointer group relative"
              onClick={() => fileInputRef.current.click()}
            >
              {logoData.src ? (
                <img src={logoData.src} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="text-gray-300 text-center border-2 border-dashed border-gray-200 p-4 rounded-full">
                   <Upload size={32} className="mx-auto mb-1 opacity-50"/>
                   <span className="text-[10px] uppercase font-bold">Upload Logo</span>
                </div>
              )}
              
              {/* Hidden Input */}
              <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
              
              {/* Edit Hint */}
              {logoData.src && (
                 <div className="absolute -bottom-2 bg-gray-800 text-white text-[9px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition print:hidden">
                   Change
                 </div>
              )}
            </div>
          )}

          {/* 2. COMPANY NAME */}
          <div className="w-full text-center mb-1">
            <TiptapEditor 
              content={company.name || ''} 
              onChange={(val) => setCompany({...company, name: val})} 
              placeholder="NURSERY NAME" 
              theme={theme}
              className="text-4xl md:text-5xl font-black uppercase tracking-wide text-gray-900 leading-none text-center" 
            />
          </div>

          {/* 3. SUBTITLE / PROPRIETOR */}
          <div className="w-full text-center mb-3">
             <TiptapEditor 
               content={company.tagline || ''} 
               onChange={(val) => setCompany({...company, tagline: val})} 
               placeholder="Proprietor / Subtitle..." 
               theme={theme}
               className="text-xl font-bold text-gray-600 uppercase tracking-wider text-center"
             />
          </div>

          {/* 4. PHONE NUMBERS (Green Row) */}
          <div className="w-full text-center mb-2 border-t border-b py-1 border-gray-100">
             <TiptapEditor 
               content={company.contacts?.[0]?.value || ''} 
               onChange={(val) => {
                  const newContacts = [...(company.contacts || [])];
                  if(!newContacts[0]) newContacts[0] = { id: 'phones', type: 'text', value: '' };
                  newContacts[0].value = val;
                  setCompany({...company, contacts: newContacts});
               }}
               placeholder="99592 00000 | 94403 00000 | 94926 00000" 
               theme={theme}
               className="text-2xl md:text-3xl font-bold text-center leading-none"
               style={{ color: theme.primary }}
             />
          </div>

          {/* 5. ADDRESS */}
          <div className="w-full text-center">
            <TiptapEditor 
              content={company.address || ''} 
              onChange={(val) => setCompany({...company, address: val})} 
              placeholder="Opp: Temple | Road Name | City | Email: example@yahoo.com" 
              theme={theme}
              className="text-sm font-bold text-gray-800 text-center uppercase tracking-tight" 
            />
          </div>
        </div>
      </div>

      {/* --- QUOTATION INFO SECTION --- */}
      <div className="flex items-end justify-between mb-4">
        
        {/* To Address */}
        <div className="w-1/3">
           <span className="text-sm font-bold text-gray-800 italic block mb-1">To,</span>
           <TiptapEditor 
              content={client.name || ''} 
              onChange={(val) => setClient({...client, name: val})} 
              placeholder="Mr./Mrs. Client Name..." 
              theme={theme}
              className="text-lg font-bold text-gray-900 leading-tight" 
           />
           <TiptapEditor 
              content={client.address || ''} 
              onChange={(val) => setClient({...client, address: val})} 
              placeholder="Location..." 
              theme={theme}
              className="text-sm text-gray-600 leading-tight" 
           />
        </div>

        {/* Title */}
        <div className="w-1/3 text-center">
           <input 
             value={meta.title} 
             onChange={(e) => setMeta({...meta, title: e.target.value})} 
             className="text-2xl font-bold text-center w-full bg-transparent focus:outline-none uppercase underline decoration-2 underline-offset-4" 
             style={{ textDecorationColor: 'black', color: 'black' }}
           />
        </div>

        {/* Date */}
        <div className="w-1/3 text-right">
           <div className="inline-flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">Date :</span>
              <input 
                type="text" 
                value={meta.date} 
                onChange={(e) => setMeta({...meta, date: e.target.value})} 
                className="text-sm font-bold text-gray-900 w-24 text-right bg-transparent focus:outline-none"
                placeholder="DD.MM.YYYY"
              />
           </div>
        </div>
      </div>

    </div>
  );
};

export default InvoiceHeader;