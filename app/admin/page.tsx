import AdminDashboard from '@/components/AdminDashboard';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import { AuthProvider } from '@/lib/auth-client';

export const metadata = {
  title: 'Painel Admin & Métricas | Covilink',
  description: 'Métricas de cliques em tempo real do seu portalink.',
};

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminAuthGuard>
        <AdminDashboard />
      </AdminAuthGuard>
    </AuthProvider>
  );
}
