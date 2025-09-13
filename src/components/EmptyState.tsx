import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      {icon && (
        <div className="mx-auto w-16 h-16 mb-4 text-manga-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-manga-text mb-2">{title}</h3>
      <p className="text-sm text-manga-muted mb-6 max-w-md mx-auto">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
