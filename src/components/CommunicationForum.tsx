import React, { useState } from 'react';
import { MessageSquare, Send, Check, Shield, HelpCircle } from 'lucide-react';
import { ForumMessage } from '../types';

interface CommunicationForumProps {
  messages: ForumMessage[];
  onSendMessage: (content: string, role: ForumMessage['role']) => void;
  currentOfficer: string;
}

export default function CommunicationForum({
  messages,
  onSendMessage,
  currentOfficer,
}: CommunicationForumProps) {
  const [content, setContent] = useState('');
  const [selectedRole, setSelectedRole] = useState<ForumMessage['role']>('Bendahara 2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSendMessage(content.trim(), selectedRole);
    setContent('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Forum Discussion Feed */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-100 flex flex-col h-[520px]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-indigo-600" />
            <h5 className="text-xs font-bold text-slate-900">Ruang Koordinasi Pengurus (Internal)</h5>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            Koneksi Aktif (Real-Time)
          </span>
        </div>

        {/* Messages list */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isMe = msg.author === currentOfficer;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Initial Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0 select-none">
                  {msg.author.charAt(0)}
                </div>

                <div className="space-y-1">
                  {/* Name and Role */}
                  <div className={`flex items-center gap-2 text-[10px] ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="font-bold text-slate-900">{msg.author}</span>
                    <span className="text-slate-400 font-mono font-bold bg-slate-50 border border-slate-100 px-1 rounded">
                      {msg.role}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Speech bubble */}
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ForumMessage['role'])}
              className="border border-slate-200 rounded-lg py-1 px-2.5 text-[11px] bg-white font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
              title="Pilih Peran Anda"
            >
              <option value="Bendahara 1">Bendahara 1</option>
              <option value="Bendahara 2">Bendahara 2</option>
              <option value="Sekretaris 1">Sekretaris 1</option>
              <option value="Sekretaris 2">Sekretaris 2</option>
              <option value="Wakil Ketua">Wakil Ketua</option>
              <option value="Ketua">Ketua</option>
            </select>

            <input
              type="text"
              placeholder={`Ketik pesan koordinasi sebagai ${selectedRole}...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />

            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Discussion Info and Rules */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-4">
        <h4 className="text-sm font-bold text-slate-950 flex items-center">
          <Shield className="h-4.5 w-4.5 text-indigo-600 mr-2" />
          Protokol Validasi Transaksi
        </h4>

        <p className="text-xs text-slate-600">
          Untuk menjaga keakuratan neraca keuangan Karang Taruna Debegan, harap patuhi ketentuan diskusi internal pengurus harian berikut:
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex gap-2 text-xs">
            <div className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              1
            </div>
            <p className="text-slate-600">
              Setiap pengeluaran kas di atas <strong>Rp100.000</strong> wajib diklarifikasi oleh Bendahara 2 kepada Bendahara 1 sebelum dicatat.
            </p>
          </div>

          <div className="flex gap-2 text-xs">
            <div className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </div>
            <p className="text-slate-600">
              Pastikan foto kuitansi atau nota fisik diunggah ke log transaksi sebagai bukti digital untuk penyusunan LPJ bulanan.
            </p>
          </div>

          <div className="flex gap-2 text-xs">
            <div className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              3
            </div>
            <p className="text-slate-600">
              Laporan Pertanggungjawaban (LPJ) yang dicetak melalui sistem ini harus ditandatangani oleh Ketua Pelaksana Kegiatan, Bendahara, dan Ketua Karang Taruna secara luring setelah file dicetak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
