import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, Smartphone, Globe } from 'lucide-react';

export default function ConnectPage() {
  const [copied, setCopied] = useState(false);
  const registerUrl = `${window.location.origin}/register`;

  const handleCopy = () => {
    navigator.clipboard.writeText(registerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center space-y-6 border border-slate-700">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl mx-auto p-0.5 shadow-lg flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-emerald-400" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">MINDORA</h1>
          <p className="text-xs text-emerald-600 font-bold tracking-widest uppercase mt-1">
            MOBILE OPERATOR QR CONNECT
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Scan this QR code with any Android phone, iPhone, or tablet to open the visitor registration interface.
          </p>
        </div>

        {/* QR Code Graphic Container */}
        <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl inline-block shadow-inner">
          <QRCodeSVG
            value={registerUrl}
            size={220}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: '/assets/mindora-logo.svg',
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true
            }}
          />
        </div>

        <div className="space-y-3">
          <div className="text-xs text-slate-400 font-mono break-all bg-slate-100 p-3 rounded-xl border border-slate-200 text-slate-700">
            {registerUrl}
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow transition flex items-center justify-center space-x-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>LINK COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY REGISTRATION LINK</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
