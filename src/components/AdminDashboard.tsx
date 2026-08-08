import { X, DollarSign, ShoppingCart, Users, Terminal } from 'lucide-react';

interface Transaction {
  id: string;
  userEmail: string;
  userName: string;
  projectTitle: string;
  amount: number;
  date: string;
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export default function AdminDashboard({ isOpen, onClose, transactions }: AdminDashboardProps) {
  if (!isOpen) return null;

  // Calculate statistics
  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPurchases = transactions.length;
  const uniqueUsers = new Set(transactions.map(t => t.userEmail)).size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-[900px] bg-white/[0.05] border-[2px] border-white/20 rounded-[36px] p-8 shadow-[0_0_32px_rgba(0,0,0,0.4)] backdrop-blur-[32px] overflow-hidden max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-8 top-8 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Terminal className="w-5 h-5" />
            <span className="font-mono text-xs uppercase tracking-widest font-semibold">System Dashboard</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Admin Panel — CodeBazaar</h2>
          <p className="text-sm text-white/60">Overview of purchases, users, and transaction analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Revenue */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center text-green-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-xl font-bold text-white mt-0.5">₹{totalRevenue}</h3>
            </div>
          </div>

          {/* Sales */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Total Purchases</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{totalPurchases}</h3>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Unique Customers</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{uniqueUsers}</h3>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="flex-1 overflow-y-auto border border-white/10 rounded-2xl bg-white/[0.02]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-white/70 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Customer</th>
                <th className="p-4">Project Purchased</th>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-white/40">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors text-white/80">
                    <td className="p-4 pl-6">
                      <div className="font-medium text-white">{tx.userName}</div>
                      <div className="text-xs text-white/40">{tx.userEmail}</div>
                    </td>
                    <td className="p-4 font-medium">{tx.projectTitle}</td>
                    <td className="p-4 font-mono text-xs text-purple-300/80">{tx.id}</td>
                    <td className="p-4 text-xs text-white/60">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4 pr-6 text-right font-semibold text-green-400">₹{tx.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
