import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import { login, logout } from './store/authSlice';
import conf from './conf/conf';
import { Loader2 } from 'lucide-react';
import Header from './components/Header/Header';
import Sidebar from './components/Header/Sidebar';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    axios.get(`${conf.backendUrl}/users/current-user`)
      .then((userData) => {
        if (userData.data.data) {
          dispatch(login(userData.data.data));
        } else {
          dispatch(logout());
        }
      })
      .catch(() => dispatch(logout()))
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0F0F0F] text-white">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

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