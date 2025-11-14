import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header mobileMenu={<Sidebar />} />
      <div className="flex-1 flex">
        <Sidebar className="hidden md:block w-64" />
        <main className="flex-1 overflow-auto">
          <div className="container py-6 px-4 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
