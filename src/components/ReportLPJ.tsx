import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  Printer,
  Lock,
  Unlock,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Settings,
  X,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Transaction, Activity } from '../types';

interface ReportLPJProps {
  transactions: Transaction[];
  activities: Activity[];
  isPeriodClosed: boolean;
  onTogglePeriodLock: () => void;
  onRecordLog: (action: string, details: string) => void;
  onUpdateActivities: (activities: Activity[]) => void;
}

export default function ReportLPJ({
  transactions,
  activities,
  isPeriodClosed,
  onTogglePeriodLock,
  onRecordLog,
  onUpdateActivities,
}: ReportLPJProps) {
  // Tab Controls inside Report
  const [activeSubTab, setActiveSubTab] = useState<'lpj' | 'kelola'>('lpj');

  // Selected activity for LPJ preview
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    activities.length > 0 ? activities[0].id : ''
  );

  // Fallback selectedActivity object
  const selectedActivity =
    activities.find((act) => act.id === selectedActivityId) ||
    activities[0] ||
    null;

  // Clipboard copy state
  const [copied, setCopied] = useState(false);

  // Customizer Panel State
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customOrg, setCustomOrg] = useState('KARANG TARUNA DEBEGAN');
  const [customSub, setCustomSub] = useState('KELURAHAN MOJOSONGO, KECAMATAN JEBRES, KOTA SURAKARTA');
  const [customAddress, setCustomAddress] = useState('Sekretariat: Debegan RT 02 / RW 03, Mojosongo, Jebres, Surakarta');
  const [customSign1Name, setCustomSign1Name] = useState('Bramandika Ramavirio');
  const [customSign1Role, setCustomSign1Role] = useState('Ketua Panitia Kegiatan');
  const [customSign1Nip, setCustomSign1Nip] = useState('NIP. KT-0324144');
  const [customSign2Name, setCustomSign2Name] = useState('Mirachel Lovan');
  const [customSign2Role, setCustomSign2Role] = useState('Bendahara Karang Taruna');
  const [customSign2Nip, setCustomSign2Nip] = useState('NIP. KT-0324136');
  const [customSign3Name, setCustomSign3Name] = useState('Loris Oktaviano');
  const [customSign3Role, setCustomSign3Role] = useState('Ketua Karang Taruna');
  const [customSign3Nip, setCustomSign3Nip] = useState('NIP. KT-0324106');

  // Activity Management Form state
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityFormMode, setActivityFormMode] = useState<'add' | 'edit'>('add');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [formActName, setFormActName] = useState('');
  const [formActDate, setFormActDate] = useState('');
  const [formActBudget, setFormActBudget] = useState<number>(500000);
  const [formActStatus, setFormActStatus] = useState<Activity['status']>('Direncanakan');
  const [formActDesc, setFormActDesc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // IDR Formatter
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Helper to get real live transaction amounts per activity
  const getActivityActualExpense = (activityName: string) => {
    return transactions
      .filter((t) => t.activityName === activityName && t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getActivityActualIncome = (activityName: string) => {
    return transactions
      .filter((t) => t.activityName === activityName && t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Compute stats for selected activity
  const activityTransactions = selectedActivity
    ? transactions.filter((t) => t.activityName === selectedActivity.name)
    : [];

  const totalActivityExpense = selectedActivity
    ? getActivityActualExpense(selectedActivity.name)
    : 0;

  const budgetDifference = selectedActivity
    ? selectedActivity.allocatedBudget - totalActivityExpense
    : 0;

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  // Toggle closure log
  const handleToggleLock = () => {
    const nextState = !isPeriodClosed;
    onTogglePeriodLock();
    onRecordLog(
      nextState ? 'Tutup Buku' : 'Buka Buku',
      nextState
        ? 'Menutup buku kas bulanan. Transaksi terkunci untuk proses pelaporan akhir.'
        : 'Membuka kembali buku kas bulanan untuk keperluan penyesuaian transaksi.'
    );
  };

  // Handle WhatsApp Clipboard Copy
  const handleCopyWhatsApp = () => {
    if (!selectedActivity) return;

    const budgetStatusText =
      budgetDifference >= 0
        ? `Sisa Lebih (Hemat): ${formatIDR(budgetDifference)}`
        : `Over-Budget (Defisit): ${formatIDR(Math.abs(budgetDifference))}`;

    let txLines = '';
    activityTransactions.forEach((t) => {
      const direction = t.type === 'pemasukan' ? '📥 [MASUK]' : '📤 [KELUAR]';
      txLines += `- ${t.date} | ${direction} ${t.category}: ${t.description} (${formatIDR(t.amount)})\n`;
    });

    if (activityTransactions.length === 0) {
      txLines = '- (Belum ada rincian transaksi kas masuk/keluar untuk kegiatan ini)\n';
    }

    const textToCopy = `🚨 *LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN* 🚨
*${customOrg.toUpperCase()}*
*${customSub}*

--------------------------------------------
📋 *KEGIATAN:* ${selectedActivity.name}
📅 *TANGGAL:* ${selectedActivity.date}
📌 *STATUS PROGRAM:* ${selectedActivity.status}
📝 *DESKRIPSI:* "${selectedActivity.description}"

💰 *RINGKASAN ANGGARAN (RAB):*
- Plafon Alokasi Budget: ${formatIDR(selectedActivity.allocatedBudget)}
- Realisasi Belanja: ${formatIDR(totalActivityExpense)}
- ⚖️ ${budgetStatusText}

🧾 *RINCIAN ARUS KAS KEGIATAN:*
${txLines}
--------------------------------------------
📢 *PENUTUP:*
Laporan ini disusun secara transparan melalui *Sistem Kas Digital Karang Taruna*.
Tanggal Penarikan Data: ${new Date().toLocaleDateString('id-ID')} pukul ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB.
Mohon koreksi dan masukan dari segenap pengurus dan penasehat RT/RW. Terima kasih! 🙏✨`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onRecordLog('Ekspor Laporan', `Menyalin draf laporan LPJ "${selectedActivity.name}" ke papan klip untuk WhatsApp.`);
    });
  };

  // Create or Update Activity
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formActName.trim() || !formActDate) {
      setFormError('Nama kegiatan dan tanggal pelaksanaan wajib diisi.');
      return;
    }

    if (formActBudget <= 0) {
      setFormError('Plafon anggaran (RAB) harus lebih besar dari Rp 0.');
      return;
    }

    // Check duplicate name (except when editing the same activity)
    const isDuplicate = activities.some(
      (act) =>
        act.name.toLowerCase() === formActName.trim().toLowerCase() &&
        act.id !== editingActivityId
    );

    if (isDuplicate) {
      setFormError(`Kegiatan dengan nama "${formActName.trim()}" sudah ada dalam agenda.`);
      return;
    }

    let updatedActivitiesList: Activity[];

    if (activityFormMode === 'add') {
      const newAct: Activity = {
        id: `A-${Date.now()}`,
        name: formActName.trim(),
        date: formActDate,
        allocatedBudget: formActBudget,
        actualExpense: 0, // dynamic
        status: formActStatus,
        description: formActDesc.trim() || 'Tidak ada deskripsi tambahan.',
      };
      updatedActivitiesList = [...activities, newAct];
      onRecordLog('Tambah Kegiatan', `Menambahkan agenda kegiatan baru: "${newAct.name}" dengan RAB ${formatIDR(newAct.allocatedBudget)}.`);
    } else {
      updatedActivitiesList = activities.map((act) => {
        if (act.id === editingActivityId) {
          return {
            ...act,
            name: formActName.trim(),
            date: formActDate,
            allocatedBudget: formActBudget,
            status: formActStatus,
            description: formActDesc.trim() || act.description,
          };
        }
        return act;
      });
      onRecordLog('Ubah Kegiatan', `Memperbarui detail kegiatan "${formActName.trim()}" dalam agenda.`);
    }

    onUpdateActivities(updatedActivitiesList);
    
    // Auto reset and close form
    setFormActName('');
    setFormActDate('');
    setFormActBudget(500000);
    setFormActStatus('Direncanakan');
    setFormActDesc('');
    setShowActivityForm(false);
    setEditingActivityId(null);

    // Update selected ID if empty
    if (selectedActivityId === '') {
      setSelectedActivityId(updatedActivitiesList[0]?.id || '');
    }
  };

  // Delete Activity Handler
  const handleDeleteActivity = (id: string) => {
    const act = activities.find((a) => a.id === id);
    if (!act) return;

    // Check if there are transactions bound to this activity
    const boundTxCount = transactions.filter((t) => t.activityName === act.name).length;
    if (boundTxCount > 0) {
      setFormError(`Tidak dapat menghapus kegiatan "${act.name}". Terdapat ${boundTxCount} transaksi keuangan yang terhubung dengan kegiatan ini.`);
      setDeleteConfirmId(null);
      return;
    }

    const updated = activities.filter((a) => a.id !== id);
    onUpdateActivities(updated);
    onRecordLog('Hapus Kegiatan', `Menghapus agenda kegiatan "${act.name}" dari sistem.`);
    
    // adjust selected index if deleted
    if (selectedActivityId === id) {
      setSelectedActivityId(updated[0]?.id || '');
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector Header */}
      <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between flex-wrap gap-2 print:hidden">
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              setActiveSubTab('lpj');
              setFormError(null);
            }}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'lpj'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-4 w-4" />
            Laporan & LPJ Otomatis
          </button>
          <button
            onClick={() => {
              setActiveSubTab('kelola');
              setFormError(null);
            }}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'kelola'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Kelola Agenda Kegiatan & RAB ({activities.length})
          </button>
        </div>

        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">
          Modul Keuangan Organisasi
        </span>
      </div>

      {activeSubTab === 'lpj' ? (
        <>
          {/* Top Controls: Tutup Buku & Period lock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
            {/* Card 1: Tutup Buku Panel */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 md:col-span-1 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-950">Status Periode (Tutup Buku)</h4>
                <p className="text-xs text-slate-500">Kunci data transaksi untuk audit & pembuatan LPJ bulanan.</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isPeriodClosed ? (
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <Lock className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Unlock className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Buku Kas Bulanan</span>
                    <span className={`text-xs font-bold ${isPeriodClosed ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isPeriodClosed ? 'Terkunci (Tutup Buku)' : 'Terbuka (Buka Buku)'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggleLock}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    isPeriodClosed
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  }`}
                >
                  {isPeriodClosed ? 'Buka Kunci' : 'Tutup Buku'}
                </button>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1 bg-blue-50/40 p-3 rounded-lg border border-blue-100/50">
                <p className="font-bold text-blue-800 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                  Mengapa fitur ini penting?
                </p>
                <p>
                  Menghindari manipulasi data historis setelah pelaporan selesai, memastikan transparansi mutlak di depan pengurus RT/RW dan warga sekitar.
                </p>
              </div>
            </div>

            {/* Card 2: List of available activities for LPJ selection */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 md:col-span-2 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-950">Pilih Kegiatan untuk Draft LPJ Otomatis</h4>
                <p className="text-xs text-slate-500">Pilih program kerja untuk melihat dan mencetak draft Laporan Pertanggungjawaban.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activities.map((act) => {
                  const expense = getActivityActualExpense(act.name);
                  return (
                    <button
                      key={act.id}
                      onClick={() => {
                        setSelectedActivityId(act.id);
                        setFormError(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                        selectedActivityId === act.id
                          ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <FileText className={`h-5 w-5 mb-2 ${selectedActivityId === act.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <h5 className="text-xs font-bold text-slate-900 truncate">{act.name}</h5>
                        <p className="text-[10px] text-slate-500 mt-1">Status: <strong className="text-slate-700">{act.status}</strong></p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500 flex justify-between">
                        <span>Realisasi:</span>
                        <span className="font-bold text-slate-800">{formatIDR(expense).replace(/\,00$/, '')}</span>
                      </div>
                    </button>
                  );
                })}

                {activities.length === 0 && (
                  <div className="sm:col-span-3 p-8 border border-dashed border-slate-200 rounded-xl text-center space-y-3">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Belum Ada Agenda Kegiatan</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Silakan beralih ke tab "Kelola Agenda Kegiatan" untuk membuat kegiatan pertama.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedActivity ? (
            <div className="space-y-6">
              {/* Customizable Kop Surat & Signatures (Feature 5) */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden print:hidden">
                <button
                  onClick={() => setShowCustomizer(!showCustomizer)}
                  className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100/75 border-b border-slate-100 flex justify-between items-center transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-800">Pengaturan Formulir Kop Surat & Tanda Tangan Dokumen LPJ</span>
                  </div>
                  <div className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                    {showCustomizer ? 'Sembunyikan Pengaturan' : 'Sesuaikan Penandatangan'}
                    {showCustomizer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {showCustomizer && (
                  <div className="p-6 space-y-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Organisasi Kop</label>
                        <input
                          type="text"
                          value={customOrg}
                          onChange={(e) => setCustomOrg(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Sub-Header Kop</label>
                        <input
                          type="text"
                          value={customSub}
                          onChange={(e) => setCustomSub(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Alamat Sekretariat</label>
                        <input
                          type="text"
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider mb-2">Penandatangan Dokumen</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Signee 1 */}
                        <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Penandatangan 1 (Ketua Panitia)</span>
                          <input
                            type="text"
                            placeholder="Nama Lengkap"
                            value={customSign1Name}
                            onChange={(e) => setCustomSign1Name(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Peran"
                            value={customSign1Role}
                            onChange={(e) => setCustomSign1Role(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-100 rounded-md text-[10px]"
                          />
                          <input
                            type="text"
                            placeholder="NIP / Kode ID"
                            value={customSign1Nip}
                            onChange={(e) => setCustomSign1Nip(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-100 rounded-md text-[10px] font-mono"
                          />
                        </div>

                        {/* Signee 2 */}
                        <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Penandatangan 2 (Bendahara)</span>
                          <input
                            type="text"
                            placeholder="Nama Lengkap"
                            value={customSign2Name}
                            onChange={(e) => setCustomSign2Name(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Peran"
                            value={customSign2Role}
                            onChange={(e) => setCustomSign2Role(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-100 rounded-md text-[10px]"
                          />
                          <input
                            type="text"
                            placeholder="NIP / Kode ID"
                            value={customSign2Nip}
                            onChange={(e) => setCustomSign2Nip(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-100 rounded-md text-[10px] font-mono"
                          />
                        </div>

                        {/* Signee 3 */}
                        <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Penandatangan 3 (Ketua Taruna)</span>
                          <input
                            type="text"
                            placeholder="Nama Lengkap"
                            value={customSign3Name}
                            onChange={(e) => setCustomSign3Name(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Peran"
                            value={customSign3Role}
                            onChange={(e) => setCustomSign3Role(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-100 rounded-md text-[10px]"
                          />
                          <input
                            type="text"
                            placeholder="NIP / Kode ID"
                            value={customSign3Nip}
                            onChange={(e) => setCustomSign3Nip(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-100 rounded-md text-[10px] font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* LPJ Report Draft (Printable formal document style) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* LPJ Actions Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-3 print:hidden">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Preview Dokumen Formal LPJ</h4>
                      <p className="text-[10px] text-slate-500">Tampilan berkas formal yang siap dicetak kertas A4 atau disimpan ke PDF.</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyWhatsApp}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        copied
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                      }`}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 text-emerald-600" />}
                      {copied ? 'Tersalin!' : 'Salin Laporan WhatsApp'}
                    </button>

                    <button
                      onClick={handlePrint}
                      className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      Cetak Laporan / Simpan PDF
                    </button>
                  </div>
                </div>

                {/* Printable Paper Frame */}
                <div className="p-8 sm:p-12 bg-white text-slate-950 space-y-8 font-serif leading-relaxed max-w-4xl mx-auto print:p-0">
                  {/* Document Header (Kop Surat) */}
                  <div className="text-center border-b-4 border-double border-slate-950 pb-6 space-y-1">
                    <h2 className="text-base font-bold uppercase tracking-wider">{customOrg}</h2>
                    <h3 className="text-xs font-bold uppercase text-slate-800">{customSub}</h3>
                    <p className="text-[10px] italic text-slate-500 font-sans">{customAddress}</p>
                  </div>

                  {/* Document Title */}
                  <div className="text-center space-y-1.5">
                    <h4 className="text-sm font-bold uppercase underline">LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN</h4>
                    <p className="text-xs uppercase font-bold font-sans tracking-wide">KEGIATAN: {selectedActivity.name}</p>
                  </div>

                  {/* Letter intro / Description */}
                  <div className="space-y-4 text-xs font-sans">
                    <p>
                      Yang bertanda tangan di bawah ini, pengurus harian dan panitia pelaksana kegiatan Karang Taruna Debegan, melaporkan rincian realisasi anggaran pengeluaran dan pemasukan untuk kegiatan <strong>"{selectedActivity.name}"</strong> yang telah direncanakan pada tanggal {selectedActivity.date} dengan deskripsi sebagai berikut:
                    </p>
                    <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700 italic">
                      "{selectedActivity.description}"
                    </p>
                  </div>

                  {/* Budget Summary Row */}
                  <div className="grid grid-cols-3 gap-4 font-sans text-xs pt-2">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Plafon Anggaran</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">{formatIDR(selectedActivity.allocatedBudget)}</span>
                    </div>
                    <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg">
                      <span className="text-[10px] text-rose-500 block uppercase font-bold">Realisasi Belanja</span>
                      <span className="font-bold text-rose-700 font-mono text-sm">{formatIDR(totalActivityExpense)}</span>
                    </div>
                    <div className={`p-3 rounded-lg border ${budgetDifference >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                      <span className={`text-[10px] block uppercase font-bold ${budgetDifference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {budgetDifference >= 0 ? 'Sisa Lebih (Hemat)' : 'Over-Budget'}
                      </span>
                      <span className={`font-bold font-mono text-sm ${budgetDifference >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {formatIDR(Math.abs(budgetDifference))}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Transaction table */}
                  <div className="space-y-3 font-sans">
                    <h5 className="text-xs font-bold uppercase border-l-4 border-indigo-600 pl-2 text-slate-800">
                      Rincian Log Transaksi Kegiatan
                    </h5>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600">
                            <th className="py-2.5 px-3">Tanggal & Waktu</th>
                            <th className="py-2.5 px-3">Kategori</th>
                            <th className="py-2.5 px-3">Keterangan Transaksi</th>
                            <th className="py-2.5 px-3 text-right">Debit (Masuk)</th>
                            <th className="py-2.5 px-3 text-right">Kredit (Keluar)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activityTransactions.map((t) => (
                            <tr key={t.id} className="text-[11px] text-slate-700">
                              <td className="py-2 px-3 font-mono">{t.date} {t.time}</td>
                              <td className="py-2 px-3 font-semibold">{t.category}</td>
                              <td className="py-2 px-3">{t.description}</td>
                              <td className="py-2 px-3 text-right font-mono text-emerald-600">
                                {t.type === 'pemasukan' ? formatIDR(t.amount) : '-'}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-rose-600">
                                {t.type === 'pengeluaran' ? formatIDR(t.amount) : '-'}
                              </td>
                            </tr>
                          ))}

                          {activityTransactions.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                                Belum ada transaksi pengeluaran khusus yang dicatat untuk kegiatan ini.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Signatures Panel (Tanda Tangan Formal Custom) */}
                  <div className="pt-10 font-sans text-xs">
                    <div className="text-right mb-6">
                      <p>Surakarta, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="grid grid-cols-3 text-center gap-4">
                      {/* Kolom 1: Ketua Panitia */}
                      <div className="space-y-16">
                        <p className="font-bold">{customSign1Role}</p>
                        <div className="space-y-0.5">
                          <p className="underline font-bold font-serif">{customSign1Name}</p>
                          <p className="text-[10px] text-slate-500">{customSign1Nip}</p>
                        </div>
                      </div>

                      {/* Kolom 2: Bendahara */}
                      <div className="space-y-16">
                        <p className="font-bold">{customSign2Role}</p>
                        <div className="space-y-0.5">
                          <p className="underline font-bold font-serif">{customSign2Name}</p>
                          <p className="text-[10px] text-slate-500">{customSign2Nip}</p>
                        </div>
                      </div>

                      {/* Kolom 3: Ketua Umum */}
                      <div className="space-y-16">
                        <p className="font-bold">{customSign3Role}</p>
                        <div className="space-y-0.5">
                          <p className="underline font-bold font-serif">{customSign3Name}</p>
                          <p className="text-[10px] text-slate-500">{customSign3Nip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        /* Kelola Agenda Kegiatan & RAB (Feature 4) */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Agenda Kegiatan & Rencana Anggaran (RAB)</h3>
              <p className="text-xs text-slate-500">Rencanakan program kerja pemuda, tentukan anggaran plafon (RAB), dan monitor realisasi real-time.</p>
            </div>

            {!showActivityForm && (
              <button
                onClick={() => {
                  setActivityFormMode('add');
                  setFormActName('');
                  setFormActDate('');
                  setFormActBudget(500000);
                  setFormActStatus('Direncanakan');
                  setFormActDesc('');
                  setEditingActivityId(null);
                  setFormError(null);
                  setShowActivityForm(true);
                }}
                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="h-4 w-4" />
                Tambah Agenda Baru
              </button>
            )}
          </div>

          {/* Form Alert / Error */}
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-bold flex items-start gap-2.5 relative">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="pr-5">{formError}</div>
              <button
                onClick={() => setFormError(null)}
                className="absolute top-3.5 right-3.5 text-rose-500 hover:text-rose-800 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          )}

          {/* Inline Form to Add / Edit Activity */}
          {showActivityForm && (
            <form onSubmit={handleSaveActivity} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-4.5 w-4.5 text-indigo-500" />
                  {activityFormMode === 'add' ? 'Tambah Agenda Kegiatan Baru' : 'Ubah Agenda Kegiatan'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowActivityForm(false);
                    setFormError(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block">Nama Kegiatan *</label>
                  <input
                    type="text"
                    required
                    value={formActName}
                    onChange={(e) => setFormActName(e.target.value)}
                    placeholder="Contoh: Pentas Seni Kemerdekaan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block">Tanggal Pelaksanaan *</label>
                  <input
                    type="date"
                    required
                    value={formActDate}
                    onChange={(e) => setFormActDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block">Plafon Anggaran (RAB) *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={50000}
                      value={formActBudget}
                      onChange={(e) => setFormActBudget(Number(e.target.value))}
                      placeholder="500000"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block">Status Pelaksanaan</label>
                  <select
                    value={formActStatus}
                    onChange={(e) => setFormActStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="Direncanakan">Direncanakan</option>
                    <option value="Berjalan">Berjalan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase block">Deskripsi & Tujuan Kegiatan</label>
                <textarea
                  value={formActDesc}
                  onChange={(e) => setFormActDesc(e.target.value)}
                  placeholder="Tulis detail program kerja, misalnya: Belanja piala, sewa panggung, sound system, konsumsi juri dan penonton..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:bg-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowActivityForm(false);
                    setFormError(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          )}

          {/* Activity Grid Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((act) => {
              const actualExpense = getActivityActualExpense(act.name);
              const actualIncome = getActivityActualIncome(act.name);
              const remaining = act.allocatedBudget - actualExpense;
              const percentUsed = Math.min(Math.round((actualExpense / act.allocatedBudget) * 100), 100);

              const isConfirmingDelete = deleteConfirmId === act.id;

              return (
                <div key={act.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          act.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : act.status === 'Berjalan'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {act.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 font-bold">
                        <Calendar className="h-3 w-3" />
                        {act.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {act.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3.5 pt-3 border-t border-slate-100">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-medium text-slate-500">
                        <span>Plafon RAB vs Realisasi</span>
                        <span className={`font-bold ${percentUsed > 100 ? 'text-rose-600' : 'text-indigo-600'}`}>
                          {percentUsed}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${percentUsed > 100 ? 'bg-rose-600' : 'bg-indigo-600'}`}
                          style={{ width: `${percentUsed}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Plafon (RAB)</span>
                        <span className="font-bold text-slate-800 font-mono">{formatIDR(act.allocatedBudget).replace(/\,00$/, '')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Belanja Real</span>
                        <span className="font-bold text-rose-600 font-mono">{formatIDR(actualExpense).replace(/\,00$/, '')}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1.5">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Sisa Budget</span>
                        <span className={`font-bold font-mono ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {remaining >= 0 ? '+' : ''}{formatIDR(remaining).replace(/\,00$/, '')}
                        </span>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 rounded-lg p-1">
                            <span className="text-[9px] font-extrabold text-rose-700 px-1.5 uppercase">Yakin?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteActivity(act.id)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold cursor-pointer"
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md text-[10px] font-bold cursor-pointer"
                            >
                              Tidak
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActivityFormMode('edit');
                                setFormActName(act.name);
                                setFormActDate(act.date);
                                setFormActBudget(act.allocatedBudget);
                                setFormActStatus(act.status);
                                setFormActDesc(act.description);
                                setEditingActivityId(act.id);
                                setFormError(null);
                                setShowActivityForm(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Ubah Agenda"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormError(null);
                                setDeleteConfirmId(act.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Agenda"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
