import { createClient } from '@/lib/supabase/server';
import { Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { T } from '@/components/T';

export const metadata = { title: 'Panou de control — Admin' };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: pendingOrders },
    { count: totalOrders },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
  ]);

  const stats = [
    { labelKey: 'activeProducts' as const, value: totalProducts ?? 0, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { labelKey: 'pendingOrders' as const, value: pendingOrders ?? 0, icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
    { labelKey: 'totalOrders' as const, value: totalOrders ?? 0, icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6"><T k="dashboard" /></h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ labelKey, value, icon: Icon, color }) => (
          <div key={labelKey} className="bg-white rounded-xl border p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500"><T k={labelKey} /></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
