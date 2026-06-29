import React from 'react';
import { History, Shield, Info, Database } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export default function AuditLogViewer({ logs }: AuditLogViewerProps) {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-950">Sistem Log Riwayat Transaksi (Audit Trail)</h4>
          <p className="text-xs text-slate-500">Merekam secara otomatis aktivitas administrasi pengurus secara kronologis untuk mencegah manipulasi data kas.</p>
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-400" />
            <h5 className="text-xs font-bold text-slate-900">Kronologi Aktivitas Pengurus</h5>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-100">
            {logs.length} Aktivitas Tercatat
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex gap-4 hover:bg-slate-50/30 transition-colors">
              {/* Icon badge */}
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                <Database className="h-4.5 w-4.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {log.user}
                    <span className="inline-block h-1 w-1 bg-slate-300 rounded-full"></span>
                    <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.2 rounded font-semibold">
                      {log.action}
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold whitespace-nowrap">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{log.details}</p>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="py-12 text-center text-slate-400 italic text-xs">
              Belum ada log aktivitas tercatat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
