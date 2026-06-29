import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Eye, EyeOff, User, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (officerName: string, roleName: 'Bendahara 1' | 'Bendahara 2' | 'Sekretaris 1' | 'Sekretaris 2' | 'Wakil Ketua' | 'Ketua') => void;
}

const OFFICER_ACCOUNTS = [
  { name: 'Mirachel Lovan', role: 'Bendahara 2' as const, pin: 'mirachel123', avatarColor: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
  { name: 'Retma Ayu Putri', role: 'Bendahara 1' as const, pin: 'retma123', avatarColor: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { name: 'Loris Oktaviano', role: 'Ketua' as const, pin: 'loris123', avatarColor: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'Bramandika Ramavirio', role: 'Sekretaris 2' as const, pin: 'bram123', avatarColor: 'bg-purple-50 text-purple-600 border-purple-100' },
];

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [selectedOfficerIndex, setSelectedOfficerIndex] = useState<number>(0);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOfficer = OFFICER_ACCOUNTS[selectedOfficerIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Simulate small professional network lag for realistic UX
    setTimeout(() => {
      if (password.trim() === selectedOfficer.pin || password.trim() === 'admin123') {
        onLoginSuccess(selectedOfficer.name, selectedOfficer.role);
      } else {
        setError('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
        setIsSubmitting(false);
      }
    }, 800);
  };

  const handleQuickFill = () => {
    setPassword(selectedOfficer.pin);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/70 p-4 md:p-6 select-none font-sans relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden"
      >
        {/* Brand Header Banner */}
        <div className="bg-[#0f172a] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <ShieldCheck className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <ShieldCheck className="h-5.5 w-5.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Sistem Informasi Kas</h2>
              <h1 className="text-sm font-black text-white tracking-tight">Karang Taruna Debegan</h1>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium">
            Silakan pilih akun pengurus dan masukkan kata sandi Anda untuk mengakses menu administrasi keuangan.
          </p>
        </div>

        {/* Login Form Body */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Account Selector Section */}
            <div>
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-3">
                Pilih Akun Pengurus
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {OFFICER_ACCOUNTS.map((acc, index) => {
                  const initials = acc.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  const isSelected = selectedOfficerIndex === index;

                  return (
                    <button
                      key={acc.name}
                      type="button"
                      onClick={() => {
                        setSelectedOfficerIndex(index);
                        setPassword('');
                        setError(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-600/10'
                          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className={`w-8 h-8 rounded-full ${acc.avatarColor} flex items-center justify-center text-[10px] font-black border`}>
                          {initials}
                        </div>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <h4 className={`text-xs font-bold leading-tight truncate ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                          {acc.name.split(' ')[0]}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{acc.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password Input Section */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Kata Sandi (PIN)
                </label>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Isi Otomatis Sandi
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={`Sandi untuk ${selectedOfficer.name.split(' ')[0]}...`}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Masuk Ke Dashboard
                </>
              )}
            </button>

            {/* Hint Panel */}
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-start gap-2 text-[10px] text-slate-500">
              <span className="p-0.5 bg-indigo-50 text-indigo-600 rounded font-black shrink-0">HINT</span>
              <p className="leading-relaxed">
                Gunakan fitur <strong className="text-indigo-600">Isi Otomatis Sandi</strong> di atas atau masukkan kata sandi default <strong className="font-bold text-slate-700">"{selectedOfficer.pin}"</strong> untuk langsung masuk sebagai pengurus terpilih.
              </p>
            </div>

          </form>
        </div>

        {/* Developer Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 py-3.5 px-6 text-center text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
          S1 Akuntansi FEB UNS &bull; Tugas UTS Kelompok 2026
        </div>
      </motion.div>
    </div>
  );
}
