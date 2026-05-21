import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiPackage } from 'react-icons/fi';

const ProfilePage = ({ profile, setProfile, saveProfile, wishlist, toggleWishlist, myOrders }) => {
  return (
    <div>
      {/* Хлебные крошки */}
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#7A0000', textDecoration: 'none' }}>Главная</Link> / Профиль
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', background: 'white', padding: '30px', borderRadius: '12px' }}>
          <h2>Настройки профиля</h2>
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input placeholder="Телефон" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} />
            <textarea placeholder="Адрес доставки" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} rows="3"></textarea>
            <button type="submit" style={{ padding: '15px', background: '#000', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Сохранить настройки</button>
          </form>
          
          <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Избранное ({wishlist.length})</h3>
          {wishlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <FiHeart size={48} color="#ccc" style={{ marginBottom: '10px' }} />
              <p style={{ color: '#999', marginBottom: '15px' }}>Здесь будут ваши избранные товары</p>
              <Link to="/" style={{ color: '#7A0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>Перейти в каталог →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {wishlist.map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <Link to={`/product/${w.id}`} style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>{w.name}</Link>
                  <button onClick={() => toggleWishlist(w)} style={{ color: '#C41E3A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Удалить</button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ flex: '2 1 400px', background: 'white', padding: '30px', borderRadius: '12px' }}>
          <h2>Мои заказы</h2>
          {myOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 10px' }}>
              <FiPackage size={48} color="#ccc" style={{ marginBottom: '10px' }} />
              <p style={{ color: '#999', marginBottom: '15px' }}>У вас пока нет заказов</p>
              <Link to="/" style={{ color: '#7A0000', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>Начните покупки →</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px' }}>№</th>
                    <th style={{ padding: '12px' }}>Дата</th>
                    <th style={{ padding: '12px' }}>Сумма</th>
                    <th style={{ padding: '12px' }}>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>#{o.id}</td>
                      <td style={{ padding: '12px' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{o.total_price} ₽</td>
                      <td style={{ padding: '12px' }}>{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;