import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, AlertTriangle, XCircle, RefreshCw, Layers } from 'lucide-react';
import api from '../../api/axios';

const QRScanner = ({ onClose, selectedEventId, hostedEvents }) => {
  const [activeEventId, setActiveEventId] = useState(selectedEventId || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { status: 'success' | 'warning' | 'error', message: '', name: '' }
  const [errorMsg, setErrorMsg] = useState('');
  const [processing, setProcessing] = useState(false);

  const scannerRef = useRef(null);
  const scannerId = "qr-reader-element";

  useEffect(() => {
    // Initialize html5QrCode instance
    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    // Auto-start scanning when component mounts
    startScanning(html5QrCode);

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Clean up stop error:", err));
      }
    };
  }, []);

  const startScanning = async (scannerInstance = scannerRef.current) => {
    if (!scannerInstance) return;
    setErrorMsg('');
    setScanResult(null);

    try {
      await scannerInstance.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        },
        onScanSuccess,
        (errorMessage) => {
          // Silent failure for frame mismatch to avoid clutter
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Camera access failed. Ensure permission is granted.");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Stop scanning error:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText) => {
    // 3. The Validation Pipeline
    // Immediately pause scanning feed
    await stopScanning();
    setProcessing(true);

    try {
      let payload;
      try {
        payload = JSON.parse(decodedText);
      } catch (e) {
        // Fallback for raw registration ID strings
        payload = { registrationId: decodedText, eventId: activeEventId };
      }

      const { eventId, registrationId } = payload;

      if (!registrationId) {
        setScanResult({
          status: 'error',
          message: 'Invalid Ticket or Unauthorized Event.'
        });
        setProcessing(false);
        return;
      }

      // Check if ticket is for the selected event
      const targetEventId = eventId || activeEventId;
      if (targetEventId !== activeEventId) {
        setScanResult({
          status: 'error',
          message: 'Invalid Ticket or Unauthorized Event.'
        });
        setProcessing(false);
        return;
      }

      // Axios POST to checkInUser endpoint: /api/events/:eventId/checkin/:registrationId
      const response = await api.post(`/events/${targetEventId}/checkin/${registrationId}`);

      if (response.status === 200 && response.data) {
        // Success
        setScanResult({
          status: 'success',
          message: `Hacker ${response.data.attendee.name} Verified & Checked In.`,
          name: response.data.attendee.name
        });
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || '';
      
      if (errMsg.includes('already checked in') || err.response?.status === 400 && errMsg.includes('WARNING')) {
        // Warning: already scanned
        setScanResult({
          status: 'warning',
          message: 'Alert: Ticket Already Scanned.'
        });
      } else {
        // Error: invalid or mismatch
        setScanResult({
          status: 'error',
          message: 'Invalid Ticket or Unauthorized Event.'
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleScanNext = () => {
    startScanning();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-[#08070d] border border-[rgba(175,172,202,0.15)] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(175,172,202,0.1)]">
          <div className="flex items-center gap-2">
            <Camera className="text-[#afacca]" size={18} />
            <span className="font-display font-bold text-[#f7f6f0]">Check-In Scanner</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg border border-[rgba(175,172,202,0.1)] bg-[#595388]/10 hover:bg-[#595388]/20 transition-all text-[#afacca] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Event Selector inside Scanner */}
        <div className="p-4 bg-[#595388]/5 border-b border-[rgba(175,172,202,0.08)] flex flex-col gap-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-[#afacca] flex items-center gap-1">
            <Layers size={10} /> Validating Event Mode
          </label>
          <select
            value={activeEventId}
            onChange={(e) => {
              setActiveEventId(e.target.value);
              setScanResult(null);
              if (!isScanning && !processing) {
                startScanning();
              }
            }}
            className="input-field text-xs bg-[#08070d] py-1.5 w-full pr-10"
          >
            {hostedEvents.map(e => (
              <option key={e._id} value={e._id}>{e.title}</option>
            ))}
          </select>
        </div>

        {/* Scanner Body */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center relative min-h-[300px]">
          {/* QR Viewfinder container */}
          <div className={`w-full aspect-square max-w-[280px] rounded-xl overflow-hidden bg-black border border-[rgba(175,172,202,0.1)] relative ${!isScanning && 'opacity-40'}`}>
            <div id={scannerId} className="w-full h-full object-cover"></div>
            
            {/* Viewfinder crosshairs */}
            {isScanning && (
              <div className="absolute inset-0 border-[2px] border-dashed border-[#afacca]/40 pointer-events-none rounded-xl m-4 animate-pulse"></div>
            )}
          </div>

          {/* Camera Access Error */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs text-center">
              {errorMsg}
              <button 
                onClick={() => startScanning()}
                className="block mx-auto mt-2 text-white underline font-semibold"
              >
                Retry Camera
              </button>
            </div>
          )}

          {/* processing loader */}
          {processing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-[#afacca]" size={28} />
              <span className="text-xs text-[#afacca] font-semibold">Validating Ticket...</span>
            </div>
          )}

          {/* Real-Time Visual Feedback State-driven */}
          {scanResult && (
            <div className="absolute inset-0 bg-[#08070d]/95 p-6 flex flex-col items-center justify-center text-center">
              {scanResult.status === 'success' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-lg text-emerald-400">Success</h4>
                    <p className="text-sm text-[#f7f6f0] px-4 font-medium">{scanResult.message}</p>
                  </div>
                </div>
              )}

              {scanResult.status === 'warning' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <AlertTriangle size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-lg text-amber-400">Double Entry</h4>
                    <p className="text-sm text-[#f7f6f0] px-4 font-medium">{scanResult.message}</p>
                  </div>
                </div>
              )}

              {scanResult.status === 'error' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                    <XCircle size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-lg text-red-400">Scan Failed</h4>
                    <p className="text-sm text-[#f7f6f0] px-4 font-medium">{scanResult.message}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleScanNext}
                className="mt-8 px-6 py-2.5 rounded-xl bg-[#595388] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#68619d] transition-all"
              >
                Scan Next Ticket
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-[rgba(175,172,202,0.08)] bg-black/40 text-[10px] text-[#afacca]/60 text-center">
          Place QR Code within viewfinder box to capture.
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
