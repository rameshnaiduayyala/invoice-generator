import React, { useEffect, useState } from 'react';
import { X, Search, Trash2, Edit, Loader2 } from 'lucide-react';

const HistoryModal = ({ isOpen, onClose, fetchHistory, onLoad, onDelete }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchHistory();
    // Sort by newest first
    const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setInvoices(sorted);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const success = await onDelete(id);
    if (success) loadData(); // Refresh list after delete
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Invoice History</h2>
            <p className="text-xs text-gray-500">Manage and reload past invoices</p>
          </div>
          <button onClick={onClose} className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"><X size={20}/></button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Client Name or Invoice Number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <Loader2 className="animate-spin mb-2" size={32} />
               Loading History...
             </div>
          ) : filteredInvoices.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
               <Search size={48} className="mb-2"/>
               <p>No invoices found.</p>
             </div>
          ) : (
             <div className="grid gap-3">
               {filteredInvoices.map((inv) => (
                 <div key={inv.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                    <div className="flex gap-6 items-center">
                       <div className="w-24">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Number</span>
                          <span className="font-mono font-bold text-gray-800">{inv.invoiceNo}</span>
                       </div>
                       <div className="w-32">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Date</span>
                          <span className="text-sm text-gray-700">{inv.date}</span>
                       </div>
                       <div className="w-64">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Client</span>
                          <span className="font-bold text-gray-900 truncate block">{inv.clientName}</span>
                       </div>
                       <div>
                          <span className="block text-xs font-bold text-gray-400 uppercase">Amount</span>
                          <span className="font-mono font-bold text-green-700">₹{inv.totalAmount?.toLocaleString()}</span>
                       </div>
                    </div>

                    <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { onLoad(inv); onClose(); }}
                        className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded hover:bg-blue-100 font-bold text-xs transition"
                      >
                        <Edit size={14} /> Load / Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(inv.id)}
                        className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 font-bold text-xs transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;