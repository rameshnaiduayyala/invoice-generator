import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const InvoiceTable = ({ columns, items, setItems, potOptions, theme }) => {
  const handleChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const addItem = () => setItems([...items, { id: Date.now(), qty: 1, price: 0 }]);
  const deleteItem = (id) => setItems(items.filter(item => item.id !== id));

  return (
    <>
      <table className="w-full">
        <thead style={{ backgroundColor: theme.secondary }}>
          <tr className="border-b border-gray-300">
            {columns.map((col) => (
              <th key={col.id} className="text-left py-3 px-2 text-xs font-bold uppercase" style={{ color: theme.primary }}>{col.label}</th>
            ))}
            <th className="text-center py-3 px-2 text-xs font-bold uppercase w-24" style={{ color: theme.primary }}>Qty</th>
            <th className="text-right py-3 px-2 text-xs font-bold uppercase w-28" style={{ color: theme.primary }}>Price</th>
            <th className="text-right py-3 px-2 text-xs font-bold uppercase w-32" style={{ color: theme.primary }}>Amount</th>
            <th className="print:hidden w-8"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 group hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.id} className="py-2 px-2 align-top">
                  {col.type === 'select' ? (
                    <select value={item[col.id] || ''} onChange={(e) => handleChange(item.id, col.id, e.target.value)} className="w-full bg-transparent focus:outline-none text-sm appearance-none cursor-pointer text-gray-700">
                      <option value="">Select...</option>
                      {potOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <textarea rows={1} value={item[col.id] || ''} onChange={(e) => handleChange(item.id, col.id, e.target.value)} className="w-full bg-transparent focus:outline-none text-sm resize-none overflow-hidden text-gray-700" onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} />
                  )}
                </td>
              ))}
              <td className="py-2 px-2 align-top"><input type="number" value={item.qty} onChange={(e) => handleChange(item.id, 'qty', parseFloat(e.target.value))} className="w-full text-center bg-transparent focus:outline-none text-sm font-mono text-gray-700"/></td>
              <td className="py-2 px-2 align-top text-right font-mono text-sm"><input type="number" value={item.price} onChange={(e) => handleChange(item.id, 'price', parseFloat(e.target.value))} className="w-full text-right bg-transparent focus:outline-none text-gray-700"/></td>
              <td className="py-2 px-2 align-top text-right font-mono text-sm font-bold" style={{ color: theme.headerText }}>{( (item.qty || 0) * (item.price || 0) ).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
              <td className="print:hidden py-2 text-center align-top"><button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addItem} className="mt-4 flex items-center gap-1 text-xs font-bold uppercase transition print:hidden" style={{ color: theme.primary }}><Plus size={14} /> Add Item</button>
    </>
  );
};

export default InvoiceTable;