import Sidebar from './Sidebar';
import Header from '../header/Header';

export default function SidebarTester() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeItem="Dashboard Overview" />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-8">
          <h2 className="text-2xl font-semibold">Sidebar + Header Test Page</h2>
        </main>
      </div>
    </div>
  );
}
