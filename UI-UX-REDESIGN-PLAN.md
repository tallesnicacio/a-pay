# Plano de Redesign UI/UX - A-Pay

## 🎯 Objetivo

Modernizar a interface do A-Pay inspirado em aplicativos de restaurantes modernos, focando em usabilidade, estética contemporânea e experiência fluida para operações diárias de estabelecimentos.

## 📋 Análise da Interface Atual

### Pontos a Melhorar
- [ ] Interface muito funcional, pouco visual
- [ ] Falta de hierarquia visual clara
- [ ] Cores neutras demais (muito cinza)
- [ ] Cards sem profundidade visual
- [ ] Ausência de feedback visual nas ações
- [ ] Tipografia básica, sem personalidade
- [ ] Falta de animações e transições suaves
- [ ] Layout muito "admin-like", pouco amigável

### Pontos Fortes (Manter)
- [x] Estrutura clara de navegação
- [x] Organização lógica de módulos
- [x] Responsividade
- [x] Performance do PWA

---

## 🎨 Sistema de Design Proposto

### 1. Paleta de Cores

#### Cores Primárias
```scss
// Laranja Vibrante (Comida/Apetitoso)
$primary-50:  #FFF7ED;  // Backgrounds suaves
$primary-100: #FFEDD5;
$primary-200: #FED7AA;
$primary-300: #FDBA74;
$primary-400: #FB923C;  // Hover states
$primary-500: #F97316;  // Cor principal (botões, links)
$primary-600: #EA580C;  // Active states
$primary-700: #C2410C;
$primary-800: #9A3412;
$primary-900: #7C2D12;

// Verde Sucesso (Status positivos)
$success-400: #4ADE80;
$success-500: #22C55E;
$success-600: #16A34A;

// Vermelho Alerta (Urgências/Erros)
$danger-400: #F87171;
$danger-500: #EF4444;
$danger-600: #DC2626;

// Amarelo Atenção (Avisos)
$warning-400: #FBBF24;
$warning-500: #F59E0B;
$warning-600: #D97706;
```

#### Cores Neutras
```scss
// Cinzas mais quentes
$neutral-50:  #FAFAF9;  // Background principal
$neutral-100: #F5F5F4;  // Cards
$neutral-200: #E7E5E4;
$neutral-300: #D6D3D1;
$neutral-400: #A8A29E;  // Texto secundário
$neutral-700: #44403C;  // Texto principal
$neutral-800: #292524;
$neutral-900: #1C1917;
```

#### Gradientes
```scss
// Gradiente principal (para headers, CTAs)
$gradient-primary: linear-gradient(135deg, #F97316 0%, #FB923C 100%);

// Gradiente de cards (sutil)
$gradient-card: linear-gradient(180deg, #FFFFFF 0%, #FAFAF9 100%);

// Gradiente de background
$gradient-bg: linear-gradient(180deg, #FAFAF9 0%, #F5F5F4 100%);
```

---

### 2. Tipografia

#### Fontes
```scss
// Fonte principal - Inter (moderna, legível)
$font-primary: 'Inter', system-ui, -apple-system, sans-serif;

// Fonte para números - Roboto Mono (tabular figures)
$font-numbers: 'Roboto Mono', monospace;

// Fonte para headings - Poppins (personalidade)
$font-display: 'Poppins', sans-serif;
```

#### Escala Tipográfica
```scss
$text-xs:   0.75rem;   // 12px - Labels pequenas
$text-sm:   0.875rem;  // 14px - Texto secundário
$text-base: 1rem;      // 16px - Corpo de texto
$text-lg:   1.125rem;  // 18px - Destaque
$text-xl:   1.25rem;   // 20px - Subtítulos
$text-2xl:  1.5rem;    // 24px - Títulos de seção
$text-3xl:  1.875rem;  // 30px - Títulos de página
$text-4xl:  2.25rem;   // 36px - Hero titles
```

#### Pesos
```scss
$font-normal:   400;
$font-medium:   500;
$font-semibold: 600;
$font-bold:     700;
```

---

### 3. Espaçamento e Grid

#### Sistema de 8px
```scss
$spacing-1:  0.25rem;  // 4px
$spacing-2:  0.5rem;   // 8px
$spacing-3:  0.75rem;  // 12px
$spacing-4:  1rem;     // 16px
$spacing-5:  1.25rem;  // 20px
$spacing-6:  1.5rem;   // 24px
$spacing-8:  2rem;     // 32px
$spacing-10: 2.5rem;   // 40px
$spacing-12: 3rem;     // 48px
$spacing-16: 4rem;     // 64px
```

#### Bordas e Raios
```scss
$radius-sm:  0.375rem;  // 6px  - Tags, badges
$radius-md:  0.5rem;    // 8px  - Botões, inputs
$radius-lg:  0.75rem;   // 12px - Cards
$radius-xl:  1rem;      // 16px - Modais
$radius-2xl: 1.5rem;    // 24px - Cards grandes
$radius-full: 9999px;   // Circular
```

#### Sombras
```scss
// Elevações progressivas
$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
$shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
$shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
$shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

// Sombras coloridas (para CTAs)
$shadow-primary: 0 10px 25px -5px rgb(249 115 22 / 0.3);
$shadow-success: 0 10px 25px -5px rgb(34 197 94 / 0.3);
```

---

## 🎭 Componentes Redesenhados

### 1. Cards de Produto

**Design Atual:** Card plano, branco, sem destaque

**Novo Design:**
```typescript
// Exemplo visual
┌─────────────────────────────────┐
│  [Imagem do Produto - 100%]     │ ← Foto atraente
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔥 Mais Vendido         │   │ ← Badge de destaque
│  └─────────────────────────┘   │
│                                 │
│  Hambúrguer Artesanal           │ ← Título bold
│  Com bacon, queijo cheddar...   │ ← Descrição curta
│                                 │
│  R$ 28,90    [+ Adicionar]     │ ← Preço + CTA
└─────────────────────────────────┘
```

**Features:**
- Imagem destacada (proporção 16:9)
- Badge de status (novo, popular, promoção)
- Hover com elevação suave
- Botão de ação claramente visível
- Ícone de categoria sutil no canto

**Código:**
```tsx
<Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
  {/* Image Container */}
  <div className="relative aspect-video overflow-hidden">
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
    {product.badge && (
      <Badge className="absolute top-3 left-3 bg-primary-500 text-white">
        {product.badge}
      </Badge>
    )}
    <CategoryIcon className="absolute top-3 right-3 opacity-60" />
  </div>

  {/* Content */}
  <div className="p-4 space-y-3">
    <h3 className="font-semibold text-lg text-neutral-800 line-clamp-1">
      {product.name}
    </h3>
    <p className="text-sm text-neutral-500 line-clamp-2">
      {product.description}
    </p>

    {/* Footer */}
    <div className="flex items-center justify-between pt-2">
      <span className="text-2xl font-bold text-primary-600">
        {formatCurrency(product.price)}
      </span>
      <Button
        variant="primary"
        size="sm"
        className="shadow-primary"
      >
        <Plus className="w-4 h-4 mr-1" />
        Adicionar
      </Button>
    </div>
  </div>
</Card>
```

---

### 2. Cards de Pedido (Comandas)

**Design Atual:** Lista tabular, visual carregado

**Novo Design:**
```typescript
┌──────────────────────────────────────────┐
│ Mesa 12  •  18:45                    [$] │ ← Header compacto
├──────────────────────────────────────────┤
│ 2x Hambúrguer Artesanal      R$ 57,80   │
│ 1x Refrigerante 350ml        R$ 6,00    │ ← Items
│ 1x Batata Frita              R$ 15,00   │
├──────────────────────────────────────────┤
│ TOTAL                        R$ 78,80   │ ← Total destacado
│                                          │
│ [🔥 Em preparo]  [Atualizar Status]    │ ← Status + CTA
└──────────────────────────────────────────┘
```

**Features:**
- Timeline visual do pedido
- Status com cores semânticas
- Resumo expandível
- Ações contextuais no hover
- Indicador de tempo (há quanto tempo foi feito)

**Estados de Status:**
```tsx
const orderStatuses = {
  pending: {
    color: 'yellow',
    icon: ClockIcon,
    label: 'Aguardando',
    gradient: 'from-yellow-400 to-orange-400'
  },
  preparing: {
    color: 'blue',
    icon: ChefHatIcon,
    label: 'Em Preparo',
    gradient: 'from-blue-400 to-indigo-400'
  },
  ready: {
    color: 'green',
    icon: CheckCircleIcon,
    label: 'Pronto',
    gradient: 'from-green-400 to-emerald-400'
  },
  delivered: {
    color: 'gray',
    icon: CheckIcon,
    label: 'Entregue',
    gradient: 'from-gray-400 to-neutral-400'
  }
};
```

---

### 3. Quadro Kanban da Cozinha

**Inspiração:** Trello/Linear

**Novo Design:**
```typescript
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 🕐 Pendente │ 🔥 Preparo  │ ✅ Pronto   │ 📦 Entregue │
│     (5)     │     (3)     │     (2)     │     (12)    │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ [Card]      │ [Card]      │ [Card]      │ [Card]      │
│             │             │             │             │
│ [Card]      │ [Card]      │ [Card]      │ [Card]      │
│             │             │             │             │
│ [Card]      │ [Card]      │             │ ...         │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Features:**
- Drag & drop fluido
- Animações ao mover cards
- Contador de itens por coluna
- Filtros rápidos (urgente, VIP, etc)
- Som de notificação em novos pedidos
- Pulsação visual em pedidos urgentes

**Card do Kanban:**
```tsx
<Draggable>
  <Card className="bg-white hover:shadow-lg cursor-grab active:cursor-grabbing">
    {/* Header com prioridade */}
    <div className="flex items-center justify-between mb-3">
      <Badge variant={getPriorityColor(order.priority)}>
        Mesa {order.table}
      </Badge>
      <span className="text-xs text-neutral-500">
        há {getTimeAgo(order.createdAt)}
      </span>
    </div>

    {/* Items */}
    <div className="space-y-2 mb-3">
      {order.items.map(item => (
        <div className="flex items-start gap-2">
          <span className="font-semibold text-primary-600">{item.qty}x</span>
          <span className="text-sm flex-1">{item.name}</span>
        </div>
      ))}
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between pt-3 border-t">
      <span className="font-bold text-neutral-800">
        {formatCurrency(order.total)}
      </span>
      {order.notes && (
        <Tooltip content={order.notes}>
          <MessageIcon className="w-4 h-4 text-yellow-500" />
        </Tooltip>
      )}
    </div>
  </Card>
</Draggable>
```

---

### 4. Formulários e Inputs

**Design Atual:** Inputs básicos, sem feedback

**Novo Design:**

#### Text Input
```tsx
<div className="relative">
  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
    Nome do Produto
  </label>
  <div className="relative">
    <input
      type="text"
      className="
        w-full px-4 py-3
        bg-white
        border-2 border-neutral-200
        rounded-lg
        focus:border-primary-500 focus:ring-4 focus:ring-primary-100
        transition-all duration-200
        placeholder:text-neutral-400
      "
      placeholder="Ex: Hambúrguer Artesanal"
    />
    {/* Ícone de status */}
    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500" />
  </div>
  <p className="text-xs text-neutral-500 mt-1">
    Mínimo 3 caracteres
  </p>
</div>
```

#### Select/Dropdown
```tsx
<Listbox>
  <Listbox.Button className="
    relative w-full cursor-pointer
    px-4 py-3 text-left
    bg-white
    border-2 border-neutral-200
    rounded-lg
    hover:border-neutral-300
    focus:border-primary-500 focus:ring-4 focus:ring-primary-100
    transition-all duration-200
  ">
    <span className="block truncate">{selected.name}</span>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2" />
  </Listbox.Button>

  <Listbox.Options className="
    absolute z-10 mt-2 w-full
    bg-white
    border border-neutral-200
    rounded-lg
    shadow-xl
    max-h-60 overflow-auto
    py-1
  ">
    {options.map((option) => (
      <Listbox.Option
        value={option}
        className={({ active }) => `
          relative cursor-pointer select-none
          py-3 px-4
          ${active ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'}
        `}
      >
        {option.name}
      </Listbox.Option>
    ))}
  </Listbox.Options>
</Listbox>
```

---

### 5. Botões

**Hierarquia:**

```tsx
// Primary - Ações principais
<Button variant="primary" size="lg">
  Criar Novo Pedido
</Button>
// Estilo: bg-primary-500, hover:bg-primary-600, shadow-primary

// Secondary - Ações secundárias
<Button variant="secondary" size="md">
  Cancelar
</Button>
// Estilo: bg-white, border-neutral-300, hover:bg-neutral-50

// Ghost - Ações terciárias
<Button variant="ghost" size="sm">
  Ver Detalhes
</Button>
// Estilo: transparent, hover:bg-neutral-100

// Danger - Ações destrutivas
<Button variant="danger" size="md">
  Excluir Pedido
</Button>
// Estilo: bg-danger-500, hover:bg-danger-600, shadow-danger
```

**Tamanhos:**
```tsx
// sm: py-2 px-3, text-sm
// md: py-2.5 px-4, text-base (default)
// lg: py-3 px-6, text-lg
// xl: py-4 px-8, text-xl
```

---

### 6. Navegação

#### Sidebar (Desktop)

**Design Atual:** Sidebar vertical simples

**Novo Design:**
```typescript
┌────────────────────────┐
│  [Logo A-Pay]          │ ← Logo + nome
├────────────────────────┤
│  [Avatar]              │ ← User info
│  João Silva            │
│  Churrasquinho da Praça│
├────────────────────────┤
│  🏠 Início             │ ← Menu items com ícones
│  📝 Comandas        (5)│ ← Badge de notificação
│  🍳 Cozinha         (3)│
│  📊 Relatórios         │
│  🍽️  Produtos          │
│  👥 Funcionários       │
├────────────────────────┤
│  ⚙️  Configurações     │ ← Footer items
│  🚪 Sair               │
└────────────────────────┘
```

**Features:**
- Ícones coloridos (não apenas cinza)
- Badges de notificação pulsantes
- Hover com background suave
- Item ativo com barra lateral colorida
- Animação de expansão/colapso

#### Bottom Navigation (Mobile)

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl">
  <div className="flex items-center justify-around py-2">
    {navItems.map(item => (
      <NavItem
        icon={item.icon}
        label={item.label}
        badge={item.badge}
        active={pathname === item.path}
      />
    ))}
  </div>
</nav>
```

---

### 7. Modais e Dialogs

**Novo Design:**
```tsx
<Dialog className="relative z-50">
  {/* Backdrop com blur */}
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

  {/* Modal centrado */}
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="
      w-full max-w-md
      bg-white
      rounded-2xl
      shadow-2xl
      p-6
      transform transition-all
      scale-100 opacity-100
    ">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Dialog.Title className="text-2xl font-bold text-neutral-900">
          Novo Produto
        </Dialog.Title>
        <button className="text-neutral-400 hover:text-neutral-600">
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Form fields */}
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" fullWidth>
          Cancelar
        </Button>
        <Button variant="primary" fullWidth>
          Salvar
        </Button>
      </div>
    </Dialog.Panel>
  </div>
</Dialog>
```

---

## 🎬 Animações e Transições

### Princípios
1. **Sutis, não distrativas** - Melhoram a UX, não atrapalham
2. **Rápidas** - 150-300ms para a maioria
3. **Significativas** - Indicam causa e efeito
4. **Consistentes** - Mesmo easing em contextos similares

### Biblioteca Sugerida
```bash
pnpm add framer-motion
```

### Exemplos

#### 1. Page Transitions
```tsx
import { motion } from 'framer-motion';

export function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

#### 2. List Animations (Stagger)
```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

#### 3. Hover Animations
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

#### 4. Loading Skeletons
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
</div>
```

#### 5. Toast Notifications
```tsx
import { toast } from 'react-hot-toast';

toast.success('Pedido criado com sucesso!', {
  duration: 3000,
  position: 'bottom-right',
  style: {
    background: '#22C55E',
    color: '#fff',
    padding: '16px',
    borderRadius: '12px',
  },
  icon: '✅',
});
```

---

## 📱 Layouts Específicos

### 1. Dashboard/Início

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Bom dia, João! 👋                              │ ← Greeting personalizado
│  Quinta, 13 de Outubro                          │
├─────────────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ 📝       │ 💰       │ 👥       │ ⭐       │ │
│  │ Pedidos  │ Vendas   │ Clientes │ Média    │ │ ← KPI Cards
│  │ 45       │ R$ 2.3k  │ 87       │ 4.8      │ │
│  │ +12%     │ +8%      │ +5%      │ +0.2     │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
├─────────────────────────────────────────────────┤
│  📊 Vendas Hoje                            [>]  │
│  [Gráfico de linha/área]                        │ ← Chart
├─────────────────────────────────────────────────┤
│  🔥 Mais Vendidos                          [>]  │
│  [Lista de produtos com ranking]                │ ← Top products
├─────────────────────────────────────────────────┤
│  ⚡ Ações Rápidas                               │
│  [+ Novo Pedido] [Ver Cozinha] [Relatórios]   │ ← Quick actions
└─────────────────────────────────────────────────┘
```

### 2. Lista de Comandas

**Com filtros e busca:**
```
┌─────────────────────────────────────────────────┐
│  🔍 [Buscar por mesa ou item...]                │ ← Search bar
│                                                  │
│  [🕐 Pendentes] [🔥 Preparo] [✅ Prontos]      │ ← Tabs/Filters
│                                                  │
│  [🆕 Novo Pedido]                          [⚙] │ ← Header actions
├─────────────────────────────────────────────────┤
│  [Card Pedido 1]                                │
│  [Card Pedido 2]                                │ ← Cards list
│  [Card Pedido 3]                                │
│  ...                                            │
│                                                  │
│  [Carregar mais]                                │ ← Pagination
└─────────────────────────────────────────────────┘
```

### 3. Detalhes do Pedido

**Modal/Sidebar:**
```
┌─────────────────────────────────────────────────┐
│  ← Voltar         Pedido #1234           [...]  │ ← Header
├─────────────────────────────────────────────────┤
│  Mesa 12  •  18:45  •  João (Garçom)           │ ← Meta info
├─────────────────────────────────────────────────┤
│  🔥 Em Preparo                                  │ ← Status badge
│                                                  │
│  Timeline:                                       │
│  ✅ Criado           18:45                      │
│  ✅ Confirmado       18:46                      │ ← Timeline
│  🔄 Em preparo       18:50                      │
│  ⏳ Aguardando...                               │
├─────────────────────────────────────────────────┤
│  Items:                                          │
│  2x Hambúrguer Artesanal          R$ 57,80     │
│      • Sem cebola                               │ ← Items com obs
│  1x Refrigerante 350ml             R$ 6,00     │
│  1x Batata Frita                  R$ 15,00     │
├─────────────────────────────────────────────────┤
│  Subtotal                         R$ 78,80     │
│  Taxa de serviço (10%)             R$ 7,88     │ ← Breakdown
│  TOTAL                            R$ 86,68     │
├─────────────────────────────────────────────────┤
│  [Atualizar Status] [Imprimir] [Cancelar]      │ ← Actions
└─────────────────────────────────────────────────┘
```

### 4. Formulário de Novo Pedido

**Multi-step:**
```
Step 1: Identificação
┌─────────────────────────────────────────────────┐
│  Novo Pedido                          [1/3]     │
│                                                  │
│  [Mesa/Comanda]                                 │
│  [Cliente (opcional)]                           │
│  [Garçom]                                       │
│                                                  │
│  [Próximo →]                                    │
└─────────────────────────────────────────────────┘

Step 2: Itens
┌─────────────────────────────────────────────────┐
│  Adicionar Itens                      [2/3]     │
│                                                  │
│  🔍 [Buscar produtos...]                        │
│                                                  │
│  [Grid de produtos]                             │
│                                                  │
│  Carrinho (3 itens):                            │
│  [Lista de itens selecionados]                  │
│                                                  │
│  [← Voltar]    Total: R$ 78,80    [Próximo →] │
└─────────────────────────────────────────────────┘

Step 3: Confirmação
┌─────────────────────────────────────────────────┐
│  Revisar Pedido                       [3/3]     │
│                                                  │
│  [Resumo completo do pedido]                    │
│                                                  │
│  [Observações]                                  │
│                                                  │
│  [← Voltar]              [✓ Confirmar Pedido]  │
└─────────────────────────────────────────────────┘
```

---

## 🖼️ Recursos Visuais Adicionais

### 1. Empty States

**Ao invés de mensagens secas, usar ilustrações:**

```tsx
<div className="flex flex-col items-center justify-center py-12">
  <EmptyBoxIllustration className="w-48 h-48 mb-4" />
  <h3 className="text-xl font-semibold text-neutral-800 mb-2">
    Nenhum pedido hoje
  </h3>
  <p className="text-neutral-500 mb-6">
    Que tal criar o primeiro pedido do dia?
  </p>
  <Button variant="primary" size="lg">
    <Plus className="w-5 h-5 mr-2" />
    Criar Pedido
  </Button>
</div>
```

### 2. Error States

```tsx
<div className="bg-danger-50 border-2 border-danger-200 rounded-xl p-6">
  <div className="flex items-start gap-4">
    <AlertTriangle className="w-6 h-6 text-danger-500 flex-shrink-0" />
    <div>
      <h4 className="font-semibold text-danger-800 mb-1">
        Erro ao salvar pedido
      </h4>
      <p className="text-sm text-danger-600 mb-3">
        Não foi possível conectar ao servidor. Tente novamente.
      </p>
      <Button variant="danger" size="sm">
        Tentar Novamente
      </Button>
    </div>
  </div>
</div>
```

### 3. Loading States

**Skeleton screens ao invés de spinners:**
```tsx
<Card>
  <div className="animate-pulse">
    <div className="h-48 bg-neutral-200 rounded-t-lg"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
      <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
      <div className="flex justify-between pt-2">
        <div className="h-6 bg-neutral-200 rounded w-20"></div>
        <div className="h-8 bg-neutral-200 rounded w-24"></div>
      </div>
    </div>
  </div>
</Card>
```

### 4. Success Feedback

**Animação de confetti ou checkmark:**
```tsx
import Confetti from 'react-confetti';

function SuccessModal() {
  return (
    <Dialog>
      <Confetti recycle={false} numberOfPieces={200} />
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mb-4"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Pedido Criado!
        </h2>
        <p className="text-neutral-600">
          O pedido #1234 foi enviado para a cozinha
        </p>
      </div>
    </Dialog>
  );
}
```

---

## 🎯 Ícones e Ilustrações

### Biblioteca de Ícones
```bash
pnpm add lucide-react
```

**Uso consistente:**
- Tamanho padrão: 20px (w-5 h-5)
- Stroke width: 2
- Cor: Contextual (primária, neutra, status)

### Ilustrações
**Opções gratuitas:**
- [unDraw](https://undraw.co/) - Customizável por cor
- [Storyset](https://storyset.com/) - Animadas
- [Humaaans](https://www.humaaans.com/) - Personagens

**Onde usar:**
- Empty states
- Error pages
- Onboarding
- Modais de sucesso

---

## 📐 Responsive Design

### Breakpoints
```scss
$screen-sm: 640px;   // Mobile landscape
$screen-md: 768px;   // Tablet
$screen-lg: 1024px;  // Desktop
$screen-xl: 1280px;  // Large desktop
$screen-2xl: 1536px; // Extra large
```

### Mobile-First Approach

```tsx
// Example: Card adapta layout
<div className="
  grid
  grid-cols-1      // Mobile: 1 coluna
  sm:grid-cols-2   // Tablet: 2 colunas
  lg:grid-cols-3   // Desktop: 3 colunas
  xl:grid-cols-4   // Large: 4 colunas
  gap-4
  lg:gap-6         // Gap maior em desktop
">
  {products.map(product => <ProductCard />)}
</div>
```

### Touch Targets
- Mínimo 44x44px para elementos clicáveis (mobile)
- Espaçamento adequado entre botões
- Swipe gestures em listas

---

## 🚀 Plano de Implementação

### Fase 1: Fundação (Semana 1-2)
- [ ] Configurar Tailwind com nova paleta
- [ ] Adicionar fontes (Inter, Poppins, Roboto Mono)
- [ ] Criar sistema de design tokens
- [ ] Implementar componentes base (Button, Input, Card)
- [ ] Setup Framer Motion

### Fase 2: Componentes (Semana 3-4)
- [ ] Redesenhar todos os componentes comuns
- [ ] Criar biblioteca de ícones consistente
- [ ] Implementar feedback visual (toasts, modais)
- [ ] Adicionar skeleton loaders
- [ ] Empty states e error states

### Fase 3: Layouts (Semana 5-6)
- [ ] Nova sidebar/navegação
- [ ] Redesign do Dashboard
- [ ] Melhorar lista de comandas
- [ ] Aprimorar formulários
- [ ] Mobile-first adjustments

### Fase 4: Features Específicas (Semana 7-8)
- [ ] Quadro Kanban da cozinha
- [ ] Sistema de notificações
- [ ] Animações e transições
- [ ] Dark mode (opcional)
- [ ] Acessibilidade (ARIA, keyboard nav)

### Fase 5: Refinamento (Semana 9-10)
- [ ] Performance optimization
- [ ] Testes de usabilidade
- [ ] Ajustes baseados em feedback
- [ ] Documentação de componentes
- [ ] Storybook (opcional)

---

## 📊 Métricas de Sucesso

### Antes vs Depois

| Métrica | Antes | Meta Depois |
|---------|-------|-------------|
| Tempo para criar pedido | 45s | 25s |
| Cliques até relatório | 4 | 2 |
| Taxa de erro em forms | 12% | <5% |
| NPS dos usuários | 7.2 | >8.5 |
| Mobile usability score | 65 | >90 |
| Lighthouse Performance | 78 | >95 |

### KPIs a Monitorar
- Tempo médio de conclusão de tarefas
- Taxa de adoção de novas features
- Feedback qualitativo dos usuários
- Redução em erros/bugs reportados

---

## 🎨 Design System Documentation

### Criar Storybook (Opcional mas Recomendado)

```bash
pnpm add -D @storybook/react @storybook/addon-essentials
```

**Benefícios:**
- Documentação visual de componentes
- Testes visuais
- Colaboração design-dev
- Style guide vivo

---

## 🔗 Recursos e Referências

### Design Inspiration
- [Dribbble - Restaurant UI](https://dribbble.com/search/restaurant-app)
- [Behance - Food App Designs](https://www.behance.net/search/projects?search=restaurant%20app)
- [Mobbin - Restaurant Apps](https://mobbin.com/)

### Component Libraries (Referência)
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes modernos
- [Headless UI](https://headlessui.com/) - Acessibilidade
- [Radix UI](https://www.radix-ui.com/) - Primitivos

### Color Tools
- [Coolors](https://coolors.co/) - Paletas
- [Realtime Colors](https://realtimecolors.com/) - Preview
- [ColorBox](https://colorbox.io/) - Escalas de cor

### Animation
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Principles](https://www.designbetter.co/animation-handbook)

---

## 📝 Notas Finais

### Princípios de Design a Seguir

1. **Clareza > Estética** - Sempre priorize usabilidade
2. **Consistência** - Padrões repetidos facilitam o aprendizado
3. **Feedback** - O usuário sempre deve saber o que está acontecendo
4. **Eficiência** - Minimize cliques e tempo para tarefas comuns
5. **Acessibilidade** - Design inclusivo desde o início

### Checklist de Qualidade

Para cada componente redesenhado:
- [ ] Mobile-friendly (testado em 3+ tamanhos)
- [ ] Estados cobertos (default, hover, active, disabled, loading, error)
- [ ] Acessível (keyboard nav, screen reader, contraste)
- [ ] Performático (sem layout shifts, animações fluidas)
- [ ] Documentado (Storybook ou comentários)

---

**Próximos Passos:**
1. Review deste plano com a equipe
2. Criar protótipo no Figma (opcional)
3. Iniciar Fase 1 de implementação
4. Setup de monitoramento de métricas

---

*Documento criado em: 13/10/2025*
*Última atualização: 13/10/2025*
*Autor: Claude AI*
