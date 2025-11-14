import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChefHat,
  DollarSign,
  Users,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/constants/enums';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: AppRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Produtos',
    href: '/products',
    icon: Package,
    roles: [AppRole.ADMIN_GLOBAL, AppRole.OWNER],
  },
  {
    title: 'Pedidos',
    href: '/orders',
    icon: ShoppingCart,
    roles: [AppRole.ADMIN_GLOBAL, AppRole.OWNER, AppRole.WAITER],
  },
  {
    title: 'Cozinha',
    href: '/kitchen',
    icon: ChefHat,
    roles: [AppRole.ADMIN_GLOBAL, AppRole.OWNER, AppRole.KITCHEN, AppRole.WAITER],
  },
  {
    title: 'Caixa',
    href: '/cashier',
    icon: DollarSign,
    roles: [AppRole.ADMIN_GLOBAL, AppRole.OWNER, AppRole.CASHIER],
  },
  {
    title: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
    roles: [AppRole.ADMIN_GLOBAL, AppRole.OWNER],
  },
  {
    title: 'Usuários',
    href: '/users',
    icon: Users,
    roles: [AppRole.ADMIN_GLOBAL, AppRole.OWNER],
  },
];

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const { roles } = useAuth();

  const userRoles = roles?.map(r => r.role as AppRole) || [];
  const hasRole = (requiredRoles?: AppRole[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.some(role => userRoles.includes(role));
  };

  const filteredNavItems = navItems.filter(item => hasRole(item.roles));

  return (
    <aside className={cn('pb-12 border-r bg-muted/40', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navegação
          </h2>
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
