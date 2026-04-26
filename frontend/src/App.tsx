import { Outlet } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Header/Sidebar';

function App() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white font-sans">
      <Header />
      <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 p-4 md:ml-64 min-h-screen">
             <Outlet />
          </main>
      </div>
    </div>
  );
}

export default App;