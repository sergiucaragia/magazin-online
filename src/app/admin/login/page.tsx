import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import { T } from '@/components/T';

export const metadata = { title: 'Login Admin — Magazinul Meu' };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin</h1>
        <p className="text-sm text-gray-500 mb-8"><T k="adminLoginSubtitle" /></p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
