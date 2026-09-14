import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-surface-soft">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 pb-20 lg:pb-0">
          <div className="mx-auto w-full max-w-5xl px-base py-lg sm:px-lg">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
