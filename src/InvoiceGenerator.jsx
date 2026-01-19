import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Settings, Printer, Palette, LogOut, Cloud, Save, History, FilePlus } from 'lucide-react';
import InvoiceHeader from './components/InvoiceHeader';
import InvoiceTable from './components/InvoiceTable';
import InvoiceFooter from './components/InvoiceFooter';
import SettingsModal from './components/SettingsModal';
import HistoryModal from './components/HistoryModal'; // Import New Modal

// Defaults
const DEFAULT_THEME = { primary: '#15803d', secondary: '#f0fdf4', text: '#1f2937', headerText: '#111827' };
const DEFAULT_COMPANY = { name: 'Green Thumb Nursery', contacts: [], bank: '', terms: '' };
const DEFAULT_CLIENT = { name: '', address: '' };
const DEFAULT_META = { number: 'INV-001', date: new Date().toISOString().split('T')[0], title: 'INVOICE' };
const DEFAULT_ITEMS = [{ id: 1, qty: 1, price: 0 }];

const InvoiceGenerator = ({ onLogout, saveDraft, saveFinal, fetchHistory, deleteHistory, initialData }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // History Modal State
  const [isSaving, setIsSaving] = useState(false);
  const invoiceRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice_${new Date().toISOString().split('T')[0]}`,
    pageStyle: `@page { size: A4; margin: 0; } @media print { body { -webkit-print-color-adjust: exact; } #design-toolbar, .print\\:hidden { display: none !important; } }`,
  });

  // --- STATE ---
  // If initialData exists (loaded from cloud), use it. Otherwise use DEFAULTS.
  const [theme, setTheme] = useState(initialData?.theme ? JSON.parse(initialData.theme) : DEFAULT_THEME);
  const [logoData, setLogoData] = useState(initialData?.logoData ? JSON.parse(initialData.logoData) : { src: null });
  const [signature, setSignature] = useState(initialData?.signature || null);
  const [potOptions, setPotOptions] = useState(initialData?.potOptions ? JSON.parse(initialData.potOptions) : ['4" Pot', '6" Pot', '8" Pot']);
  const [columns, setColumns] = useState(initialData?.columns ? JSON.parse(initialData.columns) : [
    { id: 'description', label: 'Plant Name', type: 'text', width: 'w-4/12' },
    { id: 'bag', label: 'Bag Size', type: 'text', width: 'w-2/12' }, 
    { id: 'rate', label: 'Rate', type: 'number', width: 'w-2/12' }
  ]);
  const [visibility, setVisibility] = useState(initialData?.visibility ? JSON.parse(initialData.visibility) : { logo: true, bankDetails: true, terms: true, signature: true, tax: true });
  const [companyDetails, setCompanyDetails] = useState(initialData?.company ? JSON.parse(initialData.company) : DEFAULT_COMPANY);
  const [clientDetails, setClientDetails] = useState(initialData?.client ? JSON.parse(initialData.client) : DEFAULT_CLIENT);
  const [invoiceMeta, setInvoiceMeta] = useState(initialData?.meta ? JSON.parse(initialData.meta) : DEFAULT_META);
  const [items, setItems] = useState(initialData?.items ? JSON.parse(initialData.items) : DEFAULT_ITEMS);
  const [extraCharges, setExtraCharges] = useState(initialData?.extraCharges ? JSON.parse(initialData.extraCharges) : []);

  // --- AUTO-SAVE DRAFT ---
  useEffect(() => {
    setIsSaving(true);
    const timeoutId = setTimeout(() => {
      saveDraft({
        theme: JSON.stringify(theme),
        logoData: JSON.stringify(logoData),
        signature,
        potOptions: JSON.stringify(potOptions),
        columns: JSON.stringify(columns),
        visibility: JSON.stringify(visibility),
        company: JSON.stringify(companyDetails),
        client: JSON.stringify(clientDetails),
        meta: JSON.stringify(invoiceMeta),
        items: JSON.stringify(items),
        extraCharges: JSON.stringify(extraCharges)
      });
      setIsSaving(false);
    }, 2000); 
    return () => clearTimeout(timeoutId);
  }, [theme, logoData, signature, potOptions, columns, visibility, companyDetails, clientDetails, invoiceMeta, items, extraCharges]);

  // --- HANDLER: SAVE TO HISTORY ---
  const handleSaveToHistory = () => {
    // Calculate total amount for the summary list
    const subtotal = items.reduce((sum, item) => sum + ((item.qty || 0) * (item.price || 0)), 0);
    const tax = visibility.tax ? subtotal * 0.05 : 0;
    const extra = extraCharges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const totalAmount = subtotal + tax + extra;

    // We store the full state as JSON strings, plus some extracted fields for easy searching
    const invoicePayload = {
      invoiceNo: invoiceMeta.number,
      clientName: clientDetails.name,
      date: invoiceMeta.date,
      totalAmount: totalAmount,
      // Full Data Dump (so we can reload exactly)
      fullState: JSON.stringify({
        theme, logoData, signature, potOptions, columns, visibility,
        companyDetails, clientDetails, invoiceMeta, items, extraCharges
      })
    };

    saveFinal(invoicePayload);
  };

  // --- HANDLER: LOAD FROM HISTORY ---
  const handleLoadInvoice = (loadedInvoice) => {
    if (confirm("This will overwrite your current screen. Continue?")) {
      const data = JSON.parse(loadedInvoice.fullState);
      setTheme(data.theme);
      setLogoData(data.logoData);
      setSignature(data.signature);
      setPotOptions(data.potOptions);
      setColumns(data.columns);
      setVisibility(data.visibility);
      setCompanyDetails(data.companyDetails);
      setClientDetails(data.clientDetails);
      setInvoiceMeta(data.invoiceMeta);
      setItems(data.items);
      setExtraCharges(data.extraCharges);
    }
  };

  // --- HANDLER: NEW INVOICE (Clear Form) ---
  const handleNewInvoice = () => {
    if(confirm("Clear current form?")) {
      setClientDetails(DEFAULT_CLIENT);
      setItems(DEFAULT_ITEMS);
      setExtraCharges([]);
      // We purposefully keep Company, Theme, Settings etc.
      // We might want to auto-increment invoice number here if we were fancy
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-8 font-serif">
      
      {/* --- HISTORY MODAL --- */}
      <HistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)}
        fetchHistory={fetchHistory}
        onDelete={deleteHistory}
        onLoad={handleLoadInvoice}
      />

      {/* --- TOOLBAR --- */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 font-sans flex items-center gap-2">
             <Palette size={14} style={{ color: theme.primary }}/> Cloud Mode
          </span>
          <span className={`text-xs font-bold flex items-center gap-1 transition-colors ${isSaving ? 'text-orange-500' : 'text-green-600'}`}>
            <Cloud size={14} /> {isSaving ? 'Draft Saving...' : 'Draft Saved'}
          </span>
        </div>

        <div className="flex gap-2">
          {/* NEW Buttons */}
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded shadow text-sm font-sans font-medium hover:bg-indigo-700 transition">
             <History size={16}/> List
          </button>
          
          <button onClick={handleSaveToHistory} className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded shadow text-sm font-sans font-medium hover:bg-green-700 transition">
             <Save size={16}/> Save
          </button>

          <button onClick={handleNewInvoice} className="flex items-center gap-2 bg-white text-gray-700 px-3 py-2 rounded shadow text-sm font-sans font-medium hover:bg-gray-50 transition border border-gray-200" title="Clear form for new invoice">
             <FilePlus size={16}/> New
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 bg-white px-3 py-2 rounded shadow text-sm font-sans font-medium hover:bg-gray-50 transition">
            <Settings size={16} />
          </button>
          
          <button onClick={handlePrint} className="flex items-center gap-2 text-white px-4 py-2 rounded shadow text-sm font-sans font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: theme.primary }}>
            <Printer size={16} /> Print
          </button>

          <button onClick={onLogout} className="ml-2 text-gray-400 hover:text-red-500 transition" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {showSettings && <SettingsModal close={() => setShowSettings(false)} data={{ potOptions, columns, visibility, theme }} actions={{ setPotOptions, setColumns, setVisibility, setTheme }} />}

      <div ref={invoiceRef}>
        <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl print:shadow-none flex flex-col transition-all duration-300">
          <InvoiceHeader logoData={logoData} setLogoData={setLogoData} company={companyDetails} setCompany={setCompanyDetails} client={clientDetails} setClient={setClientDetails} meta={invoiceMeta} setMeta={setInvoiceMeta} visible={visibility.logo} theme={theme} />
          <div className="px-10 flex-1">
            <InvoiceTable columns={columns} items={items} setItems={setItems} potOptions={potOptions} theme={theme} />
          </div>
          <InvoiceFooter items={items} visibility={visibility} company={companyDetails} setCompany={setCompanyDetails} signature={signature} setSignature={setSignature} theme={theme} extraCharges={extraCharges} setExtraCharges={setExtraCharges} />
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;