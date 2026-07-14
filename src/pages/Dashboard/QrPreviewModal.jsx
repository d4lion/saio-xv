import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import QRCode from 'qrcode';

export default function QrPreviewModal({
  isOpen,
  onClose,
  previewCode,
  onDownloadQr,
  onCopyLink
}) {
  const [qrSrc, setQrSrc] = useState('');

  useEffect(() => {
    if (isOpen && previewCode) {
      const url = `${window.location.origin}/mis-puntos?code=${previewCode.id}`;
      QRCode.toDataURL(url, { width: 350, margin: 1 })
        .then(dataUrl => setQrSrc(dataUrl))
        .catch(err => console.error("Error generating QR code:", err));
    }
  }, [isOpen, previewCode]);

  if (!isOpen || !previewCode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl relative text-gray-900">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-gray-150 p-6 text-center bg-gray-50">
          <h3 className="font-heading font-extrabold text-lg text-gray-900">
            Proyección de Código QR
          </h3>
          <span className="text-xs text-blue-600 font-mono font-bold tracking-widest uppercase block mt-1">
            {previewCode.id}
          </span>
        </div>

        <div className="p-6 flex flex-col items-center space-y-6">
          {/* QR Frame */}
          <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-200 relative group">
            {qrSrc ? (
              <img 
                src={qrSrc}
                alt={`QR Code for ${previewCode.id}`}
                className="w-64 h-64 select-none object-contain"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-xs text-gray-400">
                Generando QR...
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl border border-gray-100 pointer-events-none"></div>
          </div>

          <div className="text-center space-y-2 w-full">
            <p className="text-sm font-semibold text-gray-800">
              Valor: <span className="text-blue-600 font-mono">+{previewCode.puntos} Puntos Estelares</span>
            </p>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center select-all">
              <code className="text-xs text-gray-600 font-mono break-all font-medium">
                {window.location.origin}/mis-puntos?code={previewCode.id}
              </code>
            </div>
          </div>

          <div className="w-full border-t border-gray-150 pt-4 flex flex-col gap-2 bg-gray-50 -mx-6 -mb-6 p-6">
            <button
              type="button"
              onClick={() => onDownloadQr(previewCode.id)}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-sm"
            >
              Descargar Código QR (PNG)
            </button>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onCopyLink(previewCode.id)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold font-heading cursor-pointer transition-all duration-200 shadow-sm"
              >
                Copiar Enlace
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold font-heading cursor-pointer transition-all duration-200 shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
