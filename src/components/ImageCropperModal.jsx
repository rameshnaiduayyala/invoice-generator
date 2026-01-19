import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage'; // Import the utility we just made

const ImageCropperModal = ({ imageSrc, onCancel, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onSave(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 print:hidden">
      <div className="bg-white p-4 rounded-lg w-[90vw] max-w-lg shadow-2xl">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Adjust Logo</h3>
        
        {/* Cropper Container */}
        <div className="relative h-64 w-full bg-gray-200 rounded-md overflow-hidden mb-4">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Force 1:1 Square aspect ratio
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className="mb-6 px-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;