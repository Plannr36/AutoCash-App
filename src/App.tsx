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
  ChevronDown
} from 'lucide-react';

// Sub-components
import DashboardOverview from './components/DashboardOverview';
import TransactionManager from './components/TransactionManager';
import MemberManager from './components/MemberManager';
import ReportLPJ from './components/ReportLPJ';
import AuditLogViewer from './components/AuditLogViewer';
import CommunicationForum from './components/CommunicationForum';

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

  // Authentication Mock (Allows switching between officers for demo)
  const [currentOfficer, setCurrentOfficer] = useState('Mirachel Lovan');
  const [currentRole, setCurrentRole] = useState<'Bendahara 1' | 'Bendahara 2' | 'Sekretaris 1' | 'Sekretaris 2' | 'Wakil Ketua' | 'Ketua'>('Bendahara 2');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Core App State (With localStorage backing)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
  const [isPeriodClosed, setIsPeriodClosed] = useState(false);

  // Quick Action Modal Trigger inside Dashboard
  const [addTxTrigger, setAddTxTrigger] = useState(false);

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
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Transaksi', icon: Wallet },
    { name: 'Anggota', icon: Users },
    { name: 'Laporan', icon: FileText },
    { name: 'Koordinasi', icon: MessageSquare },
    { name: 'Log Riwayat', icon: History },
  ];

  return (
    <div className="min-h-screen flex text-slate-800 antialiased font-sans">
      {/* Sidebar Navigation */}
      <aside
        className={`bg-[#0f172a] text-slate-300 w-64 shrink-0 transition-all fixed inset-y-0 left-0 z-40 lg:static transform ${
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
        </nav>

        {/* Sidebar Footer / Developer Credits */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 space-y-1.5 text-center shrink-0">
          <p className="font-bold uppercase tracking-wider text-slate-400">Tim Pengembang UTS:</p>
          <p className="font-semibold text-slate-500">
            Loris O. &bull; M. Lazarus A. &bull; Bramandika R.
          </p>
          <p className="text-[9px] text-slate-600">S1 Akuntansi FEB UNS &copy; 2026</p>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 print:hidden">
          {/* Menu button for small screens */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Current UTC Time display */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="font-mono text-[11px] font-semibold">Senin, 29 Juni 2026 &bull; 01:10 WIB</span>
          </div>

          {/* Demo profile switcher / Dropdown */}
          <div className="flex items-center gap-4">
            {/* Simulation alert */}
            <div className="hidden md:flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/80 py-1 px-2.5 rounded-full">
              <span className="h-2 w-2 bg-indigo-500 rounded-full"></span>
              <span className="text-[10px] text-indigo-700 font-bold">Mode Simulasi UTS</span>
            </div>

            {/* Officer switcher profile card */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 text-left p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                  {currentOfficer.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    {currentOfficer}
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold">{currentRole}</p>
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 text-xs">
                  <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Akun Pengurus:</p>
                  <button
                    onClick={() => handleSwitchOfficer('Mirachel Lovan', 'Bendahara 2')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
                  >
                    <span>Mirachel Lovan (Bnd 2)</span>
                    {currentOfficer === 'Mirachel Lovan' && <span className="text-indigo-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSwitchOfficer('Retma Ayu Putri', 'Bendahara 1')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
                  >
                    <span>Retma Ayu Putri (Bnd 1)</span>
                    {currentOfficer === 'Retma Ayu Putri' && <span className="text-indigo-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSwitchOfficer('Loris Oktaviano', 'Ketua')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
                  >
                    <span>Loris Oktaviano (Ketua)</span>
                    {currentOfficer === 'Loris Oktaviano' && <span className="text-indigo-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleSwitchOfficer('Bramandika Ramavirio', 'Sekretaris 2')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
                  >
                    <span>Bramandika R. (Sekr 2)</span>
                    {currentOfficer === 'Bramandika Ramavirio' && <span className="text-indigo-600 font-bold">✓</span>}
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
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto print:p-0">
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
                />
              )}

              {activeTab === 'Laporan' && (
                <ReportLPJ
                  transactions={transactions}
                  activities={activities}
                  isPeriodClosed={isPeriodClosed}
                  onTogglePeriodLock={handleTogglePeriodLock}
                  onRecordLog={handleRecordAuditLog}
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
    </div>
  );
}
