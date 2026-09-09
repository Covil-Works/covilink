import AdminDashboard from '@/components/AdminDashboard';

export const metadata = {
  title: 'Painel Admin & Métricas | Covilink',
  description: 'Métricas de cliques em tempo real do seu portalink.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
