import React, { useState } from 'react';
import { X, Trash2, Palette, Layout, Eye } from 'lucide-react';

const SettingsModal = ({ close, data, actions }) => {
  const [activeTab, setActiveTab] = useState('branding'); // Default to branding
  
  const { potOptions, columns, visibility, theme } = data;
  const { setPotOptions, setColumns, setVisibility, setTheme } = actions;

  // Helpers
  const addColumn = () => setColumns([...columns, { id: `col_${Date.now()}`, label: 'New', type: 'text' }]);
  const removeColumn = (id) => setColumns(columns.filter(col => col.id !== id));
  const renameColumn = (id, val) => setColumns(columns.map(c => c.id === id ? { ...c, label: val } : c));
  const changeType = (id, val) => setColumns(columns.map(c => c.id === id ? { ...c, type: val } : c));
  const toggleVis = (k) => setVisibility(prev => ({ ...prev, [k]: !prev[k] }));
  const handleColor = (key, val) => setTheme(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center print:hidden font-sans">
      <div className="bg-white rounded-xl w-[600px] max-w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Invoice Settings</h2>
          <button onClick={close}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex border-b bg-gray-50">
          {[
            { id: 'branding', icon: <Palette size={16}/>, label: 'Colors' },
            { id: 'columns', icon: <Layout size={16}/>, label: 'Columns' },
            { id: 'visibility', icon: <Eye size={16}/>, label: 'Visibility' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2
                ${activeTab === tab.id ? 'bg-white border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-100'}
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB: BRANDING (COLORS) */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Primary Color</label>
                   <div className="flex items-center gap-2 border p-2 rounded-lg">
                     <input type="color" value={theme.primary} onChange={(e) => handleColor('primary', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"/>
                     <span className="text-sm font-mono text-gray-600">{theme.primary}</span>
                   </div>
                   <p className="text-[10px] text-gray-400 mt-1">Used for Borders, Accents, and Buttons.</p>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Text Color (Headings)</label>
                   <div className="flex items-center gap-2 border p-2 rounded-lg">
                     <input type="color" value={theme.headerText} onChange={(e) => handleColor('headerText', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"/>
                     <span className="text-sm font-mono text-gray-600">{theme.headerText}</span>
                   </div>
                   <p className="text-[10px] text-gray-400 mt-1">Used for Company Name & Client Name.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Secondary / Background Tint</label>
                <div className="flex gap-4">
                  {['#f0fdf4', '#eff6ff', '#fff7ed', '#fdf2f8', '#f8fafc', '#ffffff'].map(color => (
                    <button 
                      key={color}
                      onClick={() => handleColor('secondary', color)}
                      className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110 ${theme.secondary === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Background color for table headers and stripes.</p>
              </div>
            </div>
          )}

          {/* TAB: COLUMNS */}
          {activeTab === 'columns' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="font-bold text-sm text-gray-700">Table Columns</h3>
                 <button onClick={addColumn} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded font-bold hover:bg-blue-100 border border-blue-200">+ Add</button>
              </div>
              {columns.map((col) => (
                <div key={col.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                  <input value={col.label} onChange={(e) => renameColumn(col.id, e.target.value)} className="flex-1 border p-1.5 rounded text-sm"/>
                  <select value={col.type} onChange={(e) => changeType(col.id, e.target.value)} className="border p-1.5 rounded text-sm w-24">
                    <option value="text">Text</option>
                    <option value="select">Dropdown</option>
                  </select>
                  <button onClick={() => removeColumn(col.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                </div>
              ))}
              
              <div className="mt-6 border-t pt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Dropdown Options (Size/Pot)</label>
                <textarea className="w-full border p-2 rounded h-24 font-mono text-sm" value={potOptions.join('\n')} onChange={(e) => setPotOptions(e.target.value.split('\n'))} />
              </div>
            </div>
          )}

          {/* TAB: VISIBILITY */}
          {activeTab === 'visibility' && (
            <div className="space-y-2">
               {Object.keys(visibility).map(key => (
                 <label key={key} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <span className="capitalize font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <input type="checkbox" checked={visibility[key]} onChange={() => toggleVis(key)} className="w-5 h-5 accent-blue-600"/>
                 </label>
               ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button onClick={close} className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700">Done</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;