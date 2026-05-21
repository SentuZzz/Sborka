import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiColumns, FiCheckCircle, FiXCircle } from 'react-icons/fi';

// ИМПОРТ SVG ИКОНОК
import { ReactComponent as CartAddIcon } from '../assets/icons/cart-add.svg';
import { ReactComponent as HeartFilledIcon } from '../assets/icons/heart-filled.svg';
import { ReactComponent as HeartOutlineIcon } from '../assets/icons/heart-outline.svg';
import { ReactComponent as StarIcon } from '../assets/icons/star-filled.svg';
import { ReactComponent as EditIcon } from '../assets/icons/edit.svg';
import { ReactComponent as TrashIcon } from '../assets/icons/trash.svg';

const ProductPage = ({ cart, addToCart, role, token, username, wishlist, toggleWishlist, compareList, toggleCompare }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Стейты для редактирования товара админом
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Стейты для редактирования отзывов админом
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);

  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => { setProduct(res.data); setCurrentImageIdx(0); })
      .catch(() => toast.error('Товар не найден!'));
    axios.get(`http://localhost:5000/api/products/${id}/reviews`)
      .then(res => setReviews(res.data));
  }, [id]);

  if (!product) return (
    <div style={{ padding: '40px', background: 'white', borderRadius: '12px', marginTop: '20px' }}>
      <div className="skeleton-box" style={{ height: '14px', width: '200px', marginBottom: '30px' }} />
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div className="skeleton-box" style={{ height: '400px', borderRadius: '12px' }} />
        </div>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div className="skeleton-box" style={{ height: '20px', width: '120px', marginBottom: '15px' }} />
          <div className="skeleton-box" style={{ height: '32px', width: '80%', marginBottom: '15px' }} />
          <div className="skeleton-box" style={{ height: '16px', width: '60%', marginBottom: '30px' }} />
          <div className="skeleton-box" style={{ height: '36px', width: '50%', marginBottom: '15px' }} />
          <div className="skeleton-box" style={{ height: '50px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );

  const specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : (product.specs || {});
  const isWished = wishlist.some(w => w.id === product.id);

  // ЛОГИКА СКИДОК
  const hasDiscount = Boolean(product.discount_percent && product.discount_percent > 0);
  const currentPrice = hasDiscount 
    ? Math.floor(product.price - (product.price * product.discount_percent / 100))
    : product.price;

  const stockCount = product.stock_count !== undefined ? Number(product.stock_count) : null;
  const outOfStock = stockCount !== null && stockCount <= 0;
  const isCompared = compareList ? compareList.some(c => c.id === product.id) : false;

  // ФУНКЦИИ АДМИНА
  const startEditingProduct = () => {
    setEditForm({ 
      ...product, 
      images: product.images ? product.images.join(', ') : '', 
      specs: product.specs ? JSON.stringify(product.specs) : '' 
    });
    setIsEditingProduct(true);
  };

  const handleProductSave = async (e) => {
    e.preventDefault();
    let parsed = {}; 
    try { parsed = editForm.specs ? JSON.parse(editForm.specs) : {}; } 
    catch (e) { return toast.error('Ошибка в формате JSON (Характеристики)'); }
    
    const payload = { 
      ...editForm, 
      price: Number(editForm.price), 
      images: typeof editForm.images === 'string' ? editForm.images.split(',').map(s => s.trim()).filter(Boolean) : editForm.images, 
      specs: parsed 
    };

    try {
      const res = await axios.put(`http://localhost:5000/api/products/${id}`, payload, authConfig);
      setProduct(res.data); 
      setIsEditingProduct(false); 
      toast.success('Товар обновлен!');
    } catch (e) { 
      toast.error(e.response?.data?.error || 'Ошибка при обновлении товара'); 
    }
  };

  const deleteReview = async (reviewId) => {
    if (window.confirm('Точно удалить этот отзыв?')) {
      try {
        await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, authConfig);
        setReviews(reviews.filter(r => r.id !== reviewId)); 
        toast.success('Отзыв удален');
      } catch (e) { toast.error('Ошибка удаления'); }
    }
  };

  const saveReview = async (reviewId) => {
    try {
      await axios.put(`http://localhost:5000/api/reviews/${reviewId}`, { comment: editReviewText, rating: editReviewRating }, authConfig);
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, comment: editReviewText, rating: editReviewRating } : r));
      setEditingReviewId(null); 
      toast.success('Отзыв обновлен');
    } catch (e) { toast.error('Ошибка сохранения'); }
  };

  return (
    <div style={{ padding: '40px', background: 'white', borderRadius: '12px', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <Link to="/" style={{ color: '#7A0000', textDecoration: 'none' }}>Главная</Link> / {product.category || 'Каталог'} / {product.name}
        </div>
        {role === 'admin' && !isEditingProduct && (
          <button onClick={startEditingProduct} style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EditIcon width="16" height="16" fill="white" /> Редактировать товар
          </button>
        )}
      </div>

      {isEditingProduct && (
        <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '2px dashed #007bff' }}>
          <h3 style={{ marginTop: 0, color: '#007bff' }}>Редактирование товара</h3>
          <form onSubmit={handleProductSave} style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <input placeholder="Название" value={editForm.name} required onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', flex: 2 }} />
              <input type="number" placeholder="Цена" value={editForm.price} required onChange={e => setEditForm({ ...editForm, price: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', flex: 1 }} />
            </div>
            <textarea placeholder="Полное описание" value={editForm.full_description} rows="4" onChange={e => setEditForm({ ...editForm, full_description: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} />
            <input placeholder="Ссылки на картинки через запятую" value={editForm.images} onChange={e => setEditForm({ ...editForm, images: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }} />
            <textarea placeholder='Характеристики в формате JSON' value={editForm.specs} rows="3" onChange={e => setEditForm({ ...editForm, specs: e.target.value })} style={{ padding: '12px', fontFamily: 'monospace', border: '1px solid #ddd', borderRadius: '6px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Сохранить</button>
              <button type="button" onClick={() => setIsEditingProduct(false)} style={{ padding: '15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Отмена</button>
            </div>
          </form>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
          <div style={{ height: '400px', background: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', marginBottom: '15px', position: 'relative' }}>
            
            {hasDiscount && (
              <div style={{ position: 'absolute', top: 15, left: 15, background: '#7A0000', color: 'white', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 'bold', zIndex: 10 }}>
                -{product.discount_percent}%
              </div>
            )}

            {token && role !== 'admin' && (
              <button onClick={() => toggleWishlist(product)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10, display: 'flex' }}>
                {isWished ? <HeartFilledIcon width="28" height="28" fill="#7A0000" /> : <HeartOutlineIcon width="28" height="28" fill="#aaa" />}
              </button>
            )}

            {product.images && product.images.length > 0 ? (
              <img src={product.images[currentImageIdx]} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ color: '#aaa' }}>Нет фото</div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {product.images.map((img, idx) => (
                <div key={idx} onClick={() => setCurrentImageIdx(idx)} style={{ width: '80px', height: '80px', flexShrink: 0, border: currentImageIdx === idx ? '2px solid #7A0000' : '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', padding: '5px', background: 'white', opacity: currentImageIdx === idx ? 1 : 0.6 }}>
                  <img src={img} alt={`Миниатюра ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ flex: '1', minWidth: '300px' }}>
          {product.is_russian && <span style={{ background: '#27ae60', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Отечественный</span>}
          <h1 style={{ marginTop: '15px', fontSize: '32px', fontWeight: '800' }}>{product.name}</h1>
          <p style={{ color: '#555', fontSize: '16px' }}>Артикул: {product.sku || product.id} | Бренд: <strong>{product.brand || '-'}</strong></p>
          
          <div style={{ background: '#fff', padding: '20px 0', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
              <h2 style={{ fontSize: '36px', margin: '0', fontWeight: '900', color: '#111' }}>{currentPrice} руб.</h2>
              {hasDiscount && <s style={{ fontSize: '20px', color: '#999', marginBottom: '5px' }}>{product.price} руб.</s>}
            </div>

             {/* Stock count */}
            {stockCount !== null && (
              <div style={{ marginTop: '15px', padding: '12px', background: outOfStock ? '#fff5f5' : '#f0fff4', borderRadius: '8px', border: `1px solid ${outOfStock ? '#fecaca' : '#bbf7d0'}` }}>
                {outOfStock ? (
                  <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiXCircle size={16} /> Нет в наличии</span>
                ) : (
                  <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiCheckCircle size={16} /> В наличии: {stockCount} шт.
                    {stockCount <= 5 && <span style={{ color: '#ea580c', marginLeft: '8px' }}>(Мало!)</span>}
                  </span>
                )}
              </div>
            )}

            {role !== 'admin' && (
              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button 
                  onClick={() => !outOfStock && addToCart(product)} 
                  disabled={outOfStock}
                  style={{ 
                    flex: 1, padding: '15px', 
                    background: outOfStock ? '#ccc' : '#7A0000', 
                    color: 'white', border: 'none', borderRadius: '8px', 
                    fontSize: '18px', fontWeight: 'bold', 
                    cursor: outOfStock ? 'not-allowed' : 'pointer', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                    opacity: outOfStock ? 0.6 : 1
                  }}
                >
                  <CartAddIcon width="22" height="22" fill="white" /> {outOfStock ? 'Нет в наличии' : 'В корзину'}
                </button>
                {toggleCompare && (
                  <button
                    onClick={() => toggleCompare(product)}
                    title={isCompared ? 'Убрать из сравнения' : 'Сравнить'}
                    style={{ 
                      padding: '15px 20px', 
                      background: isCompared ? '#007bff' : 'white', 
                      color: isCompared ? 'white' : '#333',
                      border: isCompared ? '2px solid #007bff' : '2px solid #eee', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontSize: '20px',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontWeight: 'bold', transition: 'all 0.2s'
                    }}
                  >
                    <FiColumns size={22} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
        <h2>Описание и Характеристики</h2>
        <p style={{ lineHeight: '1.6', color: '#333' }}>{product.full_description || product.short_description || 'Нет описания.'}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', maxWidth: '800px' }}>
          <tbody>
            {Object.keys(specs).map((key, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '12px 0', color: '#666', width: '40%' }}>{key}</td>
                <td style={{ padding: '12px 0', fontWeight: 'bold' }}>{specs[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
        <h2>Отзывы ({reviews.length})</h2>
        {token && role !== 'admin' ? (
          <form onSubmit={e => {
            e.preventDefault();
            axios.post(`http://localhost:5000/api/products/${id}/reviews`, { rating: Number(rating), comment }, authConfig)
              .then(() => {
                setReviews([{ username, rating: Number(rating), comment, created_at: new Date() }, ...reviews]);
                setComment('');
                toast.success('Отзыв добавлен!');
              }).catch(() => toast.error('Ошибка при добавлении отзыва'));
          }} style={{ marginBottom: '30px', padding: '20px', background: '#fafafa', borderRadius: '8px', border: '1px solid #eee' }}>
            <select value={rating} onChange={e => setRating(e.target.value)} style={{ padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' }}>
              <option value="5">5 звезд</option><option value="4">4 звезды</option><option value="3">3 звезды</option><option value="2">2 звезды</option><option value="1">1 звезда</option>
            </select><br/>
            <textarea value={comment} onChange={e => setComment(e.target.value)} required placeholder="Ваш отзыв" style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' }} rows="3"></textarea>
            <button type="submit" style={{ padding: '12px 25px', background: '#7A0000', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>Отправить</button>
          </form>
        ) : !token ? <p>Войдите, чтобы оставить отзыв.</p> : null}
        
        {reviews.map((r, i) => (
          <div key={i} style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            {editingReviewId === r.id ? (
              <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
                <select value={editReviewRating} onChange={e => setEditReviewRating(e.target.value)} style={{ marginBottom: '10px' }}><option value="5">5 звезд</option><option value="4">4 звезды</option><option value="3">3 звезды</option><option value="2">2 звезды</option><option value="1">1 звезда</option></select><br/>
                <textarea value={editReviewText} onChange={e => setEditReviewText(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} rows="3"></textarea>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => saveReview(r.id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Сохранить</button>
                  <button onClick={() => setEditingReviewId(null)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Отмена</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong>{r.username}</strong>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(Number(r.rating))].map((_, idx) => <StarIcon key={idx} width="14" height="14" fill="#ff9900" />)}
                  </div>
                </div>
                <p style={{ margin: '10px 0', fontSize: '15px' }}>{r.comment}</p>
                <span style={{ fontSize: '12px', color: '#aaa' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                
                {role === 'admin' && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setEditingReviewId(r.id); setEditReviewText(r.comment); setEditReviewRating(r.rating); }} style={{ background: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <EditIcon width="12" height="12" fill="#111" /> Изменить
                    </button>
                    <button onClick={() => deleteReview(r.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <TrashIcon width="12" height="12" fill="white" /> Удалить
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;