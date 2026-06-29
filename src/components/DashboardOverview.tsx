import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Users, Calendar, Wallet, CheckCircle, AlertTriangle, TrendingUp, Trophy, Crown, Medal } from 'lucide-react';
import { Transaction, Member, Activity } from '../types';

interface DashboardOverviewProps {
  transactions: Transaction[];
  members: Member[];
  activities: Activity[];
  onTabChange: (tab: string) => void;
  onOpenAddTransaction: () => void;
}

export default function DashboardOverview({
  transactions,
  members,
  activities,
  onTabChange,
  onOpenAddTransaction,
}: DashboardOverviewProps) {
  // Tab Leaderboard State
  const [leaderboardTab, setLeaderboardTab] = useState<'terbanyak' | 'rutin'>('terbanyak');

  // Calculations for Leaderboard
  const topPayers = [...members]
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 5);

  const topRutinPayers = [...members]
    .sort((a, b) => {
      // Weight by status: Lunas > Belum Lunas > Menunggak
      const statusWeight = { 'Lunas': 3, 'Belum Lunas': 2, 'Menunggak': 1 };
      const weightA = statusWeight[a.status] || 0;
      const weightB = statusWeight[b.status] || 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      
      // If both are Lunas, sort by lastPaymentDate (earlier date means paid sooner in the month!)
      if (a.lastPaymentDate && b.lastPaymentDate) {
        return a.lastPaymentDate.localeCompare(b.lastPaymentDate);
      }
      if (a.lastPaymentDate) return -1;
      if (b.lastPaymentDate) return 1;
      return 0;
    })
    .slice(0, 5);

  // Calculations
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

      {/* Main Grid: Visual Chart and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Cash Flow Structure */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold text-slate-950">Arus Kas & Distribusi Anggaran</h4>
              <p className="text-xs text-slate-500">Presentasi persentase pemakaian dana kas Karang Taruna</p>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
              Periode Juni 2026
            </span>
          </div>

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
                    className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100"
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
            className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex justify-center items-center shrink-0"
          >
            Kirim Tagihan / Kelola Anggota
          </button>
        </div>
      </div>

      {/* Row 2: Leaderboard (Horizontal Layout) & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
                  className={`py-1.5 px-3 rounded-md transition-all text-center ${
                    leaderboardTab === 'terbanyak'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Terbanyak
                </button>
                <button
                  onClick={() => setLeaderboardTab('rutin')}
                  className={`py-1.5 px-3 rounded-md transition-all text-center ${
                    leaderboardTab === 'rutin'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Terpatuh & Rutin
                </button>
              </div>
            </div>

            {/* List of ranked members - Horizontal Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {(leaderboardTab === 'terbanyak' ? topPayers : topRutinPayers).map((member, index) => {
                const rank = index + 1;
                
                // Styling for different ranks
                let rankBadgeStyles = "bg-slate-50 text-slate-500 border border-slate-100";
                let rankIcon = null;
                
                if (rank === 1) {
                  rankBadgeStyles = "bg-amber-50 text-amber-700 border border-amber-200 ring-2 ring-amber-400/10";
                  rankIcon = <Crown className="h-3 w-3 text-amber-500 inline-block mr-0.5" />;
                } else if (rank === 2) {
                  rankBadgeStyles = "bg-slate-100 text-slate-700 border border-slate-200 ring-2 ring-slate-400/5";
                  rankIcon = <Medal className="h-3 w-3 text-slate-400 inline-block mr-0.5" />;
                } else if (rank === 3) {
                  rankBadgeStyles = "bg-orange-50 text-orange-700 border border-orange-100 ring-2 ring-orange-400/5";
                  rankIcon = <Medal className="h-3 w-3 text-orange-600 inline-block mr-0.5" />;
                }

                // Helper to get initials
                const initials = member.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                // Format payment date
                const formatPaymentDate = (dateStr?: string) => {
                  if (!dateStr) return 'Belum bayar';
                  const date = new Date(dateStr);
                  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                };

                return (
                  <div
                    key={member.id}
                    className="flex flex-col items-center text-center p-3.5 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group relative"
                  >
                    {/* Rank number / Badge */}
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
                        <span className="text-[11px] font-extrabold text-slate-900 bg-white group-hover:bg-indigo-50 group-hover:text-indigo-600 px-1.5 py-1 rounded border border-slate-200 transition-all block w-full truncate">
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
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Wallet className="h-4 w-4" />
              Catat Pemasukan / Pengeluaran
            </button>
            <button
              onClick={() => onTabChange('Laporan')}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
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
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            Lihat Laporan LPJ &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activities.map((act) => {
            const pctUsed = Math.min(Math.round((act.actualExpense / act.allocatedBudget) * 100), 100);
            return (
              <div key={act.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between">
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
                    <span>Terpakai: {formatIDR(act.actualExpense)}</span>
                    <span>Plafon: {formatIDR(act.allocatedBudget)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
