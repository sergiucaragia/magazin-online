-- ============================================================
-- Funzione atomica per la creazione di un ordine.
-- Usa FOR UPDATE per bloccare le righe prodotto durante la
-- transazione, evitando race conditions quando più utenti
-- ordinano lo stesso articolo contemporaneamente.
-- ============================================================

create or replace function place_order(
  p_customer_name    text,
  p_customer_email   text,
  p_customer_phone   text,
  p_shipping_address text,
  p_total_amount     numeric,
  p_items            jsonb   -- [{product_id, product_name, product_price, quantity, selected_size, selected_color}]
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order_id      uuid;
  v_item          jsonb;
  v_product_id    uuid;
  v_quantity      int;
  v_current_stock int;
  v_product_name  text;
begin

  -- ── Fase 1: verifica disponibilità con lock di riga ──────────────────────────
  -- FOR UPDATE impedisce a un'altra transazione concorrente di leggere
  -- o modificare le stesse righe finché questa transazione non è conclusa.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity   := (v_item->>'quantity')::int;

    select stock, name
      into v_current_stock, v_product_name
      from products
     where id = v_product_id
       and is_active = true
    for update;  -- lock della riga

    if not found then
      return jsonb_build_object(
        'success', false,
        'code',    'PRODUCT_NOT_FOUND',
        'error',   format('Il prodotto richiesto non è più disponibile.')
      );
    end if;

    if v_current_stock < v_quantity then
      return jsonb_build_object(
        'success',   false,
        'code',      'INSUFFICIENT_STOCK',
        'error',     format(
          '"%s" non è disponibile nella quantità richiesta. Disponibili: %s.',
          v_product_name,
          v_current_stock
        )
      );
    end if;
  end loop;

  -- ── Fase 2: crea ordine ───────────────────────────────────────────────────────
  insert into orders (customer_name, customer_email, customer_phone, shipping_address, total_amount)
  values (p_customer_name, p_customer_email, p_customer_phone, p_shipping_address, p_total_amount)
  returning id into v_order_id;

  -- ── Fase 3: inserisci items e decrementa stock atomicamente ───────────────────
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity   := (v_item->>'quantity')::int;

    insert into order_items (
      order_id, product_id, product_name, product_price,
      selected_size, selected_color, quantity
    ) values (
      v_order_id,
      v_product_id,
      v_item->>'product_name',
      (v_item->>'product_price')::numeric,
      nullif(v_item->>'selected_size',  'null'),
      nullif(v_item->>'selected_color', 'null'),
      v_quantity
    );

    update products
       set stock = stock - v_quantity
     where id = v_product_id;
  end loop;

  return jsonb_build_object('success', true, 'order_id', v_order_id);

-- Se qualcosa va storto PostgreSQL fa automaticamente rollback
exception
  when others then
    return jsonb_build_object(
      'success', false,
      'code',    'DB_ERROR',
      'error',   sqlerrm
    );
end;
$$;

-- Solo il service role può chiamare questa funzione (bypass RLS)
revoke execute on function place_order from public, anon, authenticated;
grant  execute on function place_order to service_role;
