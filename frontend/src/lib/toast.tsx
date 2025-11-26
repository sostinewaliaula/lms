import React from 'react';
import toast, { ToastOptions } from 'react-hot-toast';
import CustomToast from '../components/toast/CustomToast';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface CustomToastOptions extends Omit<ToastOptions, 'icon'> {
  subtitle?: string;
  actions?: ToastAction[];
}

const createToast = (
  type: 'success' | 'info' | 'warning' | 'error',
  title: string,
  options?: CustomToastOptions
) => {
  const { subtitle, actions, ...toastOptions } = options || {};

  return toast.custom(
    (t) => (
      <CustomToast
        toast={t}
        title={title}
        subtitle={subtitle}
        type={type}
        actions={actions}
      />
    ),
    {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
      ...toastOptions,
    }
  );
};

// New custom toast functions with modern design
export const toastSuccess = (title: string, options?: CustomToastOptions) => {
  return createToast('success', title, options);
};

export const toastInfo = (title: string, options?: CustomToastOptions) => {
  return createToast('info', title, options);
};

export const toastWarning = (title: string, options?: CustomToastOptions) => {
  return createToast('warning', title, options);
};

export const toastError = (title: string, options?: CustomToastOptions) => {
  return createToast('error', title, options);
};

// Enhanced toast object that automatically uses custom design for success/error/info/warning
// All other methods remain unchanged for backward compatibility
const customToast = {
  success: (message: string, options?: CustomToastOptions | ToastOptions) => {
    return createToast('success', message, options as CustomToastOptions);
  },
  error: (message: string, options?: CustomToastOptions | ToastOptions) => {
    return createToast('error', message, options as CustomToastOptions);
  },
  info: (message: string, options?: CustomToastOptions | ToastOptions) => {
    return createToast('info', message, options as CustomToastOptions);
  },
  warning: (message: string, options?: CustomToastOptions | ToastOptions) => {
    return createToast('warning', message, options as CustomToastOptions);
  },
  // Keep other toast methods for backward compatibility
  loading: toast.loading,
  promise: toast.promise,
  custom: toast.custom,
  dismiss: toast.dismiss,
  remove: toast.remove,
};

// Export both: new named functions and enhanced toast object
export default customToast;
export { customToast };
// Also export original toast for advanced use cases
export { toast as originalToast };

