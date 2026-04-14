// ─── Database types ────────────────────────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;  // cover = images[0], derivato automaticamente al salvataggio
  images: string[];          // galleria completa
  sizes: string[];           // es. ['XS','S','M','L','XL','XXL']
  colors: string[];     // es. ['Nero','Bianco','Rosso']
  gender: 'Uomo' | 'Donna' | 'Unisex';
  stock: number;
  is_active: boolean;
  created_at: string;
  // join
  category?: Category;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  status: 'pending' | 'completed';
  total_amount: number;
  created_at: string;
  // join
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  selected_size: string | null;
  selected_color: string | null;
  quantity: number;
};

// ─── Cart ──────────────────────────────────────────────────────────────────────

export type CartItem = {
  product: Product;
  quantity: number;
  selected_size: string | null;
  selected_color: string | null;
};

// ─── Checkout form ─────────────────────────────────────────────────────────────

export type CheckoutFormData = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
};

// ─── API payloads ──────────────────────────────────────────────────────────────

export type CreateOrderPayload = CheckoutFormData & {
  items: CartItem[];
};
