import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiColumns } from 'react-icons/fi';

// ИМПОРТИРУЕМ SVG КАК REACT-КОМПОНЕНТЫ
import { ReactComponent as CartIcon } from '../assets/icons/cart.svg';
import { ReactComponent as UserIcon } from '../assets/icons/user.svg';

// Хохлома-орнамент для шапки
import khokhlomaHeader from '../assets/khokhloma-header.png';

const Header = ({ role, token, username, cart, searchQuery, setSearchQuery, handleLogout, setAuthModalOpen, compareList }) => {
  const [bouncing, setBouncing] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(0);

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  useEffect(() => {
    if (cartCount > prevCartCount && prevCartCount > 0) {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 500);
    }
    setPrevCartCount(cartCount);
  }, [cartCount]);

  return (
    <header style={{ background: '#0B0B0B', color: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Контейнер на всю ширину с орнаментами по бокам */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', minHeight: '60px' }}>
        
        {/* Левый орнамент */}
        <div style={{ 
          width: '180px', 
          flexShrink: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
          height: '60px'
        }}>
          <img 
            src={khokhlomaHeader} 
            alt="" 
            style={{ 
              height: '55px', 
              objectFit: 'cover',
              objectPosition: 'left center',
              opacity: 0.7,
              filter: 'brightness(0.85)'
            }} 
          />
        </div>

        {/* Центральная часть — выровнена по сетке контента */}
        <div style={{ 
          flex: 1, 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: '12px 40px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          {/* Логотип */}
          <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '1px', fontWeight: '900', flexShrink: 0 }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>СБОРКА</Link>
          </h1>
          
          {/* Строка поиска */}
          <div style={{ flex: 1, maxWidth: '600px', margin: '0 40px', display: 'flex' }}>
            <input type="text" placeholder="Поиск по товарам..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 20px', border: 'none', borderRadius: '4px 0 0 4px', fontSize: '15px', outline: 'none', background: '#f1f1f1' }} />
            <button style={{ padding: '0 25px', background: '#e0e0e0', border: 'none', borderRadius: '0 4px 4px 0', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Поиск</button>
          </div>

          {/* Навигация справа */}
          <nav style={{ display: 'flex', gap: '25px', alignItems: 'center', flexShrink: 0 }}>
            {role === 'admin' && <Link to="/admin" style={{ color: '#ff4444', textDecoration: 'none', fontWeight: 'bold' }}>АДМИН-ПАНЕЛЬ</Link>}
            
            {/* Кнопка сравнения */}
            {role !== 'admin' && compareList && compareList.length > 0 && (
              <Link to="/compare" style={{ color: 'white', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FiColumns size={22} />
                <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#007bff', color: 'white', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>{compareList.length}</span>
              </Link>
            )}

            {role !== 'admin' && (
              <Link to="/cart" style={{ color: 'white', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span className={bouncing ? 'cart-bounce' : ''} style={{ display: 'flex' }}>
                  <CartIcon width="26" height="26" fill="white" />
                </span>
                {cart.length > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#7A0000', color: 'white', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>{cartCount}</span>}
              </Link>
            )}
            
            {token ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {role !== 'admin' && (
                  <Link to="/profile" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                     <UserIcon width="24" height="24" fill="white" />
                  </Link>
                )}
                <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #555', color: 'white', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Выход</button>
              </div>
            ) : (
              <div onClick={() => setAuthModalOpen(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                 <UserIcon width="24" height="24" fill="white" />
              </div>
            )}
          </nav>
        </div>

        {/* Правый орнамент */}
        <div style={{ 
          width: '180px', 
          flexShrink: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden',
          height: '60px'
        }}>
          <img 
            src={khokhlomaHeader} 
            alt="" 
            style={{ 
              height: '55px', 
              objectFit: 'cover',
              objectPosition: 'right center',
              opacity: 0.7,
              filter: 'brightness(0.85)',
              transform: 'scaleX(-1)'
            }} 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;