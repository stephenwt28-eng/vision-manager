import { ToastProvider } from '@/contexts/ToastContext';
import './globals.css'; // O arquivo com o Tailwind v4 e variáveis que criamos

export const metadata = {
  title: 'Otica VisionManager',
  description: 'Design minimalista focado em experiência',
   icons: {
    icon: '/Logo_Red.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {/* Provedor global de notificações */}
        <ToastProvider>
          {children}
        </ToastProvider>

        {/* Portal Geral: Gaveta onde Modais, Drawers e Selects serão injetados fora da árvore DOM principal */}
        <div id="portal-root" />
      </body>
    </html>
  );
}