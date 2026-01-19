import React, { useRef, useState } from 'react';
import { Upload, PenTool } from 'lucide-react';
import TiptapEditor from './TiptapEditor';

const InvoiceHeader = ({ logoData, setLogoData, company, setCompany, client, setClient, meta, setMeta, visible, theme }) => {
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
      <div className="border-[3px] p-4 relative mb-6" style={{ borderColor: theme.primary }}>
        
        {/* Faint Background Decoration (Optional Leaf Watermark) */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-10 pointer-events-none">
           <svg viewBox="0 0 24 24" fill={theme.primary}><path d="M12,2C12,2 14,8 18,8C22,8 22,2 22,2C22,2 20,10 16,12C12,14 12,2 12,2M12,22C12,22 10,16 6,16C2,16 2,22 2,22C2,22 4,14 8,12C12,10 12,22 12,22Z" /></svg>
        </div>

        <div className="flex justify-between items-center relative z-10">
          
          {/* CENTER: COMPANY NAME & DETAILS */}
          <div className="flex-1 text-center">
            
            {/* 1. Main Company Name */}
            <div className="mb-1">
              <TiptapEditor 
                content={company.name || ''} 
                onChange={(val) => setCompany({...company, name: val})} 
                placeholder="NURSERY NAME" 
                theme={theme}
                className="text-4xl md:text-5xl font-black uppercase tracking-wide text-gray-800 leading-none text-center" 
              />
            </div>

            {/* 2. Subtitle (Proprietor Name) */}
            <div className="mb-2">
               <TiptapEditor 
                 content={company.tagline || ''} 
                 onChange={(val) => setCompany({...company, tagline: val})} 
                 placeholder="Proprietor / Subtitle..." 
                 theme={theme}
                 className="text-xl font-bold text-gray-600 uppercase tracking-wider text-center"
               />
            </div>

            {/* 3. GREEN PHONE NUMBERS ROW */}
            <div className="mb-2 border-t border-b py-1 border-gray-100">
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
                 // This forces the green color from your theme
                 style={{ color: theme.primary }}
               />
            </div>

            {/* 4. Address & Email Line */}
            <div>
              <TiptapEditor 
                content={company.address || ''} 
                onChange={(val) => setCompany({...company, address: val})} 
                placeholder="Opp: Temple | Road Name | City | Email: example@yahoo.com" 
                theme={theme}
                className="text-sm font-bold text-gray-800 text-center uppercase tracking-tight" 
              />
            </div>
          </div>

          {/* RIGHT: LOGO (Stylized Plant) */}
          {visible && (
            <div 
              className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center cursor-pointer group"
              onClick={() => fileInputRef.current.click()}
            >
              {logoData.src ? (
                <img src={logoData.src} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="text-gray-300 text-center">
                   <Upload size={32} className="mx-auto mb-1 opacity-20"/>
                   <span className="text-[10px] uppercase font-bold">Logo</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
            </div>
          )}
        </div>
      </div>

      {/* --- REVISED QUOTATION SECTION --- */}
      <div className="flex items-end justify-between mb-4">
        
        {/* LEFT: TO ADDRESS */}
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
              placeholder="Farmhouse / Location..." 
              theme={theme}
              className="text-sm text-gray-600 leading-tight" 
           />
        </div>

        {/* CENTER: TITLE (Underlined) */}
        <div className="w-1/3 text-center">
           <input 
             value={meta.title} 
             onChange={(e) => setMeta({...meta, title: e.target.value})} 
             className="text-2xl font-bold text-center w-full bg-transparent focus:outline-none uppercase underline decoration-2 underline-offset-4" 
             style={{ textDecorationColor: 'black', color: 'black' }}
           />
        </div>

        {/* RIGHT: DATE */}
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