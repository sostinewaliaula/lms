import { X, CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';
import { Toast } from 'react-hot-toast';

interface CustomToastProps {
  toast: Toast;
  title: string;
  subtitle?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

const iconMap = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const colorMap = {
  success: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-900 dark:text-green-100',
  },
  info: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
  },
  warning: {
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-900 dark:text-yellow-100',
  },
  error: {
    bg: 'bg-red-500',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-100',
  },
};

export default function CustomToast({ toast, title, subtitle, type, actions }: CustomToastProps) {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  return (
    <div
      className={`
        relative flex items-start gap-4 p-4 rounded-lg
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        shadow-xl
        min-w-[320px] max-w-[420px]
        ${colors.bgLight}
        ${colors.border}
        transition-all duration-300 ease-out
        ${toast.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        mb-3
      `}
    >
      {/* Close Button */}
      <button
        onClick={() => toast.dismiss(toast.id)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors z-10"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>

      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center shadow-sm`}>
        {type === 'warning' ? (
          <Icon className="w-5 h-5 text-gray-900 dark:text-gray-900" strokeWidth={2.5} fill="currentColor" />
        ) : (
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <h4 className={`font-semibold text-sm mb-1 ${colors.text} leading-tight`}>
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed pr-2">
            {subtitle}
          </p>
        )}
        
        {/* Action Buttons */}
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`
                  px-3 py-1.5 text-xs font-semibold rounded-md
                  transition-all duration-200
                  ${colors.text}
                  ${colors.bgLight}
                  hover:opacity-90 hover:scale-105
                  active:scale-95
                  border ${colors.border}
                  cursor-pointer
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

