/**
 * Example component showing how to use the new custom toast notifications
 * This file is for reference and can be deleted
 */

import { toastSuccess, toastInfo, toastWarning, toastError } from '@/lib/toast';

export default function ToastExample() {
  const showSuccessToast = () => {
    toastSuccess('Success notification', {
      subtitle: 'Subtitle and associated information pertaining to the event. Information to not exceed [x] characters.',
      actions: [
        {
          label: 'Action',
          onClick: () => console.log('Action 1 clicked'),
        },
        {
          label: 'Action',
          onClick: () => console.log('Action 2 clicked'),
        },
      ],
    });
  };

  const showInfoToast = () => {
    toastInfo('Informational notification', {
      subtitle: 'Subtitle and associated information pertaining to the event. Information to not exceed [x] characters.',
      actions: [
        {
          label: 'Action',
          onClick: () => console.log('Action 1 clicked'),
        },
        {
          label: 'Action',
          onClick: () => console.log('Action 2 clicked'),
        },
      ],
    });
  };

  const showWarningToast = () => {
    toastWarning('Warning notification', {
      subtitle: 'Subtitle and associated information pertaining to the event. Information to not exceed [x] characters.',
      actions: [
        {
          label: 'Action',
          onClick: () => console.log('Action 1 clicked'),
        },
        {
          label: 'Action',
          onClick: () => console.log('Action 2 clicked'),
        },
      ],
    });
  };

  const showErrorToast = () => {
    toastError('Error notification', {
      subtitle: 'Subtitle and associated information pertaining to the event. Information to not exceed [x] characters.',
      actions: [
        {
          label: 'Action',
          onClick: () => console.log('Action 1 clicked'),
        },
        {
          label: 'Action',
          onClick: () => console.log('Action 2 clicked'),
        },
      ],
    });
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Toast Examples</h2>
      <div className="flex gap-4">
        <button onClick={showSuccessToast} className="px-4 py-2 bg-green-500 text-white rounded">
          Success
        </button>
        <button onClick={showInfoToast} className="px-4 py-2 bg-blue-500 text-white rounded">
          Info
        </button>
        <button onClick={showWarningToast} className="px-4 py-2 bg-yellow-500 text-white rounded">
          Warning
        </button>
        <button onClick={showErrorToast} className="px-4 py-2 bg-red-500 text-white rounded">
          Error
        </button>
      </div>
    </div>
  );
}

