import Sidebar from './Sidebar';
import Header from '../header/Header';
import EmailEditor from '../../../components/email-comms/EmailEditor';

export default function SidebarTester() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-8">
          <EmailEditor />
        </main>
      </div>
    </div>
  );
}
