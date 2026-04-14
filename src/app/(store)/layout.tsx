import { Navbar } from '@/components/store/Navbar';
import { CartDrawer } from '@/components/store/CartDrawer';
import { T } from '@/components/T';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <CartDrawer />
      <footer className="border-t py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} <T k="siteTitle" /> — <T k="footerRights" />
      </footer>
    </div>
  );
}
