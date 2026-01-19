import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Settings, Printer, Palette } from 'lucide-react';
import InvoiceHeader from './components/InvoiceHeader';
import InvoiceTable from './components/InvoiceTable';
import InvoiceFooter from './components/InvoiceFooter';
import SettingsModal from './components/SettingsModal';

const DEFAULT_THEME = {
  primary: '#15803d',
  secondary: '#f0fdf4',
  text: '#1f2937',
  headerText: '#111827',
};

const InvoiceGenerator = () => {
  const [showSettings, setShowSettings] = useState(false);
  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice_${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print { 
        body { -webkit-print-color-adjust: exact; }
        #design-toolbar, .print\\:hidden { display: none !important; }
      }
    `,
  });

  // --- STATE ---
  const [theme, setTheme] = useState(() => JSON.parse(localStorage.getItem('invoice_theme')) || DEFAULT_THEME);
  const [logoData, setLogoData] = useState(() => JSON.parse(localStorage.getItem('invoice_logo_data')) || { src: null, scale: 1, x: 0, y: 0 });
  const [signature, setSignature] = useState(() => localStorage.getItem('invoice_signature') || null);
  const [potOptions, setPotOptions] = useState(() => JSON.parse(localStorage.getItem('invoice_pot_options')) || ['4" Pot', '6" Pot', '8" Pot']);
  const [columns, setColumns] = useState(() => JSON.parse(localStorage.getItem('invoice_columns')) || [
    { id: 'description', label: 'Plant Description', type: 'text' },
    { id: 'size', label: 'Size/Pot', type: 'select' }
  ]);
  const [visibility, setVisibility] = useState(() => JSON.parse(localStorage.getItem('invoice_visibility')) || {
    logo: true, bankDetails: true, terms: true, signature: true, tax: true
  });
  const [companyDetails, setCompanyDetails] = useState(() => JSON.parse(localStorage.getItem('invoice_company')) || {
    name: 'Green Thumb Nursery', contacts: [], bank: '', terms: ''
  });
  const [clientDetails, setClientDetails] = useState(() => JSON.parse(localStorage.getItem('invoice_client')) || { name: '', address: '' });
  const [invoiceMeta, setInvoiceMeta] = useState(() => JSON.parse(localStorage.getItem('invoice_meta')) || {
    number: 'INV-001', date: new Date().toISOString().split('T')[0], title: 'INVOICE'
  });
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('invoice_items')) || [{ id: 1, qty: 1, price: 0 }]);
  
  // --- NEW STATE: EXTRA CHARGES ---
  const [extraCharges, setExtraCharges] = useState(() => JSON.parse(localStorage.getItem('invoice_extra_charges')) || []);

  // --- AUTO SAVE ---
  useEffect(() => {
    localStorage.setItem('invoice_theme', JSON.stringify(theme));
    localStorage.setItem('invoice_logo_data', JSON.stringify(logoData));
    localStorage.setItem('invoice_signature', signature || '');
    localStorage.setItem('invoice_pot_options', JSON.stringify(potOptions));
    localStorage.setItem('invoice_columns', JSON.stringify(columns));
    localStorage.setItem('invoice_visibility', JSON.stringify(visibility));
    localStorage.setItem('invoice_company', JSON.stringify(companyDetails));
    localStorage.setItem('invoice_client', JSON.stringify(clientDetails));
    localStorage.setItem('invoice_meta', JSON.stringify(invoiceMeta));
    localStorage.setItem('invoice_items', JSON.stringify(items));
    localStorage.setItem('invoice_extra_charges', JSON.stringify(extraCharges)); // Save Extras
  }, [theme, logoData, signature, potOptions, columns, visibility, companyDetails, clientDetails, invoiceMeta, items, extraCharges]);

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8 font-serif">
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center print:hidden">
        <span className="text-xs text-gray-500 font-sans flex items-center gap-2"><Palette size={14} style={{ color: theme.primary }}/> Professional Print Mode Active</span>
        <div className="flex gap-3">
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow text-sm font-sans font-medium hover:bg-gray-50"><Settings size={16} /> Customize</button>
          <button onClick={handlePrint} className="flex items-center gap-2 text-white px-4 py-2 rounded shadow text-sm font-sans font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: theme.primary }}><Printer size={16} /> Print PDF</button>
        </div>
      </div>

      {showSettings && <SettingsModal close={() => setShowSettings(false)} data={{ potOptions, columns, visibility, theme }} actions={{ setPotOptions, setColumns, setVisibility, setTheme }} />}

      <div ref={invoiceRef}>
        <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl print:shadow-none flex flex-col transition-all duration-300">
          <InvoiceHeader logoData={logoData} setLogoData={setLogoData} company={companyDetails} setCompany={setCompanyDetails} client={clientDetails} setClient={setClientDetails} meta={invoiceMeta} setMeta={setInvoiceMeta} visible={visibility.logo} theme={theme} />
          <div className="px-10 flex-1">
            <InvoiceTable columns={columns} items={items} setItems={setItems} potOptions={potOptions} theme={theme} />
          </div>
          
          {/* Pass extraCharges props here */}
          <InvoiceFooter 
            items={items}
            visibility={visibility}
            company={companyDetails} setCompany={setCompanyDetails}
            signature={signature} setSignature={setSignature}
            theme={theme}
            extraCharges={extraCharges}       // <--- NEW
            setExtraCharges={setExtraCharges} // <--- NEW
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;