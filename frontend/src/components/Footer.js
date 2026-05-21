import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Хохлома-орнамент для футера
import khokhlomaFooter from '../assets/khokhloma-footer.png';

const CATEGORIES = [
  'Процессоры',
  'Видеокарты',
  'Материнские платы',
  'Оперативная память',
  'SSD-накопители',
  'SSD',
];

const Footer = ({ token }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate(`/?category=${encodeURIComponent(category)}`);
  };

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const customerLinks = [
    { label: 'Доставка и оплата', to: '/info?tab=delivery' },
    { label: 'Гарантия и возврат', to: '/info?tab=warranty' },
    { label: 'Промокоды и акции', to: '/info?tab=promo' },
  ];

  if (token) {
    customerLinks.push(
      { label: 'Мои заказы', to: '/profile' },
      { label: 'Избранное', to: '/profile' }
    );
  }

  return (
    <footer style={{
      background: '#0B0B0B',
      color: '#999',
      padding: '0',
      marginTop: 'auto',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Декоративный орнамент — фон футера */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <img src={khokhlomaFooter} alt="" style={{ height: '160px', opacity: 0.08, objectFit: 'contain', marginBottom: '-10px', marginLeft: '-20px' }} />
        <img src={khokhlomaFooter} alt="" style={{ height: '160px', opacity: 0.08, objectFit: 'contain', transform: 'scaleX(-1)', marginBottom: '-10px', marginRight: '-20px' }} />
      </div>

      {/* Верхняя часть — колонки */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '50px 40px 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Логотип + описание */}
        <div>
          <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '900', letterSpacing: '1px', marginBottom: '16px' }}>
            СБОРКА
          </h2>
          <p style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>
            Интернет-магазин компьютерных комплектующих. Российские и зарубежные бренды по лучшим ценам.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['VK', 'TG', 'YT'].map((name) => (
              <a
                key={name}
                href="#"
                onClick={handleLinkClick}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#7A0000'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#7A0000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#333'; }}
              >
                {name}
              </a>
            ))}
          </div>
        </div>

        {/* Каталог — кликабельные категории */}
        <div>
          <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
            Каталог
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {CATEGORIES.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => handleCategoryClick(cat)}
                  style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'none', fontSize: '14px', cursor: 'pointer', padding: 0, transition: 'color 0.2s', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = '#888'}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Покупателям */}
        <div>
          <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
            Покупателям
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {customerLinks.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={handleLinkClick}
                  style={{ color: '#888', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = '#888'}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Контакты */}
        <div>
          <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
            Контакты
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
            <div>
              <div style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Телефон</div>
              <a href="tel:+78001234567" style={{ color: 'white', textDecoration: 'none', fontWeight: '600', fontSize: '16px' }}>
                8 (800) 123-45-67
              </a>
            </div>
            <div>
              <div style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Email</div>
              <a href="mailto:info@sborka.ru" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = '#888'}
              >
                info@sborka.ru
              </a>
            </div>
            <div>
              <div style={{ color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Режим работы</div>
              <span style={{ color: '#888' }}>Пн-Пт: 9:00 – 21:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Разделитель */}
      <div style={{ borderTop: '1px solid #1a1a1a', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }} />

      {/* Нижняя часть — копирайт */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        position: 'relative',
        zIndex: 1,
      }}>
        <span style={{ fontSize: '13px' }}>
          © {new Date().getFullYear()} СБОРКА — Все права защищены
        </span>
        <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
          <Link to="/privacy" onClick={handleLinkClick} style={{ color: '#666', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = '#666'}
          >
            Политика конфиденциальности
          </Link>
          <Link to="/terms" onClick={handleLinkClick} style={{ color: '#666', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = '#666'}
          >
            Пользовательское соглашение
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
