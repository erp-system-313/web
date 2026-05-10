import { message } from 'antd';
import type { ReactNode } from 'react';

interface ToastOptions {
  duration?: number;
  icon?: ReactNode;
  key?: string | number;
}

const toast = {
  success: (content: ReactNode, options?: ToastOptions) => {
    message.success({ content, ...options });
  },
  error: (content: ReactNode, options?: ToastOptions) => {
    message.error({ content, ...options });
  },
  warning: (content: ReactNode, options?: ToastOptions) => {
    message.warning({ content, ...options });
  },
  info: (content: ReactNode, options?: ToastOptions) => {
    message.info({ content, ...options });
  },
  loading: (content: ReactNode, options?: ToastOptions) => {
    message.loading({ content, ...options });
  },
  destroy: () => {
    message.destroy();
  },
};

export default toast;
