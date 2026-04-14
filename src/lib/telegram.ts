import type { Order, OrderItem } from '@/types';

/**
 * Invia una notifica al Bot Telegram con i dettagli dell'ordine.
 * Chiamata lato server dopo il salvataggio dell'ordine nel DB.
 */
export async function sendOrderNotification(
  order: Order & { order_items: OrderItem[] }
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Credenziali Telegram non configurate. Notifica non inviata.');
    return;
  }

  const itemsList = order.order_items
    .map(
      (item) =>
        `  • ${item.product_name}${item.selected_size ? ` (Taglia: ${item.selected_size})` : ''}${item.selected_color ? ` (Colore: ${item.selected_color})` : ''} × ${item.quantity} — €${(item.product_price * item.quantity).toFixed(2)}`
    )
    .join('\n');

  const message = `
🛍️ *NUOVO ORDINE RICEVUTO*

*ID Ordine:* \`${order.id.slice(0, 8).toUpperCase()}\`
*Data:* ${new Date(order.created_at).toLocaleString('it-IT')}

👤 *CLIENTE*
Nome: ${order.customer_name}
Email: ${order.customer_email}
Telefono: ${order.customer_phone}

📦 *PRODOTTI*
${itemsList}

💰 *TOTALE: €${order.total_amount.toFixed(2)}*

🚚 *SPEDIZIONE*
${order.shipping_address}
`.trim();

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('Errore Telegram:', err);
  }
}
