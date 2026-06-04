import { ReactNode } from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 rounded-2xl bg-gray-100 dark:bg-slate-800 mb-4">
        {icon || <FileX className="h-10 w-10 text-gray-400 dark:text-slate-500" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-slate-400 text-center max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
