-- ============================================
-- ETAPA B: SCHEMA COMPLETO DO BANCO DE DADOS
-- Sistema de Controle de Pedidos
-- ============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('admin_global', 'owner', 'waiter', 'kitchen', 'cashier');
CREATE TYPE public.order_status AS ENUM ('open', 'closed', 'canceled');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'partial', 'paid');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'pix');
CREATE TYPE public.kitchen_status AS ENUM ('queue', 'preparing', 'ready', 'delivered');

-- 2. TABELA ESTABLISHMENTS
CREATE TABLE public.establishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  has_kitchen BOOLEAN NOT NULL DEFAULT true,
  has_orders BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_establishments_created_at ON public.establishments(created_at);

-- RLS
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;

-- 3. TABELA PROFILES (complementa auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. TABELA USER_ROLES (tabela separada conforme security best practices)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, establishment_id, role)
);

-- Índices
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_establishment_id ON public.user_roles(establishment_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. TABELA PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_products_establishment_id ON public.products(establishment_id);
CREATE INDEX idx_products_active ON public.products(active);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. TABELA ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  code TEXT,
  customer_name TEXT,
  status public.order_status NOT NULL DEFAULT 'open',
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_orders_establishment_id ON public.orders(establishment_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_code ON public.orders(code);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 7. TABELA ORDER_ITEMS
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 8. TABELA KITCHEN_TICKETS
CREATE TABLE public.kitchen_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  ticket_number INTEGER NOT NULL,
  status public.kitchen_status NOT NULL DEFAULT 'queue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_kitchen_tickets_order_id ON public.kitchen_tickets(order_id);
CREATE INDEX idx_kitchen_tickets_establishment_id ON public.kitchen_tickets(establishment_id);
CREATE INDEX idx_kitchen_tickets_status ON public.kitchen_tickets(status);
CREATE INDEX idx_kitchen_tickets_created_at ON public.kitchen_tickets(created_at);

-- RLS
ALTER TABLE public.kitchen_tickets ENABLE ROW LEVEL SECURITY;

-- 9. TABELA PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  method public.payment_method NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  received_by UUID REFERENCES public.profiles(id),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_received_at ON public.payments(received_at);

-- RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 10. TABELA AUDIT_LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES public.establishments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_logs_establishment_id ON public.audit_logs(establishment_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================

-- Função para verificar role do usuário (evita recursão em RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para verificar se usuário pertence a um estabelecimento
CREATE OR REPLACE FUNCTION public.user_belongs_to_establishment(_user_id UUID, _establishment_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND establishment_id = _establishment_id
  )
$$;

-- Função para pegar establishment_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_establishments(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT establishment_id
  FROM public.user_roles
  WHERE user_id = _user_id
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON public.establishments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kitchen_tickets_updated_at BEFORE UPDATE ON public.kitchen_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para auto criar profile quando user é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- ESTABLISHMENTS
CREATE POLICY "Admin global pode ver todos estabelecimentos"
  ON public.establishments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Usuários podem ver seus estabelecimentos"
  ON public.establishments FOR SELECT
  USING (id IN (SELECT public.get_user_establishments(auth.uid())));

CREATE POLICY "Admin global pode criar estabelecimentos"
  ON public.establishments FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Admin global pode atualizar estabelecimentos"
  ON public.establishments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin_global'));

-- PROFILES
CREATE POLICY "Usuários podem ver todos perfis"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- USER_ROLES
CREATE POLICY "Admin global pode gerenciar todas roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Owners podem ver roles do seu estabelecimento"
  ON public.user_roles FOR SELECT
  USING (
    establishment_id IN (
      SELECT establishment_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Usuários podem ver suas próprias roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- PRODUCTS
CREATE POLICY "Usuários podem ver produtos dos seus estabelecimentos"
  ON public.products FOR SELECT
  USING (public.user_belongs_to_establishment(auth.uid(), establishment_id));

CREATE POLICY "Owners podem gerenciar produtos"
  ON public.products FOR ALL
  USING (
    establishment_id IN (
      SELECT establishment_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ORDERS
CREATE POLICY "Usuários podem ver pedidos dos seus estabelecimentos"
  ON public.orders FOR SELECT
  USING (public.user_belongs_to_establishment(auth.uid(), establishment_id));

CREATE POLICY "Garçons e caixas podem criar pedidos"
  ON public.orders FOR INSERT
  WITH CHECK (
    public.user_belongs_to_establishment(auth.uid(), establishment_id) AND
    (public.has_role(auth.uid(), 'waiter') OR public.has_role(auth.uid(), 'cashier') OR public.has_role(auth.uid(), 'owner'))
  );

CREATE POLICY "Garçons e caixas podem atualizar pedidos"
  ON public.orders FOR UPDATE
  USING (
    public.user_belongs_to_establishment(auth.uid(), establishment_id) AND
    (public.has_role(auth.uid(), 'waiter') OR public.has_role(auth.uid(), 'cashier') OR public.has_role(auth.uid(), 'owner'))
  );

-- ORDER_ITEMS
CREATE POLICY "Usuários podem ver itens dos pedidos do seu estabelecimento"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND public.user_belongs_to_establishment(auth.uid(), orders.establishment_id)
    )
  );

CREATE POLICY "Garçons podem gerenciar itens de pedidos"
  ON public.order_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND public.user_belongs_to_establishment(auth.uid(), orders.establishment_id)
      AND (public.has_role(auth.uid(), 'waiter') OR public.has_role(auth.uid(), 'owner'))
    )
  );

-- KITCHEN_TICKETS
CREATE POLICY "Cozinha e garçons podem ver tickets"
  ON public.kitchen_tickets FOR SELECT
  USING (public.user_belongs_to_establishment(auth.uid(), establishment_id));

CREATE POLICY "Sistema pode criar tickets"
  ON public.kitchen_tickets FOR INSERT
  WITH CHECK (public.user_belongs_to_establishment(auth.uid(), establishment_id));

CREATE POLICY "Cozinha pode atualizar tickets"
  ON public.kitchen_tickets FOR UPDATE
  USING (
    public.user_belongs_to_establishment(auth.uid(), establishment_id) AND
    (public.has_role(auth.uid(), 'kitchen') OR public.has_role(auth.uid(), 'owner'))
  );

-- PAYMENTS
CREATE POLICY "Usuários podem ver pagamentos do seu estabelecimento"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
      AND public.user_belongs_to_establishment(auth.uid(), orders.establishment_id)
    )
  );

CREATE POLICY "Caixas podem registrar pagamentos"
  ON public.payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
      AND public.user_belongs_to_establishment(auth.uid(), orders.establishment_id)
      AND (public.has_role(auth.uid(), 'cashier') OR public.has_role(auth.uid(), 'waiter') OR public.has_role(auth.uid(), 'owner'))
    )
  );

-- AUDIT_LOGS
CREATE POLICY "Admin global pode ver todos logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin_global'));

CREATE POLICY "Owners podem ver logs do seu estabelecimento"
  ON public.audit_logs FOR SELECT
  USING (
    establishment_id IN (
      SELECT establishment_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Sistema pode inserir logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.user_belongs_to_establishment(auth.uid(), establishment_id));

-- ============================================
-- DADOS SEED
-- ============================================

-- NOTA: O usuário admin será criado manualmente após signup
-- Aqui inserimos apenas o estabelecimento de exemplo

-- Estabelecimento exemplo
INSERT INTO public.establishments (id, name, has_kitchen, has_orders)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Churrasquinho da Praça', true, true),
  ('00000000-0000-0000-0000-000000000002', 'Chopperia Truck', false, true);

-- Produtos seed para Churrasquinho
INSERT INTO public.products (establishment_id, name, price, active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Espetinho de Carne', 8.00, true),
  ('00000000-0000-0000-0000-000000000001', 'Espetinho de Frango', 7.00, true),
  ('00000000-0000-0000-0000-000000000001', 'Espetinho de Linguiça', 7.50, true),
  ('00000000-0000-0000-0000-000000000001', 'Refrigerante Lata', 5.00, true),
  ('00000000-0000-0000-0000-000000000001', 'Água Mineral', 3.00, true),
  ('00000000-0000-0000-0000-000000000001', 'Cerveja Long Neck', 8.00, true);

-- Produtos seed para Chopperia
INSERT INTO public.products (establishment_id, name, price, active)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'Chopp 300ml', 8.00, true),
  ('00000000-0000-0000-0000-000000000002', 'Chopp 500ml', 12.00, true),
  ('00000000-0000-0000-0000-000000000002', 'Chopp 1L', 20.00, true),
  ('00000000-0000-0000-0000-000000000002', 'Porção de Batata', 15.00, true),
  ('00000000-0000-0000-0000-000000000002', 'Porção de Calabresa', 18.00, true),
  ('00000000-0000-0000-0000-000000000002', 'Água Mineral', 3.00, true);