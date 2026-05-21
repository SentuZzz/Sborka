import React from 'react';
import { Link } from 'react-router-dom';
import { FiColumns, FiStar, FiTrash2 } from 'react-icons/fi';

const ComparePage = ({ compareList, toggleCompare }) => {
  if (compareList.length === 0) {
    return (
      <div style={{ background: 'white', padding: '60px 40px', borderRadius: '12px', textAlign: 'center' }}>
        <FiColumns size={64} color="#ccc" style={{ marginBottom: '20px' }} />
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Список сравнения пуст</h2>
        <p style={{ color: '#888', marginBottom: '30px' }}>Добавьте товары для сравнения, нажав <FiColumns size={14} style={{ verticalAlign: 'middle' }} /> на карточке товара</p>
        <Link to="/" style={{ display: 'inline-block', padding: '14px 30px', background: '#7A0000', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Перейти в каталог</Link>
      </div>
    );
  }

  // Собираем все уникальные ключи характеристик
  const allSpecKeys = new Set();
  compareList.forEach(p => {
    const specs = typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {});
    Object.keys(specs).forEach(k => allSpecKeys.add(k));
  });

  const hasDiscount = (p) => Boolean(p.discount_percent && p.discount_percent > 0);
  const getPrice = (p) => hasDiscount(p) ? Math.floor(p.price - (p.price * p.discount_percent / 100)) : p.price;

  return (
    <div style={{ background: 'white', padding: '40px', borderRadius: '12px' }}>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#7A0000', textDecoration: 'none' }}>Главная</Link> / Сравнение товаров
      </div>
      <h2 style={{ marginBottom: '30px' }}>Сравнение товаров ({compareList.length})</h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${compareList.length * 250 + 180}px` }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '15px', textAlign: 'left', width: '180px', color: '#888', fontSize: '13px' }}>Характеристика</th>
              {compareList.map(p => (
                <th key={p.id} style={{ padding: '15px', textAlign: 'center', minWidth: '220px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.images && p.images[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : <span style={{ color: '#ccc' }}>Нет фото</span>}
                    </div>
                    <Link to={`/product/${p.id}`} style={{ color: '#111', textDecoration: 'none', fontWeight: '600', fontSize: '14px', lineHeight: '1.4' }}>{p.name}</Link>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#111' }}>{getPrice(p).toLocaleString()} ₽</span>
                    <button onClick={() => toggleCompare(p)} style={{ padding: '6px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FiTrash2 size={12} /> Убрать
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Бренд */}
            <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '12px 15px', color: '#888', fontWeight: '500' }}>Бренд</td>
              {compareList.map(p => (
                <td key={p.id} style={{ padding: '12px 15px', textAlign: 'center', fontWeight: '600' }}>{p.brand || '—'}</td>
              ))}
            </tr>
            {/* Категория */}
            <tr style={{ borderBottom: '1px solid #f5f5f5', background: '#fafafa' }}>
              <td style={{ padding: '12px 15px', color: '#888', fontWeight: '500' }}>Категория</td>
              {compareList.map(p => (
                <td key={p.id} style={{ padding: '12px 15px', textAlign: 'center' }}>{p.category || '—'}</td>
              ))}
            </tr>
            {/* Рейтинг */}
            <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '12px 15px', color: '#888', fontWeight: '500' }}>Рейтинг</td>
              {compareList.map(p => (
                <td key={p.id} style={{ padding: '12px 15px', textAlign: 'center' }}>
                  {Number(p.avg_rating) > 0 ? (
                    <span style={{ color: '#ff9900', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiStar size={14} fill="#ff9900" /> {p.avg_rating}/5 ({p.review_count} отз.)
                    </span>
                  ) : <span style={{ color: '#ccc' }}>Нет отзывов</span>}
                </td>
              ))}
            </tr>
            {/* Динамические спеки */}
            {[...allSpecKeys].map((key, i) => (
              <tr key={key} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={{ padding: '12px 15px', color: '#888', fontWeight: '500' }}>{key}</td>
                {compareList.map(p => {
                  const specs = typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {});
                  return <td key={p.id} style={{ padding: '12px 15px', textAlign: 'center', fontWeight: '600' }}>{specs[key] || '—'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
