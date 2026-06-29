import React, { useState, useRef } from 'react';
import { Search, Plus, Trash2, Edit2, Download, Upload, X, Filter, CheckCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Transaction, TransactionCategory, TransactionType, Activity } from '../types';

interface TransactionManagerProps {
  transactions: Transaction[];
  activities: Activity[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (id: string, updated: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  currentOfficer: string;
  isPeriodClosed: boolean; // Simulation of "Tutup Buku" lock
}

export default function TransactionManager({
  transactions,
  activities,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  currentOfficer,
  isPeriodClosed,
}: TransactionManagerProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | 'all'>('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form Fields
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'));
  const [formType, setFormType] = useState<TransactionType>('pemasukan');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('Iuran Rutin');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formActivity, setFormActivity] = useState('');
  const [formReceipt, setFormReceipt] = useState<string | null>(null);

  // Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  // Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: TransactionCategory[] = [
    'Iuran Rutin',
    'Donasi / Sponsor',
    'Dana Usaha',
    'Kas Sosial',
    'Belanja Kegiatan',
    'Operasional Rapat',
    'Properti & Perlengkapan',
    'Lain-lain',
  ];

  // IDR Formatter
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Hanya diperbolehkan mengunggah file gambar (PNG, JPG, JPEG)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormReceipt(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setFormReceipt(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    if (isPeriodClosed) {
      alert('Akses Ditolak: Transaksi tidak dapat ditambahkan karena periode saat ini berstatus "Tutup Buku" / Terkunci.');
      return;
    }
    setEditingTransaction(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':'));
    setFormType('pemasukan');
    setFormCategory('Iuran Rutin');
    setFormAmount('');
    setFormDescription('');
    setFormActivity('');
    setFormReceipt(null);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (t: Transaction) => {
    if (isPeriodClosed) {
      alert('Akses Ditolak: Transaksi pada periode ini sudah dikunci ("Tutup Buku") dan tidak dapat diubah.');
      return;
    }
    setEditingTransaction(t);
    setFormDate(t.date);
    setFormTime(t.time);
    setFormType(t.type);
    setFormCategory(t.category);
    setFormAmount(t.amount.toString());
    setFormDescription(t.description);
    setFormActivity(t.activityName || '');
    setFormReceipt(t.receiptImage || null);
    setErrors({});
    setIsModalOpen(true);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formDate) newErrors.date = 'Tanggal wajib diisi!';
    if (!formAmount || isNaN(Number(formAmount)) || Number(formAmount) <= 0) {
      newErrors.amount = 'Nominal harus diisi dengan angka positif!';
    }
    if (!formDescription.trim()) newErrors.description = 'Keterangan transaksi wajib diisi!';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const transactionData = {
      date: formDate,
      time: formTime,
      type: formType,
      category: formCategory,
      amount: Number(formAmount),
      description: formDescription,
      activityName: formActivity || undefined,
      receiptImage: formReceipt,
      createdBy: editingTransaction ? editingTransaction.createdBy : currentOfficer,
    };

    if (editingTransaction) {
      onEditTransaction(editingTransaction.id, transactionData);
    } else {
      onAddTransaction(transactionData);
    }

    setIsModalOpen(false);
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.activityName && t.activityName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || t.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan keterangan atau kegiatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Jenis */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TransactionType | 'all')}
              className="border border-slate-200 rounded-lg py-1.5 px-3 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Jenis (Arus)</option>
              <option value="pemasukan">Pemasukan Kas</option>
              <option value="pengeluaran">Pengeluaran Kas</option>
            </select>

            {/* Filter Kategori */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory | 'all')}
              className="border border-slate-200 rounded-lg py-1.5 px-3 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Add Button */}
            <button
              onClick={handleOpenAdd}
              disabled={isPeriodClosed}
              className={`py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs ${
                isPeriodClosed ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Plus className="h-4 w-4" />
              Catat Baru
            </button>
          </div>
        </div>
      </div>

      {/* Closed Period Alert */}
      {isPeriodClosed && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold">Periode Keuangan Ditutup ("Tutup Buku")</h5>
            <p className="text-[11px] mt-0.5">
              Pembukuan kas saat ini dikunci untuk proses pelaporan LPJ bulanan. Anda hanya dapat melihat data
              transaksi dan tidak diizinkan untuk menambah, mengubah, atau menghapus catatan.
            </p>
          </div>
        </div>
      )}

      {/* Transactions Table / List */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Arus</th>
                <th className="py-3 px-4">Kategori / Kegiatan</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4">Bukti</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Tanggal & Waktu */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-950 font-mono">{t.date}</span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{t.time} WIB</span>
                  </td>

                  {/* Arus */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.type === 'pemasukan'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      {t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>

                  {/* Kategori / Kegiatan */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 block">{t.category}</span>
                    {t.activityName ? (
                      <span className="inline-block mt-0.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium border border-slate-200/50">
                        {t.activityName}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Umum</span>
                    )}
                  </td>

                  {/* Keterangan */}
                  <td className="py-3 px-4 max-w-[240px] text-slate-600 truncate" title={t.description}>
                    {t.description}
                  </td>

                  {/* Nominal */}
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <span
                      className={`font-bold font-mono ${
                        t.type === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {t.type === 'pemasukan' ? '+' : '-'} {formatIDR(t.amount)}
                    </span>
                  </td>

                  {/* Petugas */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-medium">
                    {t.createdBy}
                  </td>

                  {/* Bukti Fisik */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {t.receiptImage ? (
                      <button
                        onClick={() => {
                          const w = window.open();
                          w?.document.write(`<img src="${t.receiptImage}" style="max-width:100%" />`);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-[10px] font-semibold">Ada Bukti</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Tidak ada</span>
                    )}
                  </td>

                  {/* Aksi */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        disabled={isPeriodClosed}
                        title="Edit Transaksi"
                        className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(`Apakah Anda yakin ingin menghapus catatan transaksi "${t.description}"?`)
                          ) {
                            onDeleteTransaction(t.id);
                          }
                        }}
                        disabled={isPeriodClosed}
                        title="Hapus Transaksi"
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    Tidak ada riwayat transaksi ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-slate-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
              <h4 className="text-sm font-bold text-slate-950">
                {editingTransaction ? 'Edit Log Transaksi' : 'Catat Transaksi Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                {/* Tanggal */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className={`w-full p-2 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden ${
                      errors.date ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200'
                    }`}
                  />
                  {errors.date && <p className="text-[10px] text-rose-500 font-medium">{errors.date}</p>}
                </div>

                {/* Waktu */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Waktu (WIB)</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="Contoh: 14:30"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Jenis Arus */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Arus Aliran Kas</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormType('pemasukan');
                        setFormCategory('Iuran Rutin');
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        formType === 'pemasukan'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Pemasukan (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormType('pengeluaran');
                        setFormCategory('Belanja Kegiatan');
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        formType === 'pengeluaran'
                          ? 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Pengeluaran (-)
                    </button>
                  </div>
                </div>

                {/* Kategori */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kategori Anggaran</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TransactionCategory)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {categories
                      .filter((cat) => {
                        if (formType === 'pemasukan') {
                          return ['Iuran Rutin', 'Donasi / Sponsor', 'Dana Usaha', 'Kas Sosial', 'Lain-lain'].includes(cat);
                        } else {
                          return ['Belanja Kegiatan', 'Operasional Rapat', 'Properti & Perlengkapan', 'Kas Sosial', 'Lain-lain'].includes(cat);
                        }
                      })
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Nominal */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700">Nominal Transaksi (Rupiah)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">Rp</span>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="Contoh: 150000"
                      className={`w-full pl-9 pr-4 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden ${
                        errors.amount ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {errors.amount && <p className="text-[10px] text-rose-500 font-medium">{errors.amount}</p>}
                </div>

                {/* Link to Activity */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700">Alokasi Kegiatan (Opsi)</label>
                  <select
                    value={formActivity}
                    onChange={(e) => setFormActivity(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="">-- Tidak dikaitkan (Kas Umum) --</option>
                    {activities.map((act) => (
                      <option key={act.id} value={act.name}>
                        {act.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Keterangan */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Keterangan / Rincian</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: Pembelian jajanan, snack dan air minum aqua gelas rapat bulanan"
                  rows={2}
                  className={`w-full p-2 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden ${
                    errors.description ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200'
                  }`}
                ></textarea>
                {errors.description && <p className="text-[10px] text-rose-500 font-medium">{errors.description}</p>}
              </div>

              {/* Physical Receipt File Upload (Drag and Drop + Click) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Unggah Bukti Transaksi (Kuitansi / Nota Fisik / Transfer)</label>
                {!formReceipt ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-indigo-600 bg-indigo-50/40'
                        : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Seret & taruh foto bukti di sini, atau klik untuk memilih</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Hanya file gambar (.png, .jpg, .jpeg)</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl relative">
                    <img src={formReceipt} alt="Bukti kuitansi" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">Foto Bukti Terunggah</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Siap disimpan di database digital</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="p-1 hover:bg-slate-200 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-xs"
                >
                  {editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
