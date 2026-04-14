import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { sendOrderNotification } from '@/lib/telegram';
import type { CreateOrderPayload } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderPayload = await req.json();
    const { customer_name, customer_email, customer_phone, shipping_address, items } = body;

    if (!customer_name?.trim() || !customer_email?.trim() || !customer_phone?.trim() || !shipping_address?.trim()) {
      return NextResponse.json({ message: 'Toate câmpurile sunt obligatorii.' }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Coșul de cumpărături este gol.' }, { status: 400 });
    }
    for (const item of items) {
      if (!item.product?.id || item.quantity < 1) {
        return NextResponse.json({ message: 'Date comandă invalide.' }, { status: 400 });
      }
    }

    const total_amount = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const adminSupabase = createAdminClient();

    const { data: result, error: rpcError } = await adminSupabase.rpc('place_order', {
      p_customer_name:    customer_name.trim(),
      p_customer_email:   customer_email.trim().toLowerCase(),
      p_customer_phone:   customer_phone.trim(),
      p_shipping_address: shipping_address.trim(),
      p_total_amount:     total_amount,
      p_items: items.map((item) => ({
        product_id:     item.product.id,
        product_name:   item.product.name,
        product_price:  item.product.price,
        quantity:       item.quantity,
        selected_size:  item.selected_size ?? null,
        selected_color: item.selected_color ?? null,
      })),
    });

    if (rpcError) {
      console.error('RPC place_order error:', rpcError);
      return NextResponse.json({ message: 'Eroare internă de server.' }, { status: 500 });
    }

    if (!result.success) {
      const status = result.code === 'INSUFFICIENT_STOCK' || result.code === 'PRODUCT_NOT_FOUND'
        ? 409
        : 500;
      return NextResponse.json({ message: result.error }, { status });
    }

    const orderId: string = result.order_id;

    try {
      const supabase = await createClient();
      const { data: order } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (order) {
        await sendOrderNotification(order as any);
      }
    } catch (telegramError) {
      console.error('Telegram notification error:', telegramError);
    }

    return NextResponse.json({ success: true, orderId }, { status: 201 });

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ message: 'Eroare internă de server.' }, { status: 500 });
  }
}
