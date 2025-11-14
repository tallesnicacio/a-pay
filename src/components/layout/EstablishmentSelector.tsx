import { Check, ChevronsUpDown, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const EstablishmentSelector = () => {
  const { establishments, currentEstablishment, setCurrentEstablishment, loading } = useEstablishment();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <Button variant="outline" disabled className="w-full md:w-[280px] justify-between">
        <Store className="mr-2 h-4 w-4" />
        <span className="truncate">Carregando...</span>
      </Button>
    );
  }

  if (establishments.length === 0) {
    return (
      <Button variant="outline" disabled className="w-full md:w-[280px] justify-between">
        <Store className="mr-2 h-4 w-4" />
        <span className="truncate">Nenhum estabelecimento</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full md:w-[280px] justify-between"
        >
          <Store className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {currentEstablishment?.name || 'Selecione um estabelecimento'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full md:w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar estabelecimento..." />
          <CommandList>
            <CommandEmpty>Nenhum estabelecimento encontrado.</CommandEmpty>
            <CommandGroup>
              {establishments.map((establishment) => (
                <CommandItem
                  key={establishment.id}
                  value={establishment.name}
                  onSelect={() => {
                    setCurrentEstablishment(establishment);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentEstablishment?.id === establishment.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{establishment.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {establishment.has_kitchen && 'Cozinha '}
                      {establishment.has_orders && 'Pedidos'}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
