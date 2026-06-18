import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface ActionButton {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionButton?: ActionButton;
  secondaryAction?: ActionButton;
  className?: string;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionButton,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  const renderButton = (button: ActionButton, isPrimary: boolean = true) => {
    const ButtonIcon = button.icon;
    const variantClass = isPrimary
      ? button.variant === 'secondary'
        ? 'btn-secondary'
        : 'btn-primary'
      : 'btn-secondary';

    return (
      <button onClick={button.onClick} className={variantClass}>
        {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
        {button.label}
      </button>
    );
  };

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center mb-5">
        <Icon className="w-10 h-10 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {(actionButton || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && renderButton(secondaryAction, false)}
          {actionButton && renderButton(actionButton, true)}
        </div>
      )}
    </div>
  );
}
