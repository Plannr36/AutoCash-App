export type TransactionType = 'pemasukan' | 'pengeluaran';

export type TransactionCategory =
  | 'Iuran Rutin'
  | 'Donasi / Sponsor'
  | 'Dana Usaha'
  | 'Kas Sosial'
  | 'Belanja Kegiatan'
  | 'Operasional Rapat'
  | 'Properti & Perlengkapan'
  | 'Lain-lain';

export interface Transaction {
  id: string;
  date: string;
  time: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  activityName?: string; // Links to specific activity for LPJ
  receiptImage?: string | null; // Base64 string of physical receipt
  createdBy: string; // The official (e.g. "Mirachel Lovan", "Retma Ayu")
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  status: 'Lunas' | 'Belum Lunas' | 'Menunggak';
  totalPaid: number;
  lastPaymentDate?: string;
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  allocatedBudget: number;
  actualExpense: number;
  status: 'Direncanakan' | 'Berjalan' | 'Selesai';
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface ForumMessage {
  id: string;
  timestamp: string;
  author: string;
  role: 'Bendahara 1' | 'Bendahara 2' | 'Sekretaris 1' | 'Sekretaris 2' | 'Wakil Ketua' | 'Ketua' | 'Anggota';
  content: string;
  referenceId?: string; // optional reference to a transaction ID
}
