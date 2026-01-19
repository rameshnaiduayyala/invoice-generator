import React, { useState } from 'react';
import { X, Plus, Trash2, PenTool } from 'lucide-react';
import TiptapEditor from './TiptapEditor';
import SignatureModal from './SignatureModal'; // Import the new modal

// Helper to clean HTML from company name for the signature line
const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const InvoiceFooter = ({ items, visibility, company, setCompany, signature, setSignature, theme, extraCharges, setExtraCharges }) => {
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);

  // --- Calculations ---
  const subtotal = items.reduce((sum, item) => sum + ((item.qty || 0) * (item.price || 0)), 0);
  const taxRate = visibility.tax ? 0.05 : 0;
  const taxAmount = subtotal * taxRate;
  const extraChargesTotal = extraCharges.reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);
  const total = subtotal + taxAmount + extraChargesTotal;

  // --- Extra Charges Handlers ---
  const addExtraCharge = () => setExtraCharges([...extraCharges, { id: Date.now(), label: 'Loading Charges', amount: 0 }]);
  const removeExtraCharge = (id) => setExtraCharges(extraCharges.filter(charge => charge.id !== id));
  const updateExtraCharge = (id, field, value) => setExtraCharges(extraCharges.map(charge => charge.id === id ? { ...charge, [field]: value } : charge));

  return (
    <div className="mt-auto">
      
      {/* --- SIGNATURE MODAL --- */}
      <SignatureModal 
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onSave={(newSig) => setSignature(newSig)}
        existingSignature={signature}
      />

      {/* TOTALS SECTION */}
      <div className="flex justify-end px-10 pt-4">
        <div className="w-1/2 md:w-5/12">
          {/* Subtotal */}
          <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-mono">{subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
          </div>
          
          {/* Tax */}
          {visibility.tax && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-600">GST (5%)</span>
              <span className="font-mono">{taxAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
            </div>
          )}

          {/* Extra Charges */}
          <div className="py-2 space-y-2">
            {extraCharges.map((charge) => (
              <div key={charge.id} className="flex justify-between items-center group relative">
                <button onClick={() => removeExtraCharge(charge.id)} className="absolute -left-6 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition print:hidden"><Trash2 size={12} /></button>
                <input type="text" value={charge.label} onChange={(e) => updateExtraCharge(charge.id, 'label', e.target.value)} className="text-sm text-gray-600 bg-transparent focus:outline-none w-1/2" />
                <div className="flex items-center justify-end w-1/2">
                   <span className="text-gray-400 text-xs mr-1">₹</span>
                   <input type="number" value={charge.amount} onChange={(e) => updateExtraCharge(charge.id, 'amount', parseFloat(e.target.value))} className="text-sm font-mono text-right bg-transparent focus:outline-none w-20" />
                </div>
              </div>
            ))}
            <button onClick={addExtraCharge} className="text-xs font-bold flex items-center gap-1 mt-2 print:hidden hover:underline" style={{ color: theme.primary }}><Plus size={12} /> Add Extra Charge</button>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between py-4 text-xl font-bold border-b-2 border-gray-900 mt-2 border-t border-gray-300">
            <span>Total</span>
            <span className="font-mono" style={{ color: theme.primary }}>{total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
          </div>
        </div>
      </div>

      {/* FOOTER TEXT & SIGNATURE */}
      <div className="grid grid-cols-2 gap-8 px-10 pb-16 pt-12 break-inside-avoid">
        <div className="space-y-6">
          {visibility.bankDetails && (
            <div>
               <h4 className="font-bold text-xs text-gray-400 mb-1 uppercase tracking-wider">Bank Details</h4>
               <TiptapEditor content={company.bank || ''} onChange={(val) => setCompany({...company, bank: val})} placeholder="Enter Bank Details..." theme={theme} className="text-xs text-gray-600 leading-relaxed font-mono" />
            </div>
          )}
          {visibility.terms && (
            <div>
               <h4 className="font-bold text-xs text-gray-400 mb-1 uppercase tracking-wider">Terms & Conditions</h4>
               <TiptapEditor content={company.terms || ''} onChange={(val) => setCompany({...company, terms: val})} placeholder="Enter Terms..." theme={theme} className="text-xs text-gray-600 leading-relaxed" />
            </div>
          )}
        </div>

        {visibility.signature && (
           <div className="flex flex-col justify-end items-end">
              <div className="w-48 text-center relative group">
                
                {/* SIGNATURE BOX */}
                <div 
                  className="h-24 mb-2 flex items-end justify-center cursor-pointer relative"
                  onClick={() => setIsSigModalOpen(true)} // Open Modal on Click
                >
                   {signature ? (
                     <img src={signature} alt="Sig" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                   ) : (
                     <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-400 transition print:hidden">
                        <PenTool size={20} className="mb-1 opacity-50"/>
                        <span className="text-[10px] font-bold uppercase">Click to Sign</span>
                     </div>
                   )}
                   
                   {/* Edit / Remove controls (Hover only) */}
                   {signature && (
                     <div className="absolute -top-2 -right-2 flex gap-1 print:hidden">
                       <button 
                         onClick={(e) => { e.stopPropagation(); setSignature(null); }} 
                         className="bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200"
                         title="Remove Signature"
                       >
                         <X size={12}/>
                       </button>
                     </div>
                   )}
                </div>

                <div className="border-t border-gray-900 w-full"></div>
                <p className="font-bold text-sm text-gray-900 mt-2 uppercase">{stripHtml(company.name) || 'Authorized Signatory'}</p>
                <p className="text-xs text-gray-500">Authorized Signatory</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceFooter;