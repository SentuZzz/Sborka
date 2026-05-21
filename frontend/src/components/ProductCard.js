import React from 'react';
import { Link } from 'react-router-dom';
import { FiColumns } from 'react-icons/fi';

// ИМПОРТ ИКОНОК
import { ReactComponent as CartAddIcon } from '../assets/icons/cart-add.svg';
import { ReactComponent as HeartFilledIcon } from '../assets/icons/heart-filled.svg';
import { ReactComponent as HeartOutlineIcon } from '../assets/icons/heart-outline.svg';
import { ReactComponent as StarIcon } from '../assets/icons/star-filled.svg';

const ProductCard = ({ p, role, token, wishlist, toggleWishlist, addToCart, compareList, toggleCompare }) => {
  const isWished = wishlist.some(w => w.id === p.id);
  const isCompared = compareList ? compareList.some(c => c.id === p.id) : false;
  const hasDiscount = Boolean(p.discount_percent && p.discount_percent > 0);
  const hasReviews = Boolean(p.review_count && Number(p.review_count) > 0);
  
  const currentPrice = hasDiscount 
    ? Math.floor(p.price - (p.price * p.discount_percent / 100))
    : p.price;

  return (
    <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.3s, border-color 0.3s', height: '100%' }}>
      
      {hasDiscount ? (
        <div style={{ position: 'absolute', top: 20, left: 20, background: '#7A0000', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', zIndex: 2 }}>
          -{p.discount_percent}%
        </div>
      ) : null}
      
      {p.is_russian && <span style={{ background: '#27ae60', color: 'white', fontSize: '10px', padding: '4px 8px', position: 'absolute', top: 20, right: 20, borderRadius: '4px', zIndex: 2 }}>РФ</span>}
      
      <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', padding: '10px' }}>
          {p.images && p.images[0] ? <img src={p.images[0]} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ color: '#ccc' }}>Нет фото</span>}
        </div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600', lineHeight: '1.4', color: '#111', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '42px' }}>{p.name}</h4>
      </Link>
      
      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '8px', minHeight: '26px' }}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#111' }}>{currentPrice.toLocaleString()} ₽</span>
          {hasDiscount ? (
            <span style={{ fontSize: '13px', color: '#aaa', textDecoration: 'line-through', marginBottom: '2px' }}>{p.price.toLocaleString()} ₽</span>
          ) : null}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666', marginBottom: '15px', minHeight: '20px' }}>
          {hasReviews ? (
            <>
              <StarIcon width="14" height="14" fill="#ff9900" />
              <span style={{ fontWeight: 'bold', color: '#ff9900' }}>{p.avg_rating}/5</span>
              <span>({p.review_count} отз.)</span>
            </>
          ) : (
            <span style={{ color: '#aaa' }}>Нет отзывов</span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {role !== 'admin' && (
            <button onClick={() => addToCart(p)} style={{ flex: 1, padding: '10px', background: '#7A0000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CartAddIcon width="22" height="22" fill="white" />
            </button>
          )}
          {/* Кнопка сравнения */}
          {role !== 'admin' && toggleCompare && (
            <button 
              onClick={() => toggleCompare(p)} 
              title={isCompared ? 'Убрать из сравнения' : 'Сравнить'}
              style={{ 
                padding: '10px', 
                background: isCompared ? '#007bff' : 'white', 
                color: isCompared ? 'white' : '#666',
                border: isCompared ? '2px solid #007bff' : '2px solid #eee', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
            >
              <FiColumns size={20} />
            </button>
          )}
          {role !== 'admin' && token && (
            <button onClick={() => toggleWishlist(p)} style={{ background: 'white', border: '2px solid #eee', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {isWished ? (
                <HeartFilledIcon width="22" height="22" fill="#7A0000" />
              ) : (
                <HeartOutlineIcon width="22" height="22" fill="#ccc" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;