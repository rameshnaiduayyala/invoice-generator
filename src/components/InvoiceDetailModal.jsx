import React from 'react';
import { X, Calendar, User, MapPin, Package } from 'lucide-react';

const InvoiceDetailModal = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  // Parse the full state we saved earlier
  const data = JSON.parse(invoice.fullState);
  const { items, clientDetails, invoiceMeta, companyDetails, extraCharges, visibility } = data;

  // Recalculate Totals for Display
  const subtotal = items.reduce((sum, item) => sum + ((item.qty || 0) * (item.price || 0)), 0);
  const tax = visibility.tax ? subtotal * 0.05 : 0;
  const extra = extraCharges ? extraCharges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0) : 0;
  const total = subtotal + tax + extra;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{companyDetails.name}</h2>
            <p className="text-sm text-gray-400 opacity-80">Invoice #{invoiceMeta.number}</p>
          </div>
          <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1"><User size={12}/> Billed To</span>
              <p className="font-bold text-gray-800 text-lg">{clientDetails.name}</p>
              <div className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: clientDetails.address }} />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1"><Calendar size={12}/> Details</span>
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 text-sm">Date:</span>
                <span className="font-mono font-bold">{invoiceMeta.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm">Status:</span>
                <span className="bg-green-100 text-green-700 px-2 rounded text-xs font-bold">SAVED</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left mb-6">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase">Item</th>
                <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase text-right">Qty</th>
                <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase text-right">Rate</th>
                <th className="py-2 px-3 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 px-3 text-sm font-medium text-gray-800">{item.description}</td>
                  <td className="py-3 px-3 text-sm text-gray-600 text-right">{item.qty}</td>
                  <td className="py-3 px-3 text-sm text-gray-600 text-right">{item.price}</td>
                  <td className="py-3 px-3 text-sm font-bold text-gray-800 text-right">
                    {((item.qty || 0) * (item.price || 0)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end border-t pt-4">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()}</span>
              </div>
              {visibility.tax && (
                 <div className="flex justify-between text-sm text-gray-600">
                   <span>GST (5%)</span>
                   <span>{tax.toLocaleString()}</span>
                 </div>
              )}
              {extraCharges?.map(c => (
                 <div key={c.id} className="flex justify-between text-sm text-gray-600">
                   <span>{c.label}</span>
                   <span>{c.amount}</span>
                 </div>
              ))}
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Total</span>
                <span className="text-green-600">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 transition">
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition flex items-center gap-2">
             Print Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;