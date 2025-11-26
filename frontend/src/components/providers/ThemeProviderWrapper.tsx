import { ThemeProvider } from '@/contexts/ThemeContext';

interface ThemeProviderWrapperProps {
  children: React.ReactNode;
}

export default function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps) {
  return <ThemeProvider>{children}</ThemeProvider>;
}


