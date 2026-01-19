import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Upload, PenTool, Trash2, Check } from 'lucide-react';

const SignatureModal = ({ isOpen, onClose, onSave, existingSignature }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('draw'); // 'draw' or 'upload'
  const sigCanvas = useRef({});
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  // --- Handlers ---

  const clearCanvas = () => {
    sigCanvas.current.clear();
  };

const handleSaveCanvas = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Please sign before saving.");
      return;
    }
    
    // FIX: Use .getCanvas() instead of .getTrimmedCanvas() to avoid the crash
    const dataURL = sigCanvas.current.getCanvas().toDataURL('image/png');
    
    onSave(dataURL);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUpload = () => {
    if (uploadedImage) {
      onSave(uploadedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-800">Add Signature</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 bg-gray-50 border-b">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'draw' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <PenTool size={16} /> Draw
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'upload' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Upload size={16} /> Upload
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 bg-gray-100 flex-1 flex flex-col items-center justify-center min-h-[300px]">
          
          {/* DRAW TAB */}
          {activeTab === 'draw' && (
            <div className="w-full flex flex-col gap-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm hover:border-blue-400 transition-colors">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{
                    className: "w-full h-48 cursor-crosshair",
                    style: { width: '100%', height: '200px' } 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 px-1">
                <span>Sign above</span>
                <button onClick={clearCanvas} className="text-red-500 hover:underline flex items-center gap-1">
                  <Trash2 size={12} /> Clear
                </button>
              </div>
              <button 
                onClick={handleSaveCanvas}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Check size={18} /> Apply Signature
              </button>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="w-full flex flex-col gap-3 text-center">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg bg-white h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition"
                onClick={() => fileInputRef.current.click()}
              >
                {uploadedImage || existingSignature ? (
                  <img 
                    src={uploadedImage || existingSignature} 
                    alt="Preview" 
                    className="h-full w-full object-contain p-2" 
                  />
                ) : (
                  <>
                    <Upload size={32} className="text-gray-300 mb-2" />
                    <span className="text-sm font-bold text-gray-500">Click to Upload Image</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </div>
              
              <button 
                onClick={handleSaveUpload}
                disabled={!uploadedImage}
                className={`w-full mt-4 py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition ${
                  uploadedImage 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Check size={18} /> Use This Image
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SignatureModal;