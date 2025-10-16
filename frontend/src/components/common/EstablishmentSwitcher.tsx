import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Badge } from './Badge';
import clsx from 'clsx';

export function EstablishmentSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, currentEstablishment, setCurrentEstablishment } = useAuthStore();
  const navigate = useNavigate();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user || !currentEstablishment) {
    return null;
  }

  // Filtrar estabelecimentos do usuário (excluindo admin_global sem estabelecimento)
  const userEstablishments = user.roles
    .filter(role => role.establishmentId !== null)
    .map(role => ({
      id: role.establishmentId!,
      name: role.establishmentName || 'Sem nome',
      slug: role.establishmentSlug || '',
      role: role.role,
      hasKitchen: role.hasKitchen,
      hasOrders: role.hasOrders,
      hasReports: role.hasReports,
      onlineOrdering: role.onlineOrdering,
      active: role.active,
    }))
    // Remover duplicatas (caso usuário tenha múltiplas roles no mesmo estabelecimento)
    .filter((est, index, self) =>
      index === self.findIndex(e => e.id === est.id)
    );

  // Se só tem um estabelecimento, não mostrar o switcher
  if (userEstablishments.length <= 1) {
    return null;
  }

  const handleSwitchEstablishment = (establishment: typeof userEstablishments[0]) => {
    setCurrentEstablishment(establishment);
    setIsOpen(false);

    // Redirecionar para dashboard após trocar
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão para abrir dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
          'border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50',
          'active:scale-95',
          {
            'border-primary-500 bg-primary-50': isOpen,
          }
        )}
        title="Trocar estabelecimento"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <div className="text-left hidden sm:block">
            <p className="text-xs text-neutral-500 leading-none">Estabelecimento</p>
            <p className="text-sm font-semibold text-neutral-900 leading-tight mt-0.5">
              {currentEstablishment.name}
            </p>
          </div>
        </div>

        <svg
          className={clsx('w-4 h-4 text-neutral-600 transition-transform', {
            'rotate-180': isOpen,
          })}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border-2 border-neutral-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in">
          <div className="p-3 bg-gradient-bg border-b-2 border-neutral-200">
            <p className="text-sm font-semibold text-neutral-900">
              Selecione um estabelecimento
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {userEstablishments.length} disponíveis
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {userEstablishments.map((establishment) => {
              const isCurrent = establishment.id === currentEstablishment.id;
              const userRole = user.roles.find(r => r.establishmentId === establishment.id);

              return (
                <button
                  key={establishment.id}
                  onClick={() => handleSwitchEstablishment(establishment)}
                  disabled={isCurrent}
                  className={clsx(
                    'w-full p-4 text-left transition-all border-b border-neutral-100 last:border-b-0',
                    {
                      'bg-primary-50 border-primary-200': isCurrent,
                      'hover:bg-neutral-50 active:bg-neutral-100 cursor-pointer': !isCurrent,
                      'cursor-default': isCurrent,
                    }
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={clsx('font-semibold truncate', {
                          'text-primary-900': isCurrent,
                          'text-neutral-900': !isCurrent,
                        })}>
                          {establishment.name}
                        </p>
                        {isCurrent && (
                          <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>

                      {establishment.slug && (
                        <p className="text-xs text-neutral-500 mb-2">
                          @{establishment.slug}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={userRole?.role === 'owner' ? 'success' : 'secondary'}
                          size="sm"
                        >
                          {userRole?.role === 'owner' ? 'Proprietário' : 'Funcionário'}
                        </Badge>

                        {/* Indicadores de módulos habilitados */}
                        <div className="flex items-center gap-1">
                          {establishment.hasOrders && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Comandas habilitadas" />
                          )}
                          {establishment.hasKitchen && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Cozinha habilitada" />
                          )}
                          {establishment.hasReports && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full" title="Relatórios habilitados" />
                          )}
                        </div>
                      </div>
                    </div>

                    {!isCurrent && (
                      <svg className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-neutral-50 border-t-2 border-neutral-200">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/select-establishment');
              }}
              className="w-full text-center text-sm text-neutral-600 hover:text-primary-600 transition-colors py-1"
            >
              Ver todos os estabelecimentos →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
