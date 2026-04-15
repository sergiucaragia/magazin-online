import { Resend } from 'resend';
import type { Order, OrderItem } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(
  order: Order & { order_items: OrderItem[] }
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey || !fromEmail) {
    console.warn('Email non configurata (RESEND_API_KEY o EMAIL_FROM mancante). Email non inviata.');
    return;
  }

  const orderId = order.id.slice(0, 8).toUpperCase();

  const itemsRows = order.order_items
    .map((item) => {
      const details = [item.selected_size, item.selected_color].filter(Boolean).join(', ');
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">
            ${item.product_name}${details ? `<br><span style="color:#888;font-size:13px;">${details}</span>` : ''}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">€${(item.product_price * item.quantity).toFixed(2)}</td>
        </tr>`;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#111;padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:1px;">Magazinul Meu</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 8px;font-size:20px;">Comanda confirmată ✓</h2>
            <p style="margin:0 0 24px;color:#555;">Bună, <strong>${order.customer_name}</strong>! Îți mulțumim pentru comandă. Am primit-o și te vom contacta în curând pentru confirmare.</p>

            <!-- Order ID -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:6px;margin-bottom:24px;">
              <tr>
                <td style="padding:14px 16px;">
                  <span style="font-size:13px;color:#888;">Număr comandă</span><br>
                  <strong style="font-size:16px;letter-spacing:1px;">#${orderId}</strong>
                </td>
                <td style="padding:14px 16px;text-align:right;">
                  <span style="font-size:13px;color:#888;">Data</span><br>
                  <strong>${new Date(order.created_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </td>
              </tr>
            </table>

            <!-- Products -->
            <h3 style="margin:0 0 12px;font-size:15px;text-transform:uppercase;letter-spacing:0.5px;">Produse comandate</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:6px;margin-bottom:24px;">
              <thead>
                <tr style="background:#f9f9f9;">
                  <th style="padding:10px 12px;text-align:left;font-size:13px;color:#888;font-weight:600;">Produs</th>
                  <th style="padding:10px 12px;text-align:center;font-size:13px;color:#888;font-weight:600;">Cant.</th>
                  <th style="padding:10px 12px;text-align:right;font-size:13px;color:#888;font-weight:600;">Preț</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding:14px 12px;text-align:right;font-weight:700;">Total:</td>
                  <td style="padding:14px 12px;text-align:right;font-weight:700;font-size:16px;">€${order.total_amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Shipping -->
            <h3 style="margin:0 0 8px;font-size:15px;text-transform:uppercase;letter-spacing:0.5px;">Adresă de livrare</h3>
            <p style="margin:0 0 24px;color:#555;">${order.shipping_address}</p>

            <!-- Info box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;margin-bottom:8px;">
              <tr>
                <td style="padding:14px 16px;font-size:14px;color:#92400e;">
                  Nicio plată necesară acum. Te vom contacta la <strong>${order.customer_email}</strong> sau <strong>${order.customer_phone}</strong> pentru a finaliza achiziția.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;padding:20px 32px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee;">
            © ${new Date().getFullYear()} Magazinul Meu · Toate drepturile rezervate.
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: order.customer_email,
    subject: `Comandă confirmată #${orderId} — Magazinul Meu`,
    html,
  });

  if (error) {
    console.error('Errore invio email:', error);
  }
}
