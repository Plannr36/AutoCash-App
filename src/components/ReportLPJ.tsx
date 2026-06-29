import React, { useState } from 'react';
import { Calendar, FileText, Printer, Lock, Unlock, Download, ChevronRight, CheckCircle, HelpCircle } from 'lucide-react';
import { Transaction, Activity } from '../types';

interface ReportLPJProps {
  transactions: Transaction[];
  activities: Activity[];
  isPeriodClosed: boolean;
  onTogglePeriodLock: () => void;
  onRecordLog: (action: string, details: string) => void;
}

export default function ReportLPJ({
  transactions,
  activities,
  isPeriodClosed,
  onTogglePeriodLock,
  onRecordLog,
}: ReportLPJProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity>(activities[0]);

  // IDR Formatter
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Get transactions associated with the selected activity
  const activityTransactions = transactions.filter(
    (t) => t.activityName === selectedActivity.name
  );

  const totalActivityExpense = activityTransactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalActivityIncome = activityTransactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetDifference = selectedActivity.allocatedBudget - totalActivityExpense;

  // Print function
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

  return (
    <div className="space-y-6">
      {/* Top Controls: Tutup Buku & Period lock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            {activities.map((act) => (
              <button
                key={act.id}
                onClick={() => setSelectedActivity(act)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedActivity.id === act.id
                    ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <FileText className={`h-5 w-5 mb-2 ${selectedActivity.id === act.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                <h5 className="text-xs font-bold text-slate-900 truncate">{act.name}</h5>
                <p className="text-[10px] text-slate-500 mt-1">Status: {act.status}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LPJ Report Draft (Printable formal document style) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* LPJ Actions Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900">Preview Dokumen Formal LPJ</h4>
          </div>

          <button
            onClick={handlePrint}
            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Cetak Laporan / Simpan PDF
          </button>
        </div>

        {/* Printable Paper Frame */}
        <div className="p-8 sm:p-12 bg-white text-slate-950 space-y-8 font-serif leading-relaxed max-w-4xl mx-auto print:p-0">
          {/* Document Header (Kop Surat) */}
          <div className="text-center border-b-4 border-double border-slate-950 pb-6 space-y-1">
            <h2 className="text-base font-bold uppercase tracking-wider">KARANG TARUNA DEBEGAN</h2>
            <h3 className="text-sm font-bold uppercase text-slate-800">KELURAHAN MOJOSONGO, KECAMATAN JEBRES, KOTA SURAKARTA</h3>
            <p className="text-xs italic text-slate-500 font-sans">Sekretariat: Debegan RT 02 / RW 03, Mojosongo, Jebres, Surakarta</p>
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

          {/* Signatures Panel (Tanda Tangan Formal) */}
          <div className="pt-10 font-sans text-xs">
            <div className="text-right mb-6">
              <p>Surakarta, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="grid grid-cols-3 text-center gap-4">
              {/* Kolom 1: Ketua Panitia */}
              <div className="space-y-16">
                <p className="font-bold">Ketua Panitia Kegiatan</p>
                <div className="space-y-0.5">
                  <p className="underline font-bold font-serif">Bramandika Ramavirio</p>
                  <p className="text-[10px] text-slate-500">NIP. KT-0324144</p>
                </div>
              </div>

              {/* Kolom 2: Bendahara */}
              <div className="space-y-16">
                <p className="font-bold">Bendahara Karang Taruna</p>
                <div className="space-y-0.5">
                  <p className="underline font-bold font-serif">Mirachel Lovan</p>
                  <p className="text-[10px] text-slate-500">NIP. KT-0324136</p>
                </div>
              </div>

              {/* Kolom 3: Ketua Umum */}
              <div className="space-y-16">
                <p className="font-bold">Ketua Karang Taruna</p>
                <div className="space-y-0.5">
                  <p className="underline font-bold font-serif">Loris Oktaviano</p>
                  <p className="text-[10px] text-slate-500">NIP. KT-0324106</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
