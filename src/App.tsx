import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Wallet,
  Users,
  FileText,
  MessageSquare,
  History,
  ShieldCheck,
  Menu,
  X,
  Bell,
  Clock,
  User,
  LogOut,
  ChevronDown,
  Plus,
  Trash2,
  Edit,
  Phone,
  MapPin,
  Mail,
  AlertTriangle,
  ChevronUp,
  Sun,
  Moon
} from 'lucide-react';

// Sub-components
import DashboardOverview from './components/DashboardOverview';
import TransactionManager from './components/TransactionManager';
import MemberManager from './components/MemberManager';
import ReportLPJ from './components/ReportLPJ';
import AuditLogViewer from './components/AuditLogViewer';
import CommunicationForum from './components/CommunicationForum';
import LoginForm from './components/LoginForm';
import MemberDetailModal from './components/MemberDetailModal';

// Dummy initial data
import {
  INITIAL_TRANSACTIONS,
  INITIAL_MEMBERS,
  INITIAL_ACTIVITIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_FORUM_MESSAGES,
} from './data';

import { Transaction, Member, Activity, AuditLog, ForumMessage } from './types';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic Live Time from local device
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format the time as Indonesian locale
  const formattedDateTime = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) + ' • ' + currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }).replace('.', ':') + ' WIB';

  // Authentication State with LocalStorage persistence
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('kt_is_logged_in') === 'true';
  });

  const [currentOfficer, setCurrentOfficer] = useState<string>(() => {
    return localStorage.getItem('kt_current_officer') || 'Mirachel Lovan';
  });

  const [currentRole, setCurrentRole] = useState<'Bendahara 1' | 'Bendahara 2' | 'Sekretaris 1' | 'Sekretaris 2' | 'Wakil Ketua' | 'Ketua'>(() => {
    return (localStorage.getItem('kt_current_role') as any) || 'Bendahara 2';
  });

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Dynamic Officers List (Add, Edit, Delete Profiles)
  const [officers, setOfficers] = useState(() => {
    const saved = localStorage.getItem('kt_officers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure legacy elements have basic fields
        return parsed.map((o: any) => ({
          name: o.name || '',
          role: o.role || 'Bendahara 2',
          pin: o.pin || '',
          avatarColor: o.avatarColor || 'bg-indigo-50 text-indigo-600 border-indigo-100',
          phone: o.phone || '0812-3456-7890',
          address: o.address || 'Debegan, Mojosongo',
          email: o.email || `${o.name?.toLowerCase().replace(/\s+/g, '') || 'pengurus'}@debegan.org`,
          bio: o.bio || 'Menjaga transparansi kas Karang Taruna.',
        }));
      } catch (e) {
        // fallback
      }
    }
    const defaultOfficers = [
      { name: 'Mirachel Lovan', role: 'Bendahara 2' as const, pin: 'mirachel123', avatarColor: 'bg-indigo-50 text-indigo-600 border-indigo-100', phone: '0812-3456-7890', address: 'Debegan RT 01 / RW 03', email: 'mirachel@debegan.org', bio: 'Fokus pada keterbukaan dan ketelitian pencatatan kas.' },
      { name: 'Retma Ayu Putri', role: 'Bendahara 1' as const, pin: 'retma123', avatarColor: 'bg-emerald-50 text-emerald-600 border-emerald-100', phone: '0857-9876-5432', address: 'Debegan RT 02 / RW 03', email: 'retma@debegan.org', bio: 'Disiplin iuran warga adalah kunci pembangunan Karang Taruna.' },
      { name: 'Loris Oktaviano', role: 'Ketua' as const, pin: 'loris123', avatarColor: 'bg-amber-50 text-amber-600 border-amber-100', phone: '0899-1111-2222', address: 'Debegan RT 04 / RW 03', email: 'loris@debegan.org', bio: 'Mewujudkan organisasi kepemudaan yang transparan dan akuntabel.' },
      { name: 'Bramandika Ramavirio', role: 'Sekretaris 2' as const, pin: 'bram123', avatarColor: 'bg-purple-50 text-purple-600 border-purple-100', phone: '0821-4444-5555', address: 'Debegan RT 03 / RW 03', email: 'bram@debegan.org', bio: 'Sinergi dalam administrasi dan pelaporan keuangan.' },
    ];
    localStorage.setItem('kt_officers', JSON.stringify(defaultOfficers));
    return defaultOfficers;
  });

  // Profile Management Modal State
  const [showManageProfilesModal, setShowManageProfilesModal] = useState(false);
  const [profileActionType, setProfileActionType] = useState<'list' | 'add' | 'edit'>('list');
  const [editingProfileIndex, setEditingProfileIndex] = useState<number | null>(null);

  // Form fields for profile
  const [formProfileName, setFormProfileName] = useState('');
  const [formProfileRole, setFormProfileRole] = useState<'Bendahara 1' | 'Bendahara 2' | 'Sekretaris 1' | 'Sekretaris 2' | 'Wakil Ketua' | 'Ketua'>('Bendahara 2');
  const [formProfilePin, setFormProfilePin] = useState('');
  const [formProfileColor, setFormProfileColor] = useState('bg-indigo-50 text-indigo-600 border-indigo-100');
  const [formProfilePhone, setFormProfilePhone] = useState('');
  const [formProfileAddress, setFormProfileAddress] = useState('');
  const [formProfileEmail, setFormProfileEmail] = useState('');
  const [formProfileBio, setFormProfileBio] = useState('');
  const [expandedProfileIndex, setExpandedProfileIndex] = useState<number | null>(null);

  // Custom modal messages and dialog confirmations to avoid iframe blocking
  const [profileModalError, setProfileModalError] = useState<string | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const handleLoginSuccess = (officerName: string, roleName: typeof currentRole) => {
    setCurrentOfficer(officerName);
    setCurrentRole(roleName);
    setIsLoggedIn(true);
    localStorage.setItem('kt_is_logged_in', 'true');
    localStorage.setItem('kt_current_officer', officerName);
    localStorage.setItem('kt_current_role', roleName);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('kt_is_logged_in');
    setShowProfileDropdown(false);
  };

  // Core App State (With localStorage backing)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
  const [isPeriodClosed, setIsPeriodClosed] = useState(false);

  // Quick Action Modal Trigger inside Dashboard
  const [addTxTrigger, setAddTxTrigger] = useState(false);

  // Selected Member for detailed modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Theme state for Dark/Light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kt_theme');
    return saved === 'dark';
  });

  // Toggle theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('kt_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('kt_theme', 'light');
    }
  }, [isDarkMode]);

  // Load from LocalStorage
  useEffect(() => {
    const cachedTransactions = localStorage.getItem('kt_transactions');
    const cachedMembers = localStorage.getItem('kt_members');
    const cachedActivities = localStorage.getItem('kt_activities');
    const cachedLogs = localStorage.getItem('kt_audit_logs');
    const cachedMessages = localStorage.getItem('kt_forum_messages');
    const cachedPeriodClosed = localStorage.getItem('kt_is_period_closed');

    if (cachedTransactions) setTransactions(JSON.parse(cachedTransactions));
    else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('kt_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    if (cachedMembers) setMembers(JSON.parse(cachedMembers));
    else {
      setMembers(INITIAL_MEMBERS);
      localStorage.setItem('kt_members', JSON.stringify(INITIAL_MEMBERS));
    }

    if (cachedActivities) setActivities(JSON.parse(cachedActivities));
    else {
      setActivities(INITIAL_ACTIVITIES);
      localStorage.setItem('kt_activities', JSON.stringify(INITIAL_ACTIVITIES));
    }

    if (cachedLogs) setAuditLogs(JSON.parse(cachedLogs));
    else {
      setAuditLogs(INITIAL_AUDIT_LOGS);
      localStorage.setItem('kt_audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
    }

    if (cachedMessages) setForumMessages(JSON.parse(cachedMessages));
    else {
      setForumMessages(INITIAL_FORUM_MESSAGES);
      localStorage.setItem('kt_forum_messages', JSON.stringify(INITIAL_FORUM_MESSAGES));
    }

    if (cachedPeriodClosed) setIsPeriodClosed(JSON.parse(cachedPeriodClosed));
  }, []);

  // Helper to record an audit log
  const handleRecordAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      user: currentOfficer,
      action,
      details,
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('kt_audit_logs', JSON.stringify(updated));
  };

  // Transaction CRUD Handlers
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `T-${Date.now()}`,
    };
    const updated = [tx, ...transactions];
    setTransactions(updated);
    localStorage.setItem('kt_transactions', JSON.stringify(updated));

    handleRecordAuditLog(
      'Tambah Transaksi',
      `Mencatat ${tx.type === 'pemasukan' ? 'pemasukan' : 'pengeluaran'} [${tx.category}] sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.amount)}: "${tx.description}"`
    );
  };

  const handleEditTransaction = (id: string, updatedTx: Omit<Transaction, 'id'>) => {
    const updated = transactions.map((t) => (t.id === id ? { ...updatedTx, id } : t));
    setTransactions(updated);
    localStorage.setItem('kt_transactions', JSON.stringify(updated));

    handleRecordAuditLog(
      'Ubah Transaksi',
      `Memperbarui detail transaksi ${id}: "${updatedTx.description}"`
    );
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('kt_transactions', JSON.stringify(updated));

    if (target) {
      handleRecordAuditLog(
        'Hapus Transaksi',
        `Menghapus log transaksi ${id} senilai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(target.amount)}: "${target.description}"`
      );
    }
  };

  // Member Handlers
  const handleUpdateMemberStatus = (id: string, status: Member['status'], amountPaidDiff: number) => {
    const target = members.find((m) => m.id === id);
    const updated = members.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          status,
          totalPaid: Math.max(m.totalPaid + amountPaidDiff, 0),
          lastPaymentDate: amountPaidDiff > 0 ? new Date().toISOString().split('T')[0] : m.lastPaymentDate,
        };
      }
      return m;
    });
    setMembers(updated);
    localStorage.setItem('kt_members', JSON.stringify(updated));

    if (target) {
      handleRecordAuditLog(
        'Status Iuran',
        `Memperbarui status iuran ${target.name} menjadi [${status}]. Akumulasi kas disetor bertambah ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amountPaidDiff)}`
      );

      // If status changed to Lunas and there is a positive transaction diff, record a matching transaction log!
      if (status === 'Lunas' && amountPaidDiff > 0) {
        handleAddTransaction({
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'),
          type: 'pemasukan',
          category: 'Iuran Rutin',
          amount: amountPaidDiff,
          description: `Penerimaan iuran kas rutin anggota atas nama ${target.name}`,
          createdBy: currentOfficer,
        });
      }
    }
  };

  const handleAddMember = (name: string, phone: string) => {
    const newMember: Member = {
      id: `M-${members.length + 1 < 10 ? '0' : ''}${members.length + 1}`,
      name,
      phone,
      status: 'Belum Lunas',
      totalPaid: 0,
    };
    const updated = [...members, newMember];
    setMembers(updated);
    localStorage.setItem('kt_members', JSON.stringify(updated));

    handleRecordAuditLog(
      'Tambah Anggota',
      `Mendaftarkan "${name}" sebagai anggota baru Karang Taruna Debegan.`
    );
  };

  // Period Closure Handlers
  const handleTogglePeriodLock = () => {
    const nextState = !isPeriodClosed;
    setIsPeriodClosed(nextState);
    localStorage.setItem('kt_is_period_closed', JSON.stringify(nextState));
  };

  const handleUpdateActivities = (updatedActivities: Activity[]) => {
    setActivities(updatedActivities);
    localStorage.setItem('kt_activities', JSON.stringify(updatedActivities));
  };

  // Forum Handlers
  const handleSendMessage = (content: string, role: ForumMessage['role']) => {
    const newMessage: ForumMessage = {
      id: `FORUM-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      author: currentOfficer,
      role,
      content,
    };
    const updated = [...forumMessages, newMessage];
    setForumMessages(updated);
    localStorage.setItem('kt_forum_messages', JSON.stringify(updated));
  };

  // Officer Profile demo selector
  const handleSwitchOfficer = (officerName: string, roleName: typeof currentRole) => {
    setCurrentOfficer(officerName);
    setCurrentRole(roleName);
    setShowProfileDropdown(false);
    localStorage.setItem('kt_current_officer', officerName);
    localStorage.setItem('kt_current_role', roleName);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileModalError(null);
    if (!formProfileName.trim() || !formProfilePin.trim()) {
      setProfileModalError('Nama Lengkap dan Kata Sandi (PIN) tidak boleh kosong.');
      return;
    }

    const newProfile = {
      name: formProfileName.trim(),
      role: formProfileRole,
      pin: formProfilePin.trim(),
      avatarColor: formProfileColor,
      phone: formProfilePhone.trim() || '0812-3456-7890',
      address: formProfileAddress.trim() || 'Debegan, Mojosongo',
      email: formProfileEmail.trim() || `${formProfileName.trim().toLowerCase().replace(/\s+/g, '')}@debegan.org`,
      bio: formProfileBio.trim() || 'Menjaga transparansi kas Karang Taruna.',
    };

    if (officers.some(o => o.name.toLowerCase() === newProfile.name.toLowerCase())) {
      setProfileModalError(`Profil dengan nama "${newProfile.name}" sudah terdaftar.`);
      return;
    }

    const updated = [...officers, newProfile];
    setOfficers(updated);
    localStorage.setItem('kt_officers', JSON.stringify(updated));

    // Audit log
    handleRecordAuditLog(
      'Kelola Profil',
      `Menambahkan profil pengurus baru: "${newProfile.name}" dengan peran [${newProfile.role}].`
    );

    // Reset and return
    setFormProfileName('');
    setFormProfilePin('');
    setFormProfilePhone('');
    setFormProfileAddress('');
    setFormProfileEmail('');
    setFormProfileBio('');
    setProfileActionType('list');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileModalError(null);
    if (editingProfileIndex === null || !formProfileName.trim() || !formProfilePin.trim()) {
      setProfileModalError('Nama Lengkap dan Kata Sandi (PIN) tidak boleh kosong.');
      return;
    }

    const updated = [...officers];
    const oldProfile = updated[editingProfileIndex];
    
    if (officers.some((o, i) => i !== editingProfileIndex && o.name.toLowerCase() === formProfileName.trim().toLowerCase())) {
      setProfileModalError(`Profil dengan nama "${formProfileName.trim()}" sudah terdaftar.`);
      return;
    }

    updated[editingProfileIndex] = {
      ...oldProfile,
      name: formProfileName.trim(),
      role: formProfileRole,
      pin: formProfilePin.trim(),
      avatarColor: formProfileColor,
      phone: formProfilePhone.trim() || '0812-3456-7890',
      address: formProfileAddress.trim() || 'Debegan, Mojosongo',
      email: formProfileEmail.trim() || `${formProfileName.trim().toLowerCase().replace(/\s+/g, '')}@debegan.org`,
      bio: formProfileBio.trim() || 'Menjaga transparansi kas Karang Taruna.',
    };

    setOfficers(updated);
    localStorage.setItem('kt_officers', JSON.stringify(updated));

    // If we updated the currently active profile, update its active session name and role!
    if (oldProfile.name === currentOfficer) {
      setCurrentOfficer(formProfileName.trim());
      setCurrentRole(formProfileRole);
      localStorage.setItem('kt_current_officer', formProfileName.trim());
      localStorage.setItem('kt_current_role', formProfileRole);
    }

    handleRecordAuditLog(
      'Kelola Profil',
      `Memperbarui profil pengurus "${oldProfile.name}" menjadi "${formProfileName.trim()}" [${formProfileRole}].`
    );

    setFormProfileName('');
    setFormProfilePin('');
    setFormProfilePhone('');
    setFormProfileAddress('');
    setFormProfileEmail('');
    setFormProfileBio('');
    setEditingProfileIndex(null);
    setProfileActionType('list');
  };

  const executeDeleteProfile = (index: number) => {
    const profileToDelete = officers[index];
    if (!profileToDelete) return;

    const updated = officers.filter((_, i) => i !== index);
    setOfficers(updated);
    localStorage.setItem('kt_officers', JSON.stringify(updated));

    handleRecordAuditLog(
      'Kelola Profil',
      `Menghapus profil pengurus "${profileToDelete.name}" [${profileToDelete.role}].`
    );

    setDeleteConfirmIndex(null);
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Transaksi', icon: Wallet },
    { name: 'Anggota', icon: Users },
    { name: 'Laporan', icon: FileText },
    { name: 'Koordinasi', icon: MessageSquare },
    { name: 'Log Riwayat', icon: History },
  ];

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} officers={officers} />;
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-slate-900 text-slate-100 dark' : 'bg-slate-50 text-slate-800'} antialiased font-sans transition-colors duration-200`}>
      {/* Sidebar Navigation */}
      <aside
        className={`bg-[#0f172a] text-slate-300 w-64 shrink-0 transition-all fixed inset-y-0 left-0 z-40 lg:sticky lg:top-0 lg:h-screen transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col border-r border-slate-800 print:hidden`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-2 border-b border-slate-800 shrink-0">
          <ShieldCheck className="h-6 w-6 text-indigo-500" />
          <div>
            <h1 className="text-xs font-bold text-white tracking-wide uppercase">Sistem Informasi Kas</h1>
            <p className="text-[10px] text-slate-400 font-medium">Karang Taruna Debegan</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setSidebarOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </button>
            );
          })}

          <div className="border-t border-slate-800 my-2"></div>

          {/* Kelola Profil Action */}
          <button
            onClick={() => {
              setProfileActionType('list');
              setShowManageProfilesModal(true);
              setSidebarOpen(false);
            }}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer text-slate-400 hover:bg-slate-800/60 hover:text-white"
          >
            <User className="h-4.5 w-4.5 text-slate-400" />
            Kelola Profil
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 space-y-1.5 text-center shrink-0">
          <p className="font-bold uppercase tracking-wider text-slate-200">Sistem Kas Karang Taruna</p>
          <p className="text-[11px] text-indigo-300 font-semibold">KELOMPOK 8 &copy; 2026</p>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 print:hidden transition-colors duration-200">
          {/* Menu button for small screens */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Current UTC Time display */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="font-mono text-[11px] font-semibold">{formattedDateTime}</span>
          </div>

          {/* Demo profile switcher / Dropdown */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer flex items-center justify-center"
              title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-slate-600" />}
            </button>

            {/* Officer switcher profile card */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 text-left p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                  {currentOfficer.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    {currentOfficer}
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold">{currentRole}</p>
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg py-2 z-50 text-xs text-slate-700 dark:text-slate-300">
                  <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pilih Akun Pengurus:</p>
                  
                  <div className="max-h-48 overflow-y-auto">
                    {officers.map((off) => (
                      <button
                        key={off.name}
                        onClick={() => handleSwitchOfficer(off.name, off.role)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                          <span className="truncate">{off.name} ({off.role})</span>
                        </div>
                        {currentOfficer === off.name && <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0 ml-1">✓</span>}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                  
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setProfileActionType('list');
                      setShowManageProfilesModal(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <User className="h-4 w-4 text-indigo-500" />
                    <span>Kelola Profil Pengurus</span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>Keluar Sistem</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Sidebar Overlay on small screens */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          ></div>
        )}

        {/* Tab content space */}
        <main className="flex-1 p-6 overflow-y-auto w-full print:p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'Dashboard' && (
                <DashboardOverview
                  transactions={transactions}
                  members={members}
                  activities={activities}
                  onTabChange={setActiveTab}
                  onOpenAddTransaction={() => {
                    setActiveTab('Transaksi');
                    // Set timeout so that child modal has time to catch trigger state
                    setTimeout(() => {
                      const btn = document.querySelector('button[title="Catat Baru"]') as HTMLButtonElement;
                      btn?.click();
                    }, 100);
                  }}
                  onSelectMember={setSelectedMember}
                />
              )}

              {activeTab === 'Transaksi' && (
                <TransactionManager
                  transactions={transactions}
                  activities={activities}
                  onAddTransaction={handleAddTransaction}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  currentOfficer={currentOfficer}
                  isPeriodClosed={isPeriodClosed}
                />
              )}

              {activeTab === 'Anggota' && (
                <MemberManager
                  members={members}
                  onUpdateMemberStatus={handleUpdateMemberStatus}
                  onAddMember={handleAddMember}
                  onRecordLog={handleRecordAuditLog}
                  onSelectMember={setSelectedMember}
                />
              )}

              {activeTab === 'Laporan' && (
                <ReportLPJ
                  transactions={transactions}
                  activities={activities}
                  isPeriodClosed={isPeriodClosed}
                  onTogglePeriodLock={handleTogglePeriodLock}
                  onRecordLog={handleRecordAuditLog}
                  onUpdateActivities={handleUpdateActivities}
                />
              )}

              {activeTab === 'Koordinasi' && (
                <CommunicationForum
                  messages={forumMessages}
                  onSendMessage={handleSendMessage}
                  currentOfficer={currentOfficer}
                />
              )}

              {activeTab === 'Log Riwayat' && (
                <AuditLogViewer logs={auditLogs} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Manage Profiles Modal */}
      <AnimatePresence>
        {showManageProfilesModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-[#0f172a] text-white p-5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold">Kelola Profil Pengurus</h3>
                    <p className="text-[10px] text-slate-400">Tambah, ubah, atau hapus akses pengurus sistem</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowManageProfilesModal(false);
                    setProfileModalError(null);
                    setDeleteConfirmIndex(null);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {profileActionType === 'list' && (
                  <div className="space-y-4">
                    {/* Error Alerts */}
                    {profileModalError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-start gap-2.5 relative">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="pr-5">{profileModalError}</div>
                        <button
                          onClick={() => setProfileModalError(null)}
                          className="absolute top-2.5 right-2.5 text-rose-500 hover:text-rose-800 transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Safe in-app deletion panel */}
                    {deleteConfirmIndex !== null && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs font-semibold space-y-3">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-800">Konfirmasi Hapus Profil</p>
                            <p className="text-slate-600 mt-1">
                              Apakah Anda yakin ingin menghapus profil pengurus <strong className="text-slate-900">"{officers[deleteConfirmIndex]?.name}"</strong>? Semua kredensial masuk profil ini akan terhapus.
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t border-amber-200/50">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmIndex(null)}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => executeDeleteProfile(deleteConfirmIndex)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition-colors"
                          >
                            Ya, Hapus Permanen
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Daftar Pengurus Aktif ({officers.length})
                      </span>
                      <button
                        onClick={() => {
                          setFormProfileName('');
                          setFormProfileRole('Bendahara 2');
                          setFormProfilePin('');
                          setFormProfileColor('bg-indigo-50 text-indigo-600 border-indigo-100');
                          setFormProfilePhone('');
                          setFormProfileAddress('');
                          setFormProfileEmail('');
                          setFormProfileBio('');
                          setProfileModalError(null);
                          setDeleteConfirmIndex(null);
                          setProfileActionType('add');
                        }}
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Tambah Profil
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto border border-slate-100 rounded-xl">
                      {officers.map((off: any, index: number) => {
                        const initials = off.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        const isExpanded = expandedProfileIndex === index;

                        return (
                          <div key={off.name} className="flex flex-col p-1 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center justify-between p-2.5">
                              <div
                                onClick={() => setExpandedProfileIndex(isExpanded ? null : index)}
                                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                              >
                                <div className={`w-9 h-9 rounded-full ${off.avatarColor || 'bg-slate-50 text-slate-600'} flex items-center justify-center text-xs font-bold border shrink-0`}>
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                                    {off.name}
                                    {currentOfficer === off.name && (
                                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                                        Anda
                                      </span>
                                    )}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{off.role}</span>
                                    <span className="text-slate-300">&bull;</span>
                                    <span className="text-[9px] text-indigo-500 font-semibold hover:underline">Klik detail</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setExpandedProfileIndex(isExpanded ? null : index)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                                  title="Lihat Detail"
                                >
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProfileIndex(index);
                                    setFormProfileName(off.name);
                                    setFormProfileRole(off.role);
                                    setFormProfilePin(off.pin);
                                    setFormProfileColor(off.avatarColor || 'bg-indigo-50 text-indigo-600 border-indigo-100');
                                    setFormProfilePhone(off.phone || '');
                                    setFormProfileAddress(off.address || '');
                                    setFormProfileEmail(off.email || '');
                                    setFormProfileBio(off.bio || '');
                                    setProfileModalError(null);
                                    setDeleteConfirmIndex(null);
                                    setProfileActionType('edit');
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Profil"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setProfileModalError(null);
                                    if (officers.length <= 1) {
                                      setProfileModalError('Tidak dapat menghapus profil. Harus tersisa minimal satu profil pengurus aktif.');
                                      return;
                                    }
                                    if (off.name === currentOfficer) {
                                      setProfileModalError('Anda tidak dapat menghapus profil yang sedang Anda gunakan saat ini. Silakan beralih ke profil lain terlebih dahulu.');
                                      return;
                                    }
                                    setDeleteConfirmIndex(index);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus Profil"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Expandable details card */}
                            {isExpanded && (
                              <div className="mx-2.5 mb-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  <div className="space-y-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                      <Phone className="h-3 w-3 text-slate-400" /> No. Telepon
                                    </span>
                                    <p className="font-semibold text-slate-700">{off.phone || 'Belum diisi'}</p>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                      <Mail className="h-3 w-3 text-slate-400" /> Email Pengurus
                                    </span>
                                    <p className="font-semibold text-slate-700 truncate">{off.email || 'Belum diisi'}</p>
                                  </div>
                                </div>

                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-slate-400" /> Alamat Rumah
                                  </span>
                                  <p className="font-semibold text-slate-700">{off.address || 'Belum diisi'}</p>
                                </div>

                                <div className="pt-2 border-t border-slate-200/60">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan / Motto Pengurus</span>
                                  <p className="italic text-slate-500 mt-0.5 font-medium">"{off.bio || 'Menjaga transparansi kas Karang Taruna.'}"</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(profileActionType === 'add' || profileActionType === 'edit') && (
                  <form onSubmit={profileActionType === 'add' ? handleCreateProfile : handleUpdateProfile} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                        {profileActionType === 'add' ? 'Tambah Profil Pengurus Baru' : 'Ubah Detail Profil'}
                      </h4>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        Form Pengurus
                      </span>
                    </div>

                    {profileModalError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-start gap-2.5 relative">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="pr-5">{profileModalError}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Form Field: Name */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase block">Nama Lengkap *</label>
                        <input
                          type="text"
                          value={formProfileName}
                          onChange={(e) => setFormProfileName(e.target.value)}
                          placeholder="Contoh: Muhammad Ali"
                          required
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all text-slate-800"
                        />
                      </div>

                      {/* Form Field: Role */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase block">Peran (Role) *</label>
                        <select
                          value={formProfileRole}
                          onChange={(e) => setFormProfileRole(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all text-slate-800"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Form Field: PIN */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase block">Kata Sandi (PIN) *</label>
                        <input
                          type="text"
                          value={formProfilePin}
                          onChange={(e) => setFormProfilePin(e.target.value)}
                          placeholder="Kata sandi rahasia..."
                          required
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all text-slate-800"
                        />
                      </div>

                      {/* Form Field: Phone */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase block">No. Telepon / WA</label>
                        <input
                          type="text"
                          value={formProfilePhone}
                          onChange={(e) => setFormProfilePhone(e.target.value)}
                          placeholder="Contoh: 0812-3456-7890"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Form Field: Email */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase block">Email Pengurus</label>
                        <input
                          type="email"
                          value={formProfileEmail}
                          onChange={(e) => setFormProfileEmail(e.target.value)}
                          placeholder="Contoh: ali@debegan.org"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all text-slate-800"
                        />
                      </div>

                      {/* Form Field: Address */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase block">Alamat Rumah</label>
                        <input
                          type="text"
                          value={formProfileAddress}
                          onChange={(e) => setFormProfileAddress(e.target.value)}
                          placeholder="Contoh: Debegan RT 02 / RW 03"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Form Field: Bio */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 uppercase block">Catatan / Motto Pengurus</label>
                      <textarea
                        value={formProfileBio}
                        onChange={(e) => setFormProfileBio(e.target.value)}
                        placeholder="Tulis visi singkat atau catatan pengurus..."
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all text-slate-800 resize-none"
                      />
                    </div>

                    {/* Form Field: Theme/Color selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase block">Warna Tema Profil</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { val: 'bg-indigo-50 text-indigo-600 border-indigo-100', name: 'Indigo' },
                          { val: 'bg-emerald-50 text-emerald-600 border-emerald-100', name: 'Emerald' },
                          { val: 'bg-amber-50 text-amber-600 border-amber-100', name: 'Amber' },
                          { val: 'bg-purple-50 text-purple-600 border-purple-100', name: 'Purple' },
                          { val: 'bg-rose-50 text-rose-600 border-rose-100', name: 'Rose' },
                        ].map((col) => (
                          <button
                            key={col.val}
                            type="button"
                            onClick={() => setFormProfileColor(col.val)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              formProfileColor === col.val
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-extrabold ring-2 ring-indigo-100'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {col.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileActionType('list');
                          setProfileModalError(null);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer animate-pulse"
                      >
                        Simpan Profil
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          transactions={transactions}
          auditLogs={auditLogs}
          onClose={() => setSelectedMember(null)}
          onUpdateMemberStatus={(id, currentStatus) => {
            let nextStatus: Member['status'] = 'Lunas';
            let amountDiff = 0;

            if (currentStatus === 'Lunas') {
              nextStatus = 'Belum Lunas';
              amountDiff = -50000;
            } else if (currentStatus === 'Belum Lunas') {
              nextStatus = 'Lunas';
              amountDiff = 50000;
            } else {
              nextStatus = 'Lunas';
              amountDiff = 100000;
            }

            handleUpdateMemberStatus(id, nextStatus, amountDiff);

            // Update modal state in-place with latest calculations
            const target = members.find((m) => m.id === id);
            if (target) {
              setSelectedMember({
                ...target,
                status: nextStatus,
                totalPaid: Math.max(target.totalPaid + amountDiff, 0),
                lastPaymentDate: amountDiff > 0 ? new Date().toISOString().split('T')[0] : target.lastPaymentDate,
              });
            }
          }}
        />
      )}
    </div>
  );
}
