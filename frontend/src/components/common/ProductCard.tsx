import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import clsx from 'clsx';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  isNew?: boolean;
  isPopular?: boolean;
  isAvailable?: boolean;
  onAdd?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  category,
  isNew = false,
  isPopular = false,
  isAvailable = true,
  onAdd,
  onEdit,
  onDelete,
  onClick,
  className,
}: ProductCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAdd && isAvailable) {
      onAdd(id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <Card
      padding="none"
      hoverable
      onClick={handleCardClick}
      className={clsx(
        'overflow-hidden group',
        {
          'opacity-60': !isAvailable,
        },
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-neutral-100">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge variant="primary" className="animate-pulse-soft shadow-md">
              Novo
            </Badge>
          )}
          {isPopular && (
            <Badge variant="warning" className="shadow-md">
              Popular
            </Badge>
          )}
          {!isAvailable && (
            <Badge variant="neutral" className="shadow-md">
              Indisponível
            </Badge>
          )}
        </div>

        {/* Category icon */}
        {category && (
          <div className="absolute top-3 right-3">
            <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5 text-neutral-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg text-neutral-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Category label */}
        {category && (
          <p className="text-xs text-neutral-400 uppercase tracking-wide font-medium">
            {category}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <span className="text-2xl font-bold text-primary-600 font-mono">
            R$ {price.toFixed(2)}
          </span>

          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-danger-600 hover:text-danger-700 hover:bg-danger-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            )}

            {onAdd && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddClick}
                disabled={!isAvailable}
                className="shadow-primary"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Adicionar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
