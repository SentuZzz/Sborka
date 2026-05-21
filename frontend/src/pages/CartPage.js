import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';

const CartPage = ({ cart, updateCartQty, promo, setPromo, cartTotalRaw, cartTotal, token, handleCheckout, setAuthModalOpen }) => {
  return (
    <div style={{ background: 'white', padding: '40px', borderRadius: '12px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Хлебные крошки */}
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#7A0000', textDecoration: 'none' }}>Главная</Link> / Корзина
      </div>

      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FiShoppingCart size={24} /> Оформление заказа
      </h2>
      
      {cart.length === 0 ? (
        /* Пустое состояние */
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <FiShoppingCart size={72} color="#ccc" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#555', marginBottom: '10px' }}>Корзина пуста</h3>
          <p style={{ color: '#999', marginBottom: '30px' }}>Добавьте товары из каталога, чтобы оформить заказ</p>
          <Link to="/" style={{ display: 'inline-block', padding: '14px 30px', background: '#7A0000', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '16px' }}>
            Перейти к покупкам
          </Link>
        </div>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cart.map(i => (
              <li key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <strong>{i.name}</strong><br/>
                  <span style={{ color: '#888' }}>{i.discount_percent > 0 ? Math.floor(i.price - (i.price * i.discount_percent / 100)) : i.price} ₽ x {i.quantity} шт. = {(i.discount_percent > 0 ? Math.floor(i.price - (i.price * i.discount_percent / 100)) : i.price) * i.quantity} ₽</span>
                  {i.discount_percent > 0 && <span style={{ color: '#C41E3A', fontSize: '12px', marginLeft: '8px' }}>(-{i.discount_percent}%)</span>}
                </div>
                <div>
                  <button onClick={() => updateCartQty(i.id, -1)} style={{ padding: '5px 15px', marginRight: '5px', border: '1px solid #ddd', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                  <button onClick={() => updateCartQty(i.id, 1)} style={{ padding: '5px 15px', border: '1px solid #ddd', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                </div>
              </li>
            ))}
          </ul>
          
          <div style={{ marginTop: '30px', textAlign: 'right' }}>
            <input 
              placeholder="Промокод (RUSSIA10)" 
              value={promo} 
              onChange={e => setPromo(e.target.value.toUpperCase())} 
              style={{ padding: '12px', marginRight: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
            <h3>
              Итого: {promo === 'RUSSIA10' ? <><s style={{ color: '#999' }}>{cartTotalRaw} ₽</s> <span style={{ color: '#7A0000' }}>{cartTotal} ₽</span></> : `${cartTotal} ₽`}
            </h3>
          </div>
          
          {!token ? (
            <div style={{ background: '#fff3cd', padding: '15px', textAlign: 'center', marginTop: '20px', borderRadius: '6px' }}>
              Войдите в аккаунт для заказа!
            </div>
          ) : (
            <button onClick={handleCheckout} style={{ width: '100%', padding: '18px', background: '#7A0000', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>
              Подтвердить заказ
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CartPage;