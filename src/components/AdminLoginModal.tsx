import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, X, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  currentPin: string;
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  currentPin,
  isOpen,
  onSuccess,
  onClose
}) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === currentPin.trim()) {
      setError('');
      setPinInput('');
      onSuccess();
    } else {
      setError('PIN Admin salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400 ring-1 ring-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Autentikasi Admin
              </h3>
              <p className="text-[11px] text-slate-400">
                Akses Menu Khusus Manajemen & Ekspor Data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-700" />
              Masukkan PIN Administrator
            </label>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                autoFocus
                maxLength={12}
                placeholder="PIN Keamanan..."
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white font-mono tracking-wider ${
                  error
                    ? 'border-rose-400 focus:ring-rose-100 ring-1 ring-rose-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-amber-600" />
              Area Khusus Penyelenggara:
            </div>
            <p>
              Menu ekspor data, unduh file CSV, dan PDF resmi bertanda tangan disimpan khusus di panel ini untuk menjaga privasi data peserta.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
            >
              Masuk Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
