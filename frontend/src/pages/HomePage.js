import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { FiSearch } from 'react-icons/fi';

// Хохлома-орнамент для баннера
import khokhlomaBanner from '../assets/khokhloma-banner.png';

// ИМПОРТ ВСЕХ ИКОНОК КАТЕГОРИЙ
import { ReactComponent as CpuIcon } from '../assets/icons/category-cpu.svg';
import { ReactComponent as GpuIcon } from '../assets/icons/category-gpu.svg';
import { ReactComponent as MbIcon } from '../assets/icons/category-motherboard.svg';
import { ReactComponent as MonitorIcon } from '../assets/icons/category-monitor.svg';
import { ReactComponent as KeyboardIcon } from '../assets/icons/category-keyboard.svg';
import { ReactComponent as MouseIcon } from '../assets/icons/category-mouse.svg';
import { ReactComponent as CaseIcon } from '../assets/icons/category-case.svg';
import { ReactComponent as RamIcon } from '../assets/icons/category-ram.svg';
import { ReactComponent as SsdIcon } from '../assets/icons/category-ssd.svg';
import { ReactComponent as DefaultIcon } from '../assets/icons/category-default.svg';

const getCategoryIcon = (categoryName) => {
  const props = { width: "40", height: "40", fill: "#111" };
  const icons = {
    'Процессоры': <CpuIcon {...props} />,
    'Видеокарты': <GpuIcon {...props} />,
    'Материнские платы': <MbIcon {...props} />,
    'Игровые мониторы': <MonitorIcon {...props} />,
    'Мониторы': <MonitorIcon {...props} />,
    'Клавиатуры': <KeyboardIcon {...props} />,
    'Периферия': <KeyboardIcon {...props} />,
    'Мыши': <MouseIcon {...props} />,
    'Корпуса': <CaseIcon {...props} />,
    'Оперативная память': <RamIcon {...props} />,
    'Память': <RamIcon {...props} />,
    'SSD': <SsdIcon {...props} />,
    'Накопители': <SsdIcon {...props} />
  };
  return icons[categoryName] || <DefaultIcon {...props} />;
};


const HomePage = ({ products, searchQuery, role, token, wishlist, toggleWishlist, addToCart, compareList, toggleCompare, loading }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || '';

  const [filterRussian, setFilterRussian] = useState(false);
  const [filterCategory, setFilterCategory] = useState(urlCategory);
  const [filterBrand, setFilterBrand] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const itemsPerPage = 12;

  // Синхронизируем фильтр категории с URL-параметром
  useEffect(() => {
    setFilterCategory(urlCategory);
    setCurrentPage(1);
  }, [urlCategory]);

  // Товары со скидкой для баннера
  const discountProducts = products.filter(p => p.discount_percent && p.discount_percent > 0);

  // Автопрокрутка баннера
  useEffect(() => {
    if (discountProducts.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % discountProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [discountProducts.length]);

  // === ДИНАМИЧЕСКИЕ КАТЕГОРИИ И БРЕНДЫ ===
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  // Вычисляем мин/макс цены
  useEffect(() => {
    if (products.length === 0) return;
    const prices = products.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    setPriceMin(min);
    setPriceMax(max);
    setPriceRange([min, max]);
  }, [products]);

  // Сброс страницы при поиске или фильтрации
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterRussian, filterCategory, filterBrand, sortOrder, priceRange]);

  let filtered = products.filter(p => {
    if (filterRussian && !p.is_russian) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterBrand && p.brand !== filterBrand) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    return true;
  });

  if (sortOrder === 'asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortOrder === 'desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortOrder === 'rating') filtered.sort((a, b) => (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0));

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const bannerProduct = discountProducts[bannerIdx];

  return (
    <div>
      {/* === БАННЕР-СЛАЙДЕР === */}
      {discountProducts.length > 0 && bannerProduct && (
        <div style={{ background: 'linear-gradient(135deg, #0B0B0B 0%, #1a1a2e 100%)', color: 'white', padding: '30px 30px', borderRadius: '12px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '30px', minHeight: '180px', overflow: 'hidden', position: 'relative' }}>
          {/* Декоративный орнамент справа */}
          <img 
            src={khokhlomaBanner} 
            alt="" 
            style={{ 
              position: 'absolute', 
              right: '-20px', 
              bottom: '-20px', 
              height: '220px', 
              opacity: 0.12, 
              pointerEvents: 'none',
              transform: 'rotate(-10deg)',
            }} 
          />
          <div key={bannerIdx} className="banner-slide" style={{ display: 'flex', alignItems: 'center', gap: '30px', width: '100%' }}>
            <div style={{ width: '140px', height: '140px', flexShrink: 0, background: 'rgba(255,255,255,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
              {bannerProduct.images && bannerProduct.images[0] ? (
                <img src={bannerProduct.images[0]} alt={bannerProduct.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : <span style={{ color: '#555' }}>Нет фото</span>}
            </div>
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-block', background: '#7A0000', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>
                Скидка -{bannerProduct.discount_percent}%
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '700' }}>{bannerProduct.name}</h2>
              <p style={{ margin: '0 0 15px 0', color: '#aaa', fontSize: '14px' }}>{bannerProduct.short_description || bannerProduct.category}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '28px', fontWeight: '900' }}>{Math.floor(bannerProduct.price - (bannerProduct.price * bannerProduct.discount_percent / 100)).toLocaleString()} ₽</span>
                <s style={{ color: '#666', fontSize: '16px' }}>{bannerProduct.price.toLocaleString()} ₽</s>
              </div>
            </div>
          </div>
          {/* Индикаторы */}
          {discountProducts.length > 1 && (
            <div style={{ position: 'absolute', bottom: '12px', right: '20px', display: 'flex', gap: '6px', zIndex: 2 }}>
              {discountProducts.map((_, i) => (
                <div key={i} onClick={() => setBannerIdx(i)} style={{ width: i === bannerIdx ? '20px' : '8px', height: '8px', borderRadius: '4px', background: i === bannerIdx ? '#7A0000' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        
        {/* Боковая панель фильтров */}
        <div style={{ flex: '1 1 250px', maxWidth: '300px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0 }}>Фильтры</h3>
          <label style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}>
            <input type="checkbox" checked={filterRussian} onChange={e => setFilterRussian(e.target.checked)} style={{ marginRight: '10px' }} />
            <strong>Только РФ 🇷🇺</strong>
          </label>
          
          <h4 style={{ marginBottom: '10px' }}>Сортировка</h4>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <option value="">По умолчанию</option>
            <option value="asc">Сначала дешевые</option>
            <option value="desc">Сначала дорогие</option>
            <option value="rating">Сначала с высоким рейтингом</option>
          </select>

          {/* === ФИЛЬТР ПО ЦЕНЕ === */}
          {priceMax > priceMin && (
            <>
              <h4 style={{ marginBottom: '10px' }}>Цена</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                <span>{priceRange[0].toLocaleString()} ₽</span>
                <span>{priceRange[1].toLocaleString()} ₽</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888' }}>От:</label>
                <input
                  type="range"
                  className="price-range-track"
                  min={priceMin}
                  max={priceMax}
                  value={priceRange[0]}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setPriceRange([Math.min(val, priceRange[1] - 1000), priceRange[1]]);
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#888' }}>До:</label>
                <input
                  type="range"
                  className="price-range-track"
                  min={priceMin}
                  max={priceMax}
                  value={priceRange[1]}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setPriceRange([priceRange[0], Math.max(val, priceRange[0] + 1000)]);
                  }}
                />
              </div>
            </>
          )}
          
          <h4 style={{ marginBottom: '10px' }}>Категория</h4>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <option value="">Все</option>
            {uniqueCategories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
          
          <h4 style={{ marginBottom: '10px' }}>Бренд</h4>
          <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <option value="">Все</option>
            {uniqueBrands.map((brand, i) => (
              <option key={i} value={brand}>{brand}</option>
            ))}
          </select>
          
          <button onClick={() => { setFilterRussian(false); setFilterCategory(''); setFilterBrand(''); setSortOrder(''); if (priceMax > 0) setPriceRange([priceMin, priceMax]); }} style={{ width: '100%', marginTop: '20px', padding: '10px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Сбросить
          </button>
        </div>

        {/* Витрина товаров */}
        <div style={{ flex: '3 1 600px', minWidth: 0 }}>
          {uniqueCategories.length > 0 && (
            <>
              <h3 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '700' }}>Категории:</h3>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '30px' }}>
                {uniqueCategories.map((cat, i) => (
                  <div key={i} onClick={() => setFilterCategory(cat)} style={{ minWidth: '150px', height: '120px', background: 'white', borderRadius: '12px', border: filterCategory === cat ? '2px solid #7A0000' : '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <span style={{ fontSize: '35px', marginBottom: '10px' }}>{getCategoryIcon(cat)}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', textAlign: 'center', padding: '0 10px' }}>{cat}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px' }}>Возможно вам понравится</h3>
          
          {/* СКЕЛЕТОНЫ при загрузке */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {paginated.map((p, i) => (
                  <div key={p.id} className="card-animate" style={{ animationDelay: `${i * 0.06}s`, height: '100%' }}>
                    <ProductCard p={p} role={role} token={token} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} compareList={compareList} toggleCompare={toggleCompare} />
                  </div>
                ))}
              </div>
          
              {/* ПУСТОЕ СОСТОЯНИЕ */}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <FiSearch size={64} color="#ccc" style={{ marginBottom: '15px' }} />
                  <h3 style={{ color: '#555', marginBottom: '10px' }}>Ничего не найдено</h3>
                  <p style={{ color: '#999', marginBottom: '25px' }}>Попробуйте изменить фильтры или сбросить поиск</p>
                  <button onClick={() => { setFilterRussian(false); setFilterCategory(''); setFilterBrand(''); setSortOrder(''); if (priceMax > 0) setPriceRange([priceMin, priceMax]); }} style={{ padding: '12px 30px', background: '#7A0000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </>
          )}
          
          {totalPages > 1 && (
             <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
               <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Назад</button>
               <span style={{ padding: '10px 20px', fontWeight: 'bold' }}>Стр. {currentPage} из {totalPages}</span>
               <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>Вперед</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;