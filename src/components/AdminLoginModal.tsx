import React, { useState } from 'react';
import { ShieldCheck, Lock, X, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { adminLoginApi, setAdminToken } from '../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [passkey, setPasskey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setErrorMessage('Please enter the administrator passcode.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await adminLoginApi(passkey.trim());
      if (res.token) {
        setAdminToken(res.token);
      }
      setPasskey('');
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your admin passcode.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 border border-stone-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-stone-700 transition-colors"
          aria-label="Close admin login modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-3 border border-rose-100 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Administrator Access
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Protected management console for catalog curation, outbound analytics, and store settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Admin Passcode:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passkey}
                disabled={isSubmitting}
                onChange={e => {
                  setPasskey(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter server admin passcode..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:ring-2 focus:ring-rose-700 focus:outline-none disabled:bg-stone-50"
                autoFocus
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 leading-relaxed">
            <span className="font-semibold text-stone-800">Production Security:</span> Admin operations are authenticated against the server's <code className="font-mono font-bold text-rose-800">ADMIN_PASSWORD</code> environment variable. Public visitors browse without credentials.
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !passkey.trim()}
            className="w-full py-3 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Unlock Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
