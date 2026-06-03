import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; // <-- Импортируем библиотеку

import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ComparePage from './pages/ComparePage';
import InfoPage from './pages/InfoPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState(() => { const s = localStorage.getItem('cart'); return s ? JSON.parse(s) : []; });
  useEffect(() => { const minimal = cart.map(c => ({ id: c.id, quantity: c.quantity })); localStorage.setItem('cart', JSON.stringify(minimal)); }, [cart]);
  
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || 'guest');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  
  const [wishlist, setWishlist] = useState([]);
  const [profile, setProfile] = useState({ phone: '', address: '' });
  const [promo, setPromo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // === СРАВНЕНИЕ ТОВАРОВ ===
  const [compareList, setCompareList] = useState(() => {
    const s = localStorage.getItem('compareList');
    return s ? JSON.parse(s) : [];
  });
  useEffect(() => { localStorage.setItem('compareList', JSON.stringify(compareList)); }, [compareList]);

  const toggleCompare = (product) => {
    const exists = compareList.some(c => c.id === product.id);
    if (exists) {
      setCompareList(compareList.filter(c => c.id !== product.id));
      toast.success('Убрано из сравнения');
    } else {
      if (compareList.length >= 4) {
        toast.error('Максимум 4 товара для сравнения!');
        return;
      }
      // Проверка категории — сравниваем только одинаковые
      if (compareList.length > 0 && compareList[0].category !== product.category) {
        toast.error(`Можно сравнивать только товары одной категории! В списке: ${compareList[0].category}`);
        return;
      }
      setCompareList([...compareList, product]);
      toast.success('Добавлено в сравнение');
    }
  };
  
const emptyForm = { name: '', price: '', old_price: '', is_russian: false, category: '', brand: '', short_description: '', images: '', specs: '', stock_count: '', sku: '' };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Обогащаем корзину актуальными данными из products
  useEffect(() => {
    if (products.length === 0) return;
    setCart(prev => {
      const enriched = prev.map(item => {
        const fresh = products.find(p => p.id === item.id);
        if (!fresh) return null;
        return { ...fresh, quantity: item.quantity };
      }).filter(Boolean);
      // Только обновляем если реально что-то изменилось (чтобы не зациклить)
      const changed = enriched.length !== prev.length || enriched.some((e, i) => e.id !== prev[i]?.id || e.price !== prev[i]?.price);
      return changed ? enriched : prev;
    });
    // Обогащаем compareList тоже
    setCompareList(prev => {
      const enriched = prev.map(item => {
        const fresh = products.find(p => p.id === item.id);
        return fresh || null;
      }).filter(Boolean);
      const changed = enriched.length !== prev.length || enriched.some((e, i) => e.id !== prev[i]?.id);
      return changed ? enriched : prev;
    });
  }, [products]);

  const refreshAdminData = (currentToken) => {
    const cfg = { headers: { Authorization: `Bearer ${currentToken}` } };
    axios.get('http://localhost:5000/api/orders', cfg).then(res => setOrders(res.data)).catch(() => {});
    axios.get('http://localhost:5000/api/analytics', cfg).then(res => setAnalytics(res.data)).catch(() => {});
  };

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/products')
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));

    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => {});

    if (token) {
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      if (role === 'admin') {
        axios.get('http://localhost:5000/api/orders', cfg).then(res => setOrders(res.data)).catch(() => {});
        axios.get('http://localhost:5000/api/analytics', cfg).then(res => setAnalytics(res.data)).catch(() => {});
      } else {
        axios.get('http://localhost:5000/api/wishlist', cfg).then(res => setWishlist(res.data)).catch(() => {});
        axios.get('http://localhost:5000/api/profile', cfg).then(res => setProfile({ phone: res.data.phone || '', address: res.data.address || '' })).catch(() => {});
        axios.get('http://localhost:5000/api/orders/my', cfg).then(res => setMyOrders(res.data)).catch(() => {});
      }
    }
  }, [role, token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username: authName, password: authPassword });
      localStorage.setItem('token', res.data.token); localStorage.setItem('role', res.data.role); localStorage.setItem('username', res.data.username);
      setToken(res.data.token); setRole(res.data.role); setUsername(res.data.username);
      setAuthModalOpen(false); setAuthName(''); setAuthPassword('');
      toast.success(`С возвращением, ${res.data.username}!`);
    } catch (err) { toast.error('Ошибка входа! Проверьте логин и пароль.'); }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    try { 
      await axios.post('http://localhost:5000/api/register', { username: authName, password: authPassword }); 
      toast.success('Успешная регистрация! Теперь войдите.'); 
      setAuthModalOpen(false); setAuthName(''); setAuthPassword('');
    } catch (err) { toast.error('Пользователь уже существует!'); }
  };
  
  const handleLogout = () => { localStorage.clear(); window.location.reload(); };

  const addToCart = (product) => {
    const existing = cart.find(c => c.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    if (product.stock_count !== undefined && currentQty >= product.stock_count) {
      toast.error(`Максимальное количество в наличии: ${product.stock_count} шт.`);
      return;
    }
    if (existing) setCart(cart.map(c => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    else setCart([...cart, { ...product, quantity: 1 }]);
    toast.success('Добавлено в корзину!');
  };
  
  const updateCartQty = (id, delta) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    // Проверяем ограничение наличия
    if (delta > 0 && item.stock_count !== undefined && newQty > item.stock_count) {
      toast.error(`Максимальное количество в наличии: ${item.stock_count} шт.`);
      return;
    }
    const newCart = cart.map(c => c.id === id ? { ...c, quantity: newQty } : c).filter(c => c.quantity > 0);
    setCart(newCart);
  };
  
  const cartTotalRaw = cart.reduce((s, i) => {
    const price = i.discount_percent > 0 ? Math.floor(i.price - (i.price * i.discount_percent / 100)) : i.price;
    return s + (price * i.quantity);
  }, 0);
  const cartTotal = promo === 'RUSSIA10' ? Math.floor(cartTotalRaw * 0.9) : cartTotalRaw;
  
  const handleCheckout = () => {
    if (cart.length === 0) return toast.error('Корзина пуста');
    if (!profile.phone || !profile.address) return toast.error('Заполните телефон и адрес в профиле!');
    axios.post('http://localhost:5000/api/orders', { items: cart, promo, phone: profile.phone, address: profile.address }, authConfig)
      .then(() => { toast.success('Заказ успешно оформлен!'); setCart([]); setPromo(''); })
      .catch(() => toast.error('Ошибка оформления заказа'));
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.some(w => w.id === product.id);
    if (exists) { 
      axios.delete(`http://localhost:5000/api/wishlist/${product.id}`, authConfig)
        .then(() => { setWishlist(wishlist.filter(w => w.id !== product.id)); toast.success('Удалено из избранного'); }); 
    } else { 
      axios.post(`http://localhost:5000/api/wishlist/${product.id}`, {}, authConfig)
        .then(() => { setWishlist([...wishlist, product]); toast.success('Добавлено в избранное'); }); 
    }
  };
  
  const saveProfile = (e) => {
    e.preventDefault();
    const phoneRegex = /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    if (profile.phone && !phoneRegex.test(profile.phone)) {
      return toast.error('Неверный формат телефона! Пример: +7 (999) 000-00-00');
    }
    axios.put('http://localhost:5000/api/profile', profile, authConfig)
      .then(() => toast.success('Профиль сохранен'))
      .catch((err) => toast.error(err.response?.data?.error || 'Ошибка сохранения профиля'));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('image', file);
    try {
      const res = await axios.post('http://localhost:5000/api/upload', fd, authConfig);
      setForm({ ...form, images: form.images ? form.images + ', ' + res.data.imageUrl : res.data.imageUrl });
      toast.success('Картинка загружена!');
    } catch (e) { toast.error('Ошибка загрузки картинки'); }
  };
  
  const handleSubmitProduct = (e) => {
    e.preventDefault(); 
    
    // === 1. РУЧНАЯ ПРОВЕРКА ПОЛЕЙ (ВАЛИДАЦИЯ) ===
    if (!form.name.trim()) return toast.error('Пожалуйста, укажите "Название" товара!');
    if (!form.price || form.price <= 0) return toast.error('Пожалуйста, укажите корректную "Цену"!');
    if (!form.category.trim()) return toast.error('Пожалуйста, укажите "Категорию"!');
    if (!form.images.trim()) return toast.error('Пожалуйста, добавьте хотя бы одну "Ссылку на картинку"!');

    // === 2. ПРОВЕРКА ФОРМАТА ХАРАКТЕРИСТИК ===
    let parsed = {};
    try { 
      parsed = form.specs ? JSON.parse(form.specs) : {}; 
    } catch (e) { 
      return toast.error('Ошибка: Характеристики должны быть в формате JSON!'); 
    }
    
    // === 3. ПОДГОТОВКА ДАННЫХ К ОТПРАВКЕ ===
    const payload = { 
      ...form, 
      price: Number(form.price), 
      old_price: form.old_price ? Number(form.old_price) : null,
      stock_count: form.stock_count !== '' ? Number(form.stock_count) : 0,
      images: typeof form.images === 'string' ? form.images.split(',').map(s => s.trim()).filter(Boolean) : form.images, 
      specs: parsed 
    };
    
    // === 4. ОТПРАВКА НА СЕРВЕР ===
    if (editingId) {
      axios.put(`http://localhost:5000/api/products/${editingId}`, payload, authConfig)
        .then(res => { 
          setProducts(products.map(p => p.id === editingId ? res.data : p)); 
          setForm(emptyForm); // Очищаем поля
          setEditingId(null); 
          toast.success('Товар успешно обновлен!'); // Уведомление об успехе
        })
        .catch(err => toast.error(err.response?.data?.error || 'Ошибка при обновлении товара'));
    } else {
      axios.post('http://localhost:5000/api/products', payload, authConfig)
        .then(res => { 
          setProducts([...products, res.data]); 
          setForm(emptyForm); // Очищаем поля
          toast.success('Новый товар успешно добавлен!'); // Уведомление об успехе
        })
        .catch(err => toast.error(err.response?.data?.error || 'Ошибка при создании товара'));
    }
  };
  
  const handleDeleteProduct = (id) => { 
    if (window.confirm('Точно удалить этот товар?')) {
      axios.delete(`http://localhost:5000/api/products/${id}`, authConfig)
        .then(() => { setProducts(products.filter(p => p.id !== id)); toast.success('Товар удален'); }); 
    }
  };
  const handleAssignDiscount = (id, percent) => {
    axios.patch(`http://localhost:5000/api/products/${id}/discount`, { discount_percent: percent }, authConfig)
      .then(res => {
        setProducts(products.map(p => p.id === id ? { ...p, ...res.data } : p));
        toast.success(percent > 0 ? `Скидка ${percent}% применена!` : 'Скидка убрана!');
      })
      .catch(err => toast.error(err.response?.data?.error || 'Ошибка при назначении скидки'));
  };
  
  const handleEditClick = (p) => { setEditingId(p.id); setForm({ ...p, images: p.images ? p.images.join(', ') : '', specs: p.specs ? JSON.stringify(p.specs) : '', stock_count: p.stock_count ?? '' }); window.scrollTo(0, 0); };

  const handleAddCategory = async (name) => {
    try {
      const res = await axios.post('http://localhost:5000/api/categories', { name }, authConfig);
      setCategories([...categories, res.data]);
      toast.success('Категория добавлена');
    } catch (e) { toast.error(e.response?.data?.error || 'Ошибка'); }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Удалить категорию?')) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${id}`, authConfig);
        setCategories(categories.filter(c => c.id !== id));
        toast.success('Категория удалена');
      } catch (e) { toast.error('Ошибка удаления'); }
    }
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* СТИЛЬНЫЙ КОНТЕЙНЕР УВЕДОМЛЕНИЙ */}
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', borderRadius: '8px' } }} />
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} onRegister={handleRegister} authName={authName} setAuthName={setAuthName} authPassword={authPassword} setAuthPassword={setAuthPassword} />
      
      <div style={{ fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', background: '#fafafa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header role={role} token={token} username={username} cart={cart} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleLogout={handleLogout} setAuthModalOpen={setAuthModalOpen} compareList={compareList} />

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', flex: 1, width: '100%' }}>
          <Routes>
            <Route path="/" element={<HomePage products={products} searchQuery={searchQuery} role={role} token={token} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} compareList={compareList} toggleCompare={toggleCompare} loading={loading} />} />
            <Route path="/product/:id" element={<ProductPage cart={cart} addToCart={addToCart} role={role} token={token} username={username} wishlist={wishlist} toggleWishlist={toggleWishlist} compareList={compareList} toggleCompare={toggleCompare} />} />
            <Route path="/cart" element={<CartPage cart={cart} updateCartQty={updateCartQty} promo={promo} setPromo={setPromo} cartTotalRaw={cartTotalRaw} cartTotal={cartTotal} token={token} handleCheckout={handleCheckout} setAuthModalOpen={setAuthModalOpen} />} />
            <Route path="/profile" element={<ProfilePage profile={profile} setProfile={setProfile} saveProfile={saveProfile} wishlist={wishlist} toggleWishlist={toggleWishlist} myOrders={myOrders} />} />
            <Route path="/compare" element={<ComparePage compareList={compareList} toggleCompare={toggleCompare} />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/admin" element={<AdminPage role={role} analytics={analytics} editingId={editingId} setEditingId={setEditingId} handleFileUpload={handleFileUpload} handleSubmitProduct={handleSubmitProduct} form={form} setForm={setForm} emptyForm={emptyForm} products={products} categories={categories} handleAddCategory={handleAddCategory} handleDeleteCategory={handleDeleteCategory} handleEditClick={handleEditClick} handleDeleteProduct={handleDeleteProduct} handleAssignDiscount={handleAssignDiscount} orders={orders} setOrders={setOrders} authConfig={authConfig} refreshAdminData={() => refreshAdminData(token)} />} />
          </Routes>
        </div>
        <Footer token={token} categories={categories} />
      </div>
    </BrowserRouter>
  );
}

export default App;