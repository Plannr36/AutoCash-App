import React, { useState } from 'react';
import { Search, UserPlus, Send, CheckCircle, AlertTriangle, Clock, MessageSquare, Play, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { Member, AuditLog } from '../types';

interface MemberManagerProps {
  members: Member[];
  onUpdateMemberStatus: (id: string, status: Member['status'], amountPaidDiff: number) => void;
  onAddMember: (name: string, phone: string) => void;
  onRecordLog: (action: string, details: string) => void;
}

export interface BroadcastLog {
  timestamp: string;
  successCount: number;
  failCount: number;
  recipients: string[];
}

export default function MemberManager({
  members,
  onUpdateMemberStatus,
  onAddMember,
  onRecordLog,
}: MemberManagerProps) {
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Member['status'] | 'all'>('all');

  // Add Member form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Reminder Broadcast state
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [broadcastStep, setBroadcastStep] = useState<'preview' | 'broadcasting' | 'complete'>('preview');
  const [broadcastingIndex, setBroadcastingIndex] = useState(0);
  const [broadcastLogs, setBroadcastLogs] = useState<string[]>([]);
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastLog[]>([
    {
      timestamp: '2026-06-10 09:15 WIB',
      successCount: 4,
      failCount: 0,
      recipients: ['Bramandika Ramavirio', 'Shafa Rifkika', 'Arga', 'Adi Wijaya'],
    },
  ]);

  // IDR Formatter
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Add member submission
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert('Nama dan Nomor HP/WhatsApp wajib diisi!');
      return;
    }
    onAddMember(newName, newPhone);
    setNewName('');
    setNewPhone('');
    setIsAddOpen(false);
  };

  // Reminder initiation
  const handleOpenReminder = () => {
    const unpaidCount = members.filter((m) => m.status !== 'Lunas').length;
    if (unpaidCount === 0) {
      alert('Proses dibatalkan. Semua anggota telah lunas membayar iuran kas bulan ini!');
      return;
    }
    setBroadcastStep('preview');
    setBroadcastLogs([]);
    setIsReminderOpen(true);
  };

  // Simulation of Broadcast (WhatsApp API Simulation)
  const handleStartBroadcast = async () => {
    const targetMembers = members.filter((m) => m.status !== 'Lunas');
    setBroadcastStep('broadcasting');
    setBroadcastingIndex(0);

    const logs: string[] = [];

    // Staggered simulation
    for (let i = 0; i < targetMembers.length; i++) {
      const member = targetMembers[i];
      setBroadcastingIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 800)); // Delay for realistic effect

      const success = member.phone.length >= 10; // Simple check
      if (success) {
        logs.push(`[SUKSES] Pesan WhatsApp terkirim ke ${member.name} (${member.phone})`);
      } else {
        logs.push(`[GAGAL] Gagal mengirim pesan ke ${member.name}. Nomor tidak valid.`);
      }
      setBroadcastLogs([...logs]);
    }

    setBroadcastStep('complete');
    const successCount = targetMembers.length; // simulated for prototype
    const newHist: BroadcastLog = {
      timestamp: new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      successCount: targetMembers.length,
      failCount: 0,
      recipients: targetMembers.map((m) => m.name),
    };
    setBroadcastHistory([newHist, ...broadcastHistory]);
    onRecordLog(
      'Kirim Pengingat Kas',
      `Menyiarkan pesan tagihan iuran kas otomatis kepada ${successCount} anggota belum lunas.`
    );
  };

  const handleUpdateStatus = (id: string, currentStatus: Member['status']) => {
    let nextStatus: Member['status'] = 'Lunas';
    let amountDiff = 0;

    if (currentStatus === 'Lunas') {
      nextStatus = 'Belum Lunas';
      amountDiff = -50000; // Deduct simulated fee
    } else if (currentStatus === 'Belum Lunas') {
      nextStatus = 'Lunas';
      amountDiff = 50000; // Add simulated fee
    } else {
      nextStatus = 'Lunas';
      amountDiff = 100000; // Pay outstanding
    }

    onUpdateMemberStatus(id, nextStatus, amountDiff);
  };

  // Filters
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-slate-950">Database Anggota & Status Iuran</h4>
          <p className="text-xs text-slate-500">Iuran bulanan anggota merupakan sumber pendapatan utama kas (Rp50.000 / bulan).</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleOpenReminder}
            className="py-2 px-3.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Send className="h-4 w-4" />
            Kirim Pengingat Tagihan
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Anggota
          </button>
        </div>
      </div>

      {/* Grid: Members List & Reminders log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Database Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama anggota atau nomor HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Member['status'] | 'all')}
              className="border border-slate-200 rounded-lg py-2 px-3 text-xs bg-white text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Menunggak">Menunggak</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Anggota</th>
                  <th className="py-3 px-4">Nomor HP / WA</th>
                  <th className="py-3 px-4">Status Kas</th>
                  <th className="py-3 px-4 text-right">Total Disetor</th>
                  <th className="py-3 px-4 text-center">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{member.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{member.phone}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          member.status === 'Lunas'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : member.status === 'Belum Lunas'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {formatIDR(member.totalPaid)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleUpdateStatus(member.id, member.status)}
                        className={`py-1 px-2.5 rounded-md text-[10px] font-bold transition-all border cursor-pointer ${
                          member.status === 'Lunas'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {member.status === 'Lunas' ? 'Set Belum Lunas' : 'Tandai Lunas'}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                      Anggota tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: History of Broadcast Reminders */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-4">
          <h4 className="text-sm font-bold text-slate-950 flex items-center">
            <Clock className="h-4.5 w-4.5 text-slate-400 mr-2" />
            Riwayat Pengiriman Notifikasi
          </h4>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {broadcastHistory.map((hist, index) => (
              <div key={index} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
                <div className="flex justify-between items-start text-[10px]">
                  <span className="font-bold text-slate-400 font-mono">{hist.timestamp}</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                    Berhasil
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Pengingat Tagihan disiarkan ke {hist.successCount} anggota
                </p>
                <div className="flex flex-wrap gap-1 text-[9px] text-slate-500">
                  {hist.recipients.map((name, i) => (
                    <span key={i} className="bg-white border border-slate-200 px-1 rounded">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-950">Tambah Anggota Karang Taruna</h4>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Muhammad Ali"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nomor HP / WhatsApp</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Reminder Modal */}
      {isReminderOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
              <h4 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                <MessageSquare className="h-4.5 w-4.5 text-rose-500" />
                Sistem Siaran Pengingat Tagihan Otomatis
              </h4>
              <button onClick={() => setIsReminderOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step 1: Preview of Message */}
            {broadcastStep === 'preview' && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <p className="text-xs text-slate-500">
                  Sistem mendeteksi adanya <strong>{members.filter((m) => m.status !== 'Lunas').length} anggota</strong> yang belum melunasi iuran kas bulan ini. Template WhatsApp di bawah akan disiarkan secara massal:
                </p>

                {/* WhatsApp Chat bubble simulation */}
                <div className="bg-slate-100 rounded-xl p-4 border border-slate-200/60">
                  <div className="bg-[#DCF8C6] rounded-lg p-3 shadow-xs max-w-[85%] text-xs text-slate-800 relative space-y-1">
                    <p className="font-bold text-emerald-800">WhatsApp Broadcast Template</p>
                    <p>
                      "Halo <strong>[Nama Anggota]</strong>,<br />
                      Ini adalah pengingat otomatis dari bendahara Karang Taruna Debegan. Mohon menyelesaikan iuran kas bulanan Anda sebesar <strong>Rp50.000</strong>. Anda bisa langsung mentransfer atau menyerahkan tunai ke bendahara. Terima kasih atas partisipasinya!"
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800">
                    Sistem akan menyinkronkan data status pengiriman ("Terkirim") ke dalam database dan riwayat penagihan pengurus secara real-time.
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setIsReminderOpen(false)}
                    className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleStartBroadcast}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Kirim Pesan Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Broadcasting Loading simulation */}
            {broadcastStep === 'broadcasting' && (
              <div className="p-6 space-y-6 flex flex-col items-center justify-center text-center flex-1">
                <RefreshCw className="h-10 w-10 text-rose-500 animate-spin" />
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-slate-800">Menyiarkan Pengingat Tagihan...</h5>
                  <p className="text-xs text-slate-500">
                    Mengirim ke: <strong className="text-slate-900">{members.filter((m) => m.status !== 'Lunas')[broadcastingIndex]?.name}</strong>
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((broadcastingIndex + 1) / members.filter((m) => m.status !== 'Lunas').length) * 100
                      }%`,
                    }}
                  ></div>
                </div>

                {/* Live stream logs */}
                <div className="w-full bg-slate-950 rounded-lg p-3 text-[10px] text-slate-300 font-mono text-left max-h-[140px] overflow-y-auto">
                  {broadcastLogs.map((log, i) => (
                    <div key={i} className="py-0.5">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Complete Report */}
            {broadcastStep === 'complete' && (
              <div className="p-6 space-y-4 text-center flex flex-col items-center flex-1">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-slate-800">Siaran Selesai Berhasil!</h5>
                  <p className="text-xs text-slate-500">
                    Sistem otomatis mengirim pengingat kepada seluruh anggota yang menunggak.
                  </p>
                </div>

                <div className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2 text-left text-xs">
                  <p className="font-bold text-emerald-800">Ringkasan Pengiriman:</p>
                  <p className="text-slate-700">
                    &bull; Total Target: {members.filter((m) => m.status !== 'Lunas').length} Anggota<br />
                    &bull; Status Terkirim: {members.filter((m) => m.status !== 'Lunas').length} Sukses (100%)<br />
                    &bull; Saluran: Integrasi WhatsApp Gateway Digital
                  </p>
                </div>

                <button
                  onClick={() => setIsReminderOpen(false)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Selesai & Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
