import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Calendar,
  Wallet,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Trophy,
  Crown,
  Medal,
  Settings,
  Copy,
  Check,
  Info,
  HelpCircle,
  ArrowRight,
  Sparkles,
  BarChart4
} from 'lucide-react';
import { Transaction, Member, Activity } from '../types';

interface DashboardOverviewProps {
  transactions: Transaction[];
  members: Member[];
  activities: Activity[];
  onTabChange: (tab: string) => void;
  onOpenAddTransaction: () => void;
  onSelectMember?: (member: Member) => void;
}

export default function DashboardOverview({
  transactions,
  members,
  activities,
  onTabChange,
  onOpenAddTransaction,
  onSelectMember,
}: DashboardOverviewProps) {
  // Tab Leaderboard State
  const [leaderboardTab, setLeaderboardTab] = useState<'terbanyak' | 'rutin'>('terbanyak');

  // Tab Main Analysis State (Arus Kas vs Target Bulanan)
  const [analysisTab, setAnalysisTab] = useState<'arus_kas' | 'target_anggaran'>('arus_kas');

  // Category Target Budget States (Feature 1)
  const [showTargetSettings, setShowTargetSettings] = useState(false);
  const [categoryTargets, setCategoryTargets] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('kt_category_targets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use default fallback
      }
    }
    return {
      'Iuran Rutin': 2000000,
      'Donasi / Sponsor': 1000000,
      'Dana Usaha': 500000,
      'Belanja Kegiatan': 2000000,
      'Operasional Rapat': 300000,
      'Properti & Perlengkapan': 1000000,
    };
  });

  const handleUpdateTarget = (category: string, value: number) => {
    const updated = { ...categoryTargets, [category]: value };
    setCategoryTargets(updated);
    localStorage.setItem('kt_category_targets', JSON.stringify(updated));
  };

  // Kalkulator Pintar Proyeksi Kas States (Feature 3)
  const [calcFee, setCalcFee] = useState(15000);
  const [calcMembers, setCalcMembers] = useState(members.length || 50);
  const [calcCompliance, setCalcCompliance] = useState(85);
  const [calcDuration, setCalcDuration] = useState(6);
  const [calcExtraIncome, setCalcExtraIncome] = useState(300000);
  const [calcCopied, setCalcCopied] = useState(false);

  // Calculations for Leaderboard
  const topPayers = [...members]
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 5);

  const topRutinPayers = [...members]
    .sort((a, b) => {
      const statusWeight = { 'Lunas': 3, 'Belum Lunas': 2, 'Menunggak': 1 };
      const weightA = statusWeight[a.status] || 0;
      const weightB = statusWeight[b.status] || 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      if (a.lastPaymentDate && b.lastPaymentDate) {
        return a.lastPaymentDate.localeCompare(b.lastPaymentDate);
      }
      if (a.lastPaymentDate) return -1;
      if (b.lastPaymentDate) return 1;
      return 0;
    })
    .slice(0, 5);

  // General Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'Lunas').length;
  const pendingMembers = members.filter((m) => m.status === 'Belum Lunas').length;
  const overdueMembers = members.filter((m) => m.status === 'Menunggak').length;

  const complianceRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  // Format IDR helper
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Group transactions by category for visualization
  const categorySummary = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // Proyeksi Kas outputs
  const calcMonthlyMembershipIncome = Math.round(calcMembers * calcFee * (calcCompliance / 100));
  const calcTotalMembershipIncome = calcMonthlyMembershipIncome * calcDuration;
  const calcTotalExtraIncome = calcExtraIncome * calcDuration;
  const calcTotalProjectedExtra = calcTotalMembershipIncome + calcTotalExtraIncome;
  const calcGrandTotalProjected = currentBalance + calcTotalProjectedExtra;

  const handleCopyCalcNarrative = () => {
    const textToCopy = `⚡ *SIMULASI PROYEKSI KAS KARANG TARUNA DEBEGAN* ⚡

Rekan-rekan pemuda, mari kita rencanakan keuangan organisasi ke depan secara matang!

Jika kita menjalankan program iuran wajib dengan parameter:
- *Iuran Per Bulan:* ${formatIDR(calcFee)} / anggota
- *Jumlah Anggota Berpartisipasi:* ${calcMembers} orang
- *Tingkat Kepatuhan Pembayaran:* ${calcCompliance}%
- *Jangka Waktu Proyeksi:* ${calcDuration} bulan ke depan
- *Estimasi Pemasukan Lain (Usaha/Sponsor):* ${formatIDR(calcExtraIncome)} / bulan

💰 *HASIL SIMULASI PROYEKSI KAS:*
- Pemasukan Iuran per Bulan: ${formatIDR(calcMonthlyMembershipIncome)}
- Total Pemasukan Iuran (${calcDuration} bln): ${formatIDR(calcTotalMembershipIncome)}
- Total Hasil Usaha/Donasi (${calcDuration} bln): ${formatIDR(calcTotalExtraIncome)}
- *Total Tambahan Dana Terkumpul:* ${formatIDR(calcTotalProjectedExtra)} ✨
- *Proyeksi Total Saldo Kas Akhir:* ${formatIDR(calcGrandTotalProjected)} 📈

Mari kita tingkatkan komitmen bersama, bayar kas tepat waktu, dan dukung berbagai program kepemudaan di Debegan RT 02 / RW 03! 💪🇮🇩`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCalcCopied(true);
      setTimeout(() => setCalcCopied(false), 2000);
    });
  };

  // Format payment dates safely
  const formatPaymentDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Utama */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Kas Saat Ini</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatIDR(currentBalance)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="text-emerald-600 font-medium flex items-center mr-1">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              Sentralisasi Digital
            </span>
            <span>real-time di lapangan</span>
          </div>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pemasukan</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatIDR(totalIncome)}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="text-blue-600 font-semibold mr-1">
              {transactions.filter((t) => t.type === 'pemasukan').length} Transaksi
            </span>
            <span>terdaftar bulan ini</span>
          </div>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pengeluaran</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatIDR(totalExpense)}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="text-rose-600 font-semibold mr-1">
              {transactions.filter((t) => t.type === 'pengeluaran').length} Transaksi
            </span>
            <span>alokasi dana kegiatan</span>
          </div>
        </div>

        {/* Card 4: Kepatuhan Iuran */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kepatuhan Iuran</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{complianceRate}%</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${complianceRate}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-1">
              <span>{activeMembers} Lunas</span>
              <span>{pendingMembers + overdueMembers} Tertunda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Analysis and Payment Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Analysis Box with Tabs (Feature 1 integrated) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-lg font-bold text-slate-950">Analisis Kas Karang Taruna</h4>
              <p className="text-xs text-slate-500">Pemantauan detail anggaran, arus kas, dan sasaran organisasi.</p>
            </div>

            {/* Sub-tabs inside Cash Flow block */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 rounded-lg text-xs font-semibold w-full sm:w-auto min-w-[240px]">
              <button
                onClick={() => setAnalysisTab('arus_kas')}
                className={`py-1.5 px-3 rounded-md transition-all text-center cursor-pointer ${
                  analysisTab === 'arus_kas'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Distribusi Arus Kas
              </button>
              <button
                onClick={() => setAnalysisTab('target_anggaran')}
                className={`py-1.5 px-3 rounded-md transition-all text-center cursor-pointer ${
                  analysisTab === 'target_anggaran'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Target Bulanan
              </button>
            </div>
          </div>

          {analysisTab === 'arus_kas' ? (
            <div className="space-y-6">
              {/* Visual Balance Bar */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                  <span>Rasio Pemasukan vs Pengeluaran</span>
                  <span>Kas Bersih: {formatIDR(currentBalance)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${totalIncome > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 50}%` }}
                    title={`Pemasukan: ${Math.round((totalIncome / (totalIncome + totalExpense || 1)) * 100)}%`}
                  ></div>
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{ width: `${totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 50}%` }}
                    title={`Pengeluaran: ${Math.round((totalExpense / (totalIncome + totalExpense || 1)) * 100)}%`}
                  ></div>
                </div>
                <div className="flex gap-4 mt-2.5 text-xs text-slate-500 justify-center">
                  <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5 inline-block"></span>
                    Pemasukan ({formatIDR(totalIncome)})
                  </div>
                  <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5 inline-block"></span>
                    Pengeluaran ({formatIDR(totalExpense)})
                  </div>
                </div>
              </div>

              {/* Category Bars */}
              <div className="border-t border-slate-100 pt-6">
                <h5 className="text-sm font-bold text-slate-800 mb-4">Pengeluaran & Pemasukan Berdasarkan Kategori</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Alokasi Pengeluaran</p>
                    {(Object.keys(categorySummary) as Array<keyof typeof categorySummary>)
                      .filter((cat) => ['Belanja Kegiatan', 'Operasional Rapat', 'Properti & Perlengkapan', 'Lain-lain'].includes(cat))
                      .map((cat) => {
                        const amount = categorySummary[cat] || 0;
                        const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-700 font-medium">{cat}</span>
                              <span className="text-slate-900 font-semibold">{formatIDR(amount)} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    {transactions.filter((t) => t.type === 'pengeluaran').length === 0 && (
                      <p className="text-xs text-slate-400 italic">Belum ada pengeluaran dicatat.</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Sumber Pemasukan</p>
                    {(Object.keys(categorySummary) as Array<keyof typeof categorySummary>)
                      .filter((cat) => ['Iuran Rutin', 'Donasi / Sponsor', 'Dana Usaha', 'Kas Sosial'].includes(cat))
                      .map((cat) => {
                        const amount = categorySummary[cat] || 0;
                        const percentage = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-700 font-medium">{cat}</span>
                              <span className="text-slate-900 font-semibold">{formatIDR(amount)} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    {transactions.filter((t) => t.type === 'pemasukan').length === 0 && (
                      <p className="text-xs text-slate-400 italic">Belum ada pemasukan dicatat.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Target & Realisasi Bulanan (Feature 1 implementation) */
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5 text-indigo-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Sistem Anggaran & Target Finansial</span>
                    <p className="text-[10px] text-slate-500">Bandingkan akumulasi kas riil dengan plafon bulanan.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTargetSettings(!showTargetSettings)}
                  className="py-1.5 px-3 bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <Settings className="h-3.5 w-3.5" />
                  {showTargetSettings ? 'Selesai Ubah' : 'Atur Target Anggaran'}
                </button>
              </div>

              {/* Editing Category Targets panel */}
              {showTargetSettings && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
                  {Object.keys(categoryTargets).map((cat) => {
                    const isIncome = ['Iuran Rutin', 'Donasi / Sponsor', 'Dana Usaha'].includes(cat);
                    return (
                      <div key={cat} className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-600 uppercase flex items-center justify-between">
                          <span>{cat}</span>
                          <span className={isIncome ? 'text-emerald-700' : 'text-rose-700'}>
                            {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[10px] font-extrabold text-slate-400">Rp</span>
                          <input
                            type="number"
                            step={100000}
                            min={100000}
                            value={categoryTargets[cat]}
                            onChange={(e) => handleUpdateTarget(cat, Number(e.target.value))}
                            className="w-full pl-7 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Progress Toward Targets UI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Income Targets Column */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-l-4 border-emerald-500 pl-2">Target Pemasukan Kas</h5>
                  <div className="space-y-3.5">
                    {['Iuran Rutin', 'Donasi / Sponsor', 'Dana Usaha'].map((cat) => {
                      const actual = categorySummary[cat] || 0;
                      const target = categoryTargets[cat] || 1000000;
                      const pct = Math.min(Math.round((actual / target) * 100), 100);
                      const isComplete = actual >= target;

                      return (
                        <div key={cat} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{cat}</span>
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span className="text-slate-500">{formatIDR(actual)} /</span>
                              <span className="text-slate-400 font-normal">{formatIDR(target).replace(/\,00$/, '')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className={`text-[10px] font-extrabold shrink-0 w-8 text-right ${isComplete ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {pct}%
                            </span>
                          </div>
                          {isComplete && (
                            <p className="text-[9px] font-extrabold text-emerald-600 flex items-center gap-1 mt-1">
                              <CheckCircle className="h-3 w-3" /> Target Pemasukan Tercapai!
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expense Limits Column */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-l-4 border-rose-500 pl-2">Limit Belanja & Operasional</h5>
                  <div className="space-y-3.5">
                    {['Belanja Kegiatan', 'Operasional Rapat', 'Properti & Perlengkapan'].map((cat) => {
                      const actual = categorySummary[cat] || 0;
                      const limit = categoryTargets[cat] || 1000000;
                      const pct = Math.min(Math.round((actual / limit) * 100), 100);
                      const isOver = actual > limit;
                      const isWarning = actual >= limit * 0.8 && actual <= limit;

                      return (
                        <div key={cat} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{cat}</span>
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-700'}>{formatIDR(actual)} /</span>
                              <span className="text-slate-400 font-normal">{formatIDR(limit).replace(/\,00$/, '')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  isOver ? 'bg-rose-600 animate-pulse' : isWarning ? 'bg-amber-500' : 'bg-indigo-600'
                                }`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className={`text-[10px] font-extrabold shrink-0 w-8 text-right ${isOver ? 'text-rose-600' : 'text-slate-500'}`}>
                              {pct}%
                            </span>
                          </div>
                          {isOver ? (
                            <p className="text-[9px] font-extrabold text-rose-600 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3" /> Pengeluaran Melampaui Limit Anggaran!
                            </p>
                          ) : isWarning ? (
                            <p className="text-[9px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                              <Info className="h-3 w-3" /> Mendekati batas limit pengeluaran (80%+).
                            </p>
                          ) : (
                            <p className="text-[9px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                              <CheckCircle className="h-3 w-3" /> Anggaran aman di dalam batas limit.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Member Fee Alerts */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-950 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Notifikasi Pembayaran Kas
            </h4>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {members
                .filter((m) => m.status === 'Menunggak' || m.status === 'Belum Lunas')
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{member.name}</h5>
                      <p className="text-[10px] text-slate-500">
                        {member.status === 'Menunggak' ? 'Menunggak > 2 bulan' : 'Belum Lunas bulan ini'}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        member.status === 'Menunggak'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}
                    >
                      {member.status}
                    </span>
                  </div>
                ))}

              {members.filter((m) => m.status !== 'Lunas').length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
                  <p className="text-xs font-medium text-slate-800">Semua Anggota Lunas</p>
                  <p className="text-[10px] text-slate-400">Kerja bagus, penagihan berjalan optimal!</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onTabChange('Anggota')}
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex justify-center items-center shrink-0 cursor-pointer"
          >
            Kirim Tagihan / Kelola Anggota
          </button>
        </div>
      </div>

      {/* Kalkulator Pintar Proyeksi Kas & Iuran (Feature 3 implementation) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">⚡ Kalkulator Pintar Proyeksi Kas & Rencana Iuran</h3>
            <p className="text-xs text-slate-500">Simulasikan kenaikan iuran wajib pemuda atau keaktifan anggota untuk memproyeksikan target saldo kas di masa depan.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Parameters Sliders */}
          <div className="lg:col-span-2 space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">Atur Parameter Simulasi</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parameter 1: Fee */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Besar Iuran Wajib Bulanan</span>
                  <span className="font-extrabold text-indigo-600 font-mono">{formatIDR(calcFee)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="5000"
                  value={calcFee}
                  onChange={(e) => setCalcFee(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Parameter 2: Member count */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Jumlah Pemuda Anggota Kas</span>
                  <span className="font-extrabold text-indigo-600 font-mono">{calcMembers} Orang</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={calcMembers}
                  onChange={(e) => setCalcMembers(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Parameter 3: Compliance Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Target Tingkat Kepatuhan Bayar</span>
                  <span className="font-extrabold text-indigo-600 font-mono">{calcCompliance}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={calcCompliance}
                  onChange={(e) => setCalcCompliance(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Parameter 4: Duration */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">Durasi Proyeksi Kas</span>
                  <span className="font-extrabold text-indigo-600 font-mono">{calcDuration} Bulan</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={calcDuration}
                  onChange={(e) => setCalcDuration(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Parameter 5: Extra Monthly Income */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-200/50">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">Estimasi Dana Usaha & Donasi Tambahan (Per Bulan)</span>
                <span className="font-extrabold text-indigo-600 font-mono">{formatIDR(calcExtraIncome)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000000"
                step="50000"
                value={calcExtraIncome}
                onChange={(e) => setCalcExtraIncome(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Outputs Panel with projection charts and CTA button */}
          <div className="p-5 bg-gradient-to-br from-[#0f172a] to-slate-800 rounded-2xl text-white flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">Hasil Proyeksi Masa Depan</span>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Iuran Per Bulan:</span>
                  <span className="font-mono text-white font-semibold">{formatIDR(calcMonthlyMembershipIncome)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Total Iuran ({calcDuration} bln):</span>
                  <span className="font-mono text-white font-semibold">{formatIDR(calcTotalMembershipIncome)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Hasil Donasi/Usaha ({calcDuration} bln):</span>
                  <span className="font-mono text-white font-semibold">{formatIDR(calcTotalExtraIncome)}</span>
                </div>
                <div className="border-t border-slate-700 my-2 pt-2 flex justify-between text-xs text-indigo-300 font-bold">
                  <span>Akumulasi Dana Baru:</span>
                  <span className="font-mono">{formatIDR(calcTotalProjectedExtra)}</span>
                </div>
              </div>

              <div className="bg-indigo-900/40 border border-indigo-800/60 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Proyeksi Total Saldo Akhir</span>
                <p className="text-xl font-extrabold text-white font-mono">{formatIDR(calcGrandTotalProjected)}</p>
              </div>
            </div>

            <button
              onClick={handleCopyCalcNarrative}
              className={`w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                calcCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {calcCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {calcCopied ? 'Tersalin!' : 'Salin Pesan Komitmen WA'}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Leaderboard (Horizontal Layout) & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peringkat Kas (Leaderboard) takes 2 columns, spanning horizontally */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-950 flex items-center">
                  <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                  Peringkat Kas Anggota
                </h4>
                <p className="text-[11px] text-slate-500">Apresiasi kedisiplinan iuran warga</p>
              </div>

              {/* Tab Buttons */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 rounded-lg text-xs font-semibold w-full sm:w-auto min-w-[200px]">
                <button
                  onClick={() => setLeaderboardTab('terbanyak')}
                  className={`py-1.5 px-3 rounded-md transition-all text-center cursor-pointer ${
                    leaderboardTab === 'terbanyak'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Terbanyak
                </button>
                <button
                  onClick={() => setLeaderboardTab('rutin')}
                  className={`py-1.5 px-3 rounded-md transition-all text-center cursor-pointer ${
                    leaderboardTab === 'rutin'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rutin / Disiplin
                </button>
              </div>
            </div>

            {/* Render Horizontal Grid Items */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-2">
              {(leaderboardTab === 'terbanyak' ? topPayers : topRutinPayers).map((member, index) => {
                const initials = member.name
                  .split(' ')
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join('')
                  .toUpperCase();

                const rank = index + 1;
                let rankIcon = null;
                let rankBadgeStyles = '';

                if (rank === 1) {
                  rankIcon = <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0 inline" />;
                  rankBadgeStyles = 'bg-amber-100 text-amber-800 border-amber-200';
                } else if (rank === 2) {
                  rankIcon = <Crown className="h-3.5 w-3.5 text-slate-400 shrink-0 inline" />;
                  rankBadgeStyles = 'bg-slate-100 text-slate-800 border-slate-200';
                } else if (rank === 3) {
                  rankIcon = <Crown className="h-3.5 w-3.5 text-amber-600 shrink-0 inline" />;
                  rankBadgeStyles = 'bg-amber-50 text-amber-900 border-amber-100';
                } else {
                  rankIcon = <Medal className="h-3.5 w-3.5 text-slate-300 shrink-0 inline" />;
                  rankBadgeStyles = 'bg-slate-50 text-slate-600 border-slate-200';
                }

                return (
                  <div
                    key={member.id}
                    onClick={() => onSelectMember?.(member)}
                    className="group flex flex-col justify-between items-center text-center p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl transition-all hover:bg-white hover:border-indigo-200 hover:shadow-sm relative cursor-pointer"
                    title="Klik untuk lihat detail anggota"
                  >
                    {/* Rank Badge */}
                    <span className={`absolute top-2 left-2 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-extrabold ${rankBadgeStyles}`}>
                      {rank}
                    </span>

                    {/* Avatar initials */}
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 mb-2 mt-1">
                      {initials}
                    </div>

                    {/* Name & Subtitle */}
                    <div className="w-full min-w-0">
                      <h5 className="text-xs font-bold text-slate-800 flex items-center justify-center gap-0.5">
                        {rankIcon}
                        <span className="truncate max-w-[100px]" title={member.name}>{member.name}</span>
                      </h5>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {leaderboardTab === 'terbanyak' 
                          ? (member.status === 'Lunas' ? 'Lunas Bulan Ini' : `Status: ${member.status}`)
                          : `${member.lastPaymentDate ? formatPaymentDate(member.lastPaymentDate) : '-'}`
                        }
                      </p>
                    </div>

                    {/* Value detail */}
                    <div className="mt-3 w-full">
                      {leaderboardTab === 'terbanyak' ? (
                        <span className="text-[11px] font-extrabold text-slate-900 bg-white group-hover:bg-indigo-50 group-hover:text-indigo-600 px-1.5 py-1 rounded border border-slate-200 transition-all block w-full truncate font-mono">
                          {formatIDR(member.totalPaid).replace(/\,00$/, '')}
                        </span>
                      ) : (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full block w-full text-center ${
                          member.status === 'Lunas'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : member.status === 'Belum Lunas'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {member.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold mb-2">Aksi Cepat Pengurus</h4>
            <p className="text-xs text-indigo-200 mb-5">Pencatatan real-time memperkecil risiko selisih hitung fisik.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onOpenAddTransaction}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wallet className="h-4 w-4" />
              Catat Pemasukan / Pengeluaran
            </button>
            <button
              onClick={() => onTabChange('Laporan')}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              Draf Laporan Pertanggungjawaban (LPJ)
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Kegiatan/Program & Progress */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-base font-bold text-slate-950">Status Kegiatan & Anggaran</h4>
            <p className="text-xs text-slate-500">Pemantauan realisasi anggaran pengeluaran per kegiatan organisasi</p>
          </div>
          <button
            onClick={() => onTabChange('Laporan')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center cursor-pointer"
          >
            Lihat Laporan LPJ &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activities.map((act) => {
            // Calculate dynamic spent from actual transactions
            const expense = transactions
              .filter((t) => t.activityName === act.name && t.type === 'pengeluaran')
              .reduce((sum, t) => sum + t.amount, 0);

            const pctUsed = Math.min(Math.round((expense / act.allocatedBudget) * 100), 100);
            return (
              <div key={act.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        act.status === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}
                    >
                      {act.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.date}</span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-800 mb-1">{act.name}</h5>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{act.description}</p>
                </div>

                <div className="space-y-1 mt-auto pt-2 border-t border-slate-200/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Realisasi Anggaran</span>
                    <span className="text-slate-900 font-semibold">{pctUsed}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${pctUsed > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${pctUsed}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>Terpakai: {formatIDR(expense)}</span>
                    <span>Plafon: {formatIDR(act.allocatedBudget)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {activities.length === 0 && (
            <p className="col-span-3 text-center text-xs text-slate-400 italic py-6">Belum ada kegiatan dalam agenda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
