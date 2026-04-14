import { createClient } from '@/lib/supabase/server';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { T } from '@/components/T';
import type { Order } from '@/types';

export const metadata = { title: 'Comenzi — Admin' };

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6"><T k="orders" /></h1>
      <OrdersTable orders={(orders as Order[]) ?? []} />
    </div>
  );
}
