import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';
import useAuthStore from './store/authStore';
import useChatStore from './store/chatStore';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Publish from './pages/Publish';
import Profile from './pages/Profile';
import MyProducts from './pages/MyProducts';
import MyFavorites from './pages/MyFavorites';
import MyWants from './pages/MyWants';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Wants from './pages/Wants';
import Dashboard from './pages/admin/Dashboard';
import Verifications from './pages/admin/Verifications';
import Reports from './pages/admin/Reports';

export default function App() {
  const { token, isAuthenticated, fetchUser } = useAuthStore();
  const { connect, disconnect, fetchConversations } = useChatStore();

  useEffect(() => {
    if (token) {
      fetchUser();
      connect(token);
      fetchConversations();
    }
    return () => disconnect();
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      const id = setInterval(fetchConversations, 30000);
      return () => clearInterval(id);
    }
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/wants" element={<Wants />} />
        <Route path="/publish" element={<AuthGuard><Publish /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route path="/profile/products" element={<AuthGuard><MyProducts /></AuthGuard>} />
        <Route path="/profile/favorites" element={<AuthGuard><MyFavorites /></AuthGuard>} />
        <Route path="/profile/wants" element={<AuthGuard><MyWants /></AuthGuard>} />
        <Route path="/messages" element={<AuthGuard><Messages /></AuthGuard>} />
        <Route path="/messages/:id" element={<AuthGuard><Chat /></AuthGuard>} />
        <Route path="/admin" element={<AdminGuard><Dashboard /></AdminGuard>} />
        <Route path="/admin/verifications" element={<AdminGuard><Verifications /></AdminGuard>} />
        <Route path="/admin/reports" element={<AdminGuard><Reports /></AdminGuard>} />
      </Route>
    </Routes>
  );
}
