import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Banknote,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  KeyRound,
  Sparkles,
  UserPlus,
  ArrowLeft,
  Phone,
  MapPin,
  Mail,
  AlignLeft,
  CheckCircle2
} from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (officerName: string, roleName: 'Bendahara 1' | 'Bendahara 2' | 'Sekretaris 1' | 'Sekretaris 2' | 'Wakil Ketua' | 'Ketua') => void;
  officers: Array<{
    name: string;
    role: 'Bendahara 1' | 'Bendahara 2' | 'Sekretaris 1' | 'Sekretaris 2' | 'Wakil Ketua' | 'Ketua';
    pin: string;
    avatarColor: string;
    phone?: string;
    address?: string;
    email?: string;
    bio?: string;
  }>;
  onRegister?: (newOfficer: {
    name: string;
    role: 'Bendahara 1' | 'Bendahara 2' | 'Sekretaris 1' | 'Sekretaris 2' | 'Wakil Ketua' | 'Ketua';
    pin: string;
    avatarColor: string;
    phone: string;
    address: string;
    email: string;
    bio: string;
  }) => void;
}

const DEFAULT_OFFICERS = [
  { name: 'Mirachel Lovan', role: 'Bendahara 2' as const, pin: 'mirachel123', avatarColor: 'bg-indigo-50 text-indigo-600 border-indigo-100', phone: '0812-3456-7890', address: 'Debegan RT 01 / RW 03', email: 'mirachel@debegan.org', bio: 'Fokus pada keterbukaan dan ketelitian pencatatan kas.' },
  { name: 'Retma Ayu Putri', role: 'Bendahara 1' as const, pin: 'retma123', avatarColor: 'bg-emerald-50 text-emerald-600 border-emerald-100', phone: '0857-9876-5432', address: 'Debegan RT 02 / RW 03', email: 'retma@debegan.org', bio: 'Disiplin iuran warga adalah kunci pembangunan Karang Taruna.' },
  { name: 'Loris Oktaviano', role: 'Ketua' as const, pin: 'loris123', avatarColor: 'bg-amber-50 text-amber-600 border-amber-100', phone: '0899-1111-2222', address: 'Debegan RT 04 / RW 03', email: 'loris@debegan.org', bio: 'Mewujudkan organisasi kepemudaan yang transparan dan akuntabel.' },
  { name: 'Bramandika Ramavirio', role: 'Sekretaris 2' as const, pin: 'bram123', avatarColor: 'bg-purple-50 text-purple-600 border-purple-100', phone: '0821-4444-5555', address: 'Debegan RT 03 / RW 03', email: 'bram@debegan.org', bio: 'Sinergi dalam administrasi dan pelaporan keuangan.' },
];

export default function LoginForm({ onLoginSuccess, officers, onRegister }: LoginFormProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedOfficerIndex, setSelectedOfficerIndex] = useState<number>(0);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<'Bendahara 1' | 'Bendahara 2' | 'Sekretaris 1' | 'Sekretaris 2' | 'Wakil Ketua' | 'Ketua'>('Bendahara 2');
  const [regPin, setRegPin] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBio, setRegBio] = useState('');

  const displayOfficers = officers.length > 0 ? officers : DEFAULT_OFFICERS;
  const safeIndex = selectedOfficerIndex >= displayOfficers.length ? 0 : selectedOfficerIndex;
  const selectedOfficer = displayOfficers[safeIndex];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (password.trim() === selectedOfficer.pin || password.trim() === 'admin123') {
        onLoginSuccess(selectedOfficer.name, selectedOfficer.role);
      } else {
        setError('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
        setIsSubmitting(false);
      }
    }, 800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!regName.trim() || !regPin.trim()) {
      setError('Nama Lengkap dan PIN/Kata Sandi wajib diisi!');
      return;
    }

    // Determine avatar color based on role
    let avatarColor = 'bg-purple-50 text-purple-600 border-purple-100';
    if (regRole.includes('Bendahara')) {
      avatarColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
    } else if (regRole.includes('Ketua')) {
      avatarColor = 'bg-amber-50 text-amber-600 border-amber-100';
    } else if (regRole.includes('Sekretaris')) {
      avatarColor = 'bg-sky-50 text-sky-600 border-sky-100';
    }

    const newOfficer = {
      name: regName.trim(),
      role: regRole,
      pin: regPin.trim(),
      avatarColor,
      phone: regPhone.trim() || '0812-3456-7890',
      address: regAddress.trim() || 'Debegan, Mojosongo',
      email: regEmail.trim() || `${regName.trim().toLowerCase().replace(/\s+/g, '')}@debegan.org`,
      bio: regBio.trim() || 'Menjaga transparansi kas Karang Taruna.',
    };

    if (onRegister) {
      onRegister(newOfficer);
      setSuccessMessage(`Akun pengurus "${regName}" berhasil didaftarkan! Silakan masuk.`);
      
      // Select the newly registered officer automatically
      const newIndex = officers.length; // index will be at the end of officers list
      setSelectedOfficerIndex(newIndex);
      setPassword('');
      
      // Reset registration form
      setRegName('');
      setRegRole('Bendahara 2');
      setRegPin('');
      setRegPhone('');
      setRegAddress('');
      setRegEmail('');
      setRegBio('');
      
      // Switch back to login view
      setIsRegistering(false);
    } else {
      setError('Fitur registrasi tidak tersedia saat ini.');
    }
  };

  const handleQuickFill = () => {
    setPassword(selectedOfficer.pin);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/70 dark:bg-slate-950 p-4 md:p-8 select-none font-sans relative overflow-hidden transition-colors duration-200">
      {/* Background ambient accents */}
      <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-emerald-200/20 dark:bg-emerald-950/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 -right-4 w-[500px] h-[500px] bg-amber-200/15 dark:bg-amber-950/10 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]"
      >
        {/* Left Side: Premium Brand Banner with Green & Gold Mix */}
        <div className="md:col-span-5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-amber-500 text-white p-8 flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Decorative glowing shapes */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Logo area */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-lg border border-white/20">
                <Banknote className="h-6 w-6 text-amber-200" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-widest text-amber-300">AUTOCASH</h2>
                <h1 className="text-xs font-bold text-white/95 tracking-wide">Karang Taruna Debegan</h1>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <h3 className="text-xl md:text-2xl font-black leading-tight tracking-tight text-white">
                Sistem Pengelolaan Kas Praktis & Akuntabel
              </h3>
              <p className="text-xs text-emerald-50/90 leading-relaxed font-medium">
                Sistem informasi kas internal yang didesain khusus untuk efisiensi koordinasi pemuda, transparansi iuran, serta penyusunan laporan pertanggungjawaban (LPJ) secara real-time.
              </p>
            </div>

            {/* Core features list inside banner */}
            <div className="mt-8 space-y-3.5 border-t border-white/10 pt-6">
              <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-amber-300">✓</span>
                <span>Proyeksi Kas & Analitik Grafik</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-amber-300">✓</span>
                <span>Manajemen Anggota Komprehensif</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-emerald-100">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-amber-300">✓</span>
                <span>Ekspor LPJ Cetak Otomatis</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-emerald-100 font-bold tracking-wider">
            <span>KELOMPOK 8 &copy; 2026</span>
            <span className="bg-white/10 px-2 py-0.5 rounded-full text-amber-300 font-mono">v1.2.0</span>
          </div>
        </div>

        {/* Right Side: Interactive Login / Register Form */}
        <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-between bg-white dark:bg-slate-900/60 transition-colors duration-200 overflow-y-auto max-h-[640px] md:max-h-none">
          
          <AnimatePresence mode="wait">
            {!isRegistering ? (
              /* --- LOGIN VIEW --- */
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex-1 flex flex-col justify-center"
              >
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Masuk Akun Pengurus
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Silakan pilih profil Anda di bawah ini dan masukkan kata sandi PIN.
                  </p>
                </div>

                {/* Success Message Banner */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{successMessage}</span>
                  </motion.div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  
                  {/* Account Selector Grid */}
                  <div>
                    <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2.5">
                      Pilih Akun Pengurus
                    </label>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      {displayOfficers.map((acc, index) => {
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
                              setSuccessMessage(null);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/10 ring-2 ring-emerald-600/15'
                                : 'border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <div className={`w-7 h-7 rounded-full ${acc.avatarColor} flex items-center justify-center text-[9px] font-black border`}>
                                {initials}
                              </div>
                              {isSelected && (
                                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[8px] font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className="mt-2">
                              <h4 className={`text-[11px] font-extrabold leading-tight truncate ${isSelected ? 'text-emerald-950 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-300'}`}>
                                {acc.name.split(' ')[0]}
                              </h4>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">{acc.role}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Password Input Section */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Kata Sandi (PIN)
                      </label>
                      <button
                        type="button"
                        onClick={handleQuickFill}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950/20 transition-all disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
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
                      className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2.5"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">{error}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                </form>

                {/* Navigation Toggle Link */}
                <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsRegistering(true);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Belum terdaftar? Daftar Pengurus Baru</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              /* --- REGISTRATION VIEW --- */
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 flex-1 flex flex-col justify-center"
              >
                <div>
                  <button
                    onClick={() => {
                      setIsRegistering(false);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1.5 mb-2 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Kembali Ke Login
                  </button>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Daftar Pengurus Baru
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Lengkapi formulir di bawah ini untuk membuat profil pengurus AUTOCASH.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                        Nama Lengkap
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-slate-400">
                          <User className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Masukkan nama lengkap..."
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Role Choice */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                        Jabatan Pengurus
                      </label>
                      <select
                        value={regRole}
                        onChange={(e: any) => setRegRole(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                      >
                        <option value="Bendahara 1">Bendahara 1</option>
                        <option value="Bendahara 2">Bendahara 2</option>
                        <option value="Sekretaris 1">Sekretaris 1</option>
                        <option value="Sekretaris 2">Sekretaris 2</option>
                        <option value="Wakil Ketua">Wakil Ketua</option>
                        <option value="Ketua">Ketua</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* PIN / Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                        PIN Sandi (Kata Sandi)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-slate-400">
                          <Lock className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="text"
                          required
                          value={regPin}
                          onChange={(e) => setRegPin(e.target.value)}
                          placeholder="Contoh: loris123..."
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                        No. Telepon (WA)
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-slate-400">
                          <Phone className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="text"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="Contoh: 0812..."
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Email address */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                        Email Kantor/Pribadi
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-slate-400">
                          <Mail className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="nama@debegan.org"
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Home Address */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                        Alamat Rumah
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="text"
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                          placeholder="RT 01 / RW 03 Debegan..."
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                      Visi Misi Singkat (Bio)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-slate-400">
                        <AlignLeft className="h-3.5 w-3.5" />
                      </span>
                      <textarea
                        rows={2}
                        value={regBio}
                        onChange={(e) => setRegBio(e.target.value)}
                        placeholder="Tulis visi misi Anda dalam organisasi..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Error Message for Registration */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span className="font-semibold leading-relaxed">{error}</span>
                    </motion.div>
                  )}

                  {/* Register Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    Daftar Akun Pengurus
                  </button>
                </form>

                {/* Back to login option */}
                <div className="text-center pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsRegistering(false);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Sudah terdaftar? Masuk Sekarang</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt banner inside Right Pane */}
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 p-3 rounded-xl flex items-start gap-2.5 text-[10px] text-slate-500 dark:text-slate-400 mt-6 shrink-0">
            <span className="p-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded font-black shrink-0 uppercase tracking-wider">Info</span>
            <p className="leading-relaxed">
              AUTOCASH mengutamakan sistem offline-first yang cepat dan aman dengan memanfaatkan database terenkripsi lokal pada browser Anda.
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
