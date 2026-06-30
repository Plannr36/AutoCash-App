import React from 'react';
import { X, User, Phone, Calendar, Wallet, CheckCircle, AlertTriangle, Clock, History, Send, ShieldAlert } from 'lucide-react';
import { Member, Transaction, AuditLog } from '../types';

interface MemberDetailModalProps {
  member: Member;
  transactions: Transaction[];
  auditLogs: AuditLog[];
  onClose: () => void;
  onUpdateMemberStatus?: (id: string, currentStatus: Member['status']) => void;
}

export default function MemberDetailModal({
  member,
  transactions,
  auditLogs,
  onClose,
  onUpdateMemberStatus,
}: MemberDetailModalProps) {
  // Format IDR helper
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Find transactions associated with this member
  // Match by searching member's name in transaction description (case insensitive)
  const memberTransactions = transactions.filter((t) => {
    return t.description.toLowerCase().includes(member.name.toLowerCase());
  });

  // Find audit logs associated with this member's name
  const memberLogs = auditLogs.filter((log) => {
    return log.details.toLowerCase().includes(member.name.toLowerCase());
  });

  // Calculate outstanding/estimation
  const getOutstandingAmount = () => {
    if (member.status === 'Lunas') return 0;
    if (member.status === 'Belum Lunas') return 50000;
    return 100000; // Menunggak (typically 2 months or more)
  };

  // Generate direct WA reminder URL
  const getWhatsAppShareUrl = () => {
    const text = `Halo ${member.name}, ini adalah pengingat otomatis dari pengurus Karang Taruna Debegan. Mohon menyelesaikan iuran kas bulanan Anda sebesar ${formatIDR(getOutstandingAmount())}. Anda bisa langsung menyerahkan tunai ke bendahara atau transfer. Terima kasih atas partisipasinya!`;
    return `https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
              {member.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {member.name}
                <span className="text-[10px] text-slate-400 font-mono">({member.id})</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">Profil Detail & Riwayat Iuran Kas</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-200/50 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Status and Primary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Status Card */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Status Saat Ini</span>
              <div className="my-2">
                <span
                  className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                    member.status === 'Lunas'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : member.status === 'Belum Lunas'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}
                >
                  {member.status}
                </span>
              </div>
              {onUpdateMemberStatus && (
                <button
                  onClick={() => onUpdateMemberStatus(member.id, member.status)}
                  className="mt-1 text-left text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="h-3 w-3" />
                  {member.status === 'Lunas' ? 'Ubah ke Belum Lunas' : 'Tandai Lunas Sekarang'}
                </button>
              )}
            </div>

            {/* Total Paid Card */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Disetor</span>
              <div className="my-2">
                <p className="text-lg font-black text-slate-800 font-mono">
                  {formatIDR(member.totalPaid)}
                </p>
              </div>
              <p className="text-[10px] text-slate-500">
                Akumulasi seluruh kontribusi iuran wajib.
              </p>
            </div>

            {/* Unpaid Bill Card */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Estimasi Tagihan</span>
              <div className="my-2">
                <p className={`text-lg font-black font-mono ${getOutstandingAmount() > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatIDR(getOutstandingAmount())}
                </p>
              </div>
              <p className="text-[10px] text-slate-500">
                {getOutstandingAmount() > 0 ? 'Iuran yang belum dibayar' : 'Iuran lunas untuk bulan ini'}
              </p>
            </div>

          </div>

          {/* Member Metadata Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-slate-400 font-medium">Nomor Telepon / WhatsApp</span>
                <p className="font-bold text-slate-700 font-mono mt-0.5">{member.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <span className="text-slate-400 font-medium">Tanggal Setoran Terakhir</span>
                <p className="font-bold text-slate-700 font-mono mt-0.5">
                  {member.lastPaymentDate ? member.lastPaymentDate : 'Belum Pernah'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History (Pemasukan dari Transaksi) */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <History className="h-4 w-4 text-indigo-500" />
              Catatan Pembayaran Terdaftar
            </h5>

            <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-[180px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Tanggal</th>
                    <th className="py-2.5 px-4">Deskripsi Transaksi</th>
                    <th className="py-2.5 px-4 text-right">Nominal</th>
                    <th className="py-2.5 px-4">Dicatat Oleh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {memberTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-mono">{t.date}</td>
                      <td className="py-2.5 px-4 font-medium">{t.description}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 font-mono">{formatIDR(t.amount)}</td>
                      <td className="py-2.5 px-4 text-slate-500">{t.createdBy}</td>
                    </tr>
                  ))}

                  {memberTransactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                        {member.totalPaid > 0 ? (
                          <div className="space-y-1">
                            <p>Pembayaran historis terdaftar secara kolektif.</p>
                            <p className="text-[10px] text-slate-400 font-normal">Data setoran awal sebesar {formatIDR(member.totalPaid)} sudah tercatat dalam saldo utama.</p>
                          </div>
                        ) : (
                          "Belum ada riwayat pembayaran iuran yang tercatat."
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs / Activity History (Riwayat Aktivitas Pengurus) */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldAlert className="h-4 w-4 text-slate-400" />
              Log Aktivitas & Riwayat Perubahan Status
            </h5>

            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {memberLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-700">{log.details}</p>
                    <p className="text-[9px] text-slate-400 font-mono">Diperbarui oleh {log.user}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
                </div>
              ))}

              {memberLogs.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Belum ada log aktivitas pengurus terkait anggota ini.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex flex-col sm:flex-row gap-2 shrink-0">
          {member.status !== 'Lunas' ? (
            <a
              href={getWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              Kirim Notifikasi WA Langsung
            </a>
          ) : (
            <div className="flex-1 bg-emerald-50 border border-emerald-100 text-emerald-800 p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
              Iuran Kas Bulan Ini Lunas
            </div>
          )}

          <button
            onClick={onClose}
            className="sm:w-32 py-2.5 border border-slate-200 hover:bg-slate-100 bg-white text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
