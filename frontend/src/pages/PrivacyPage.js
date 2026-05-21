import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const PrivacyPage = () => {
  return (
    <div>
      {/* Хлебные крошки */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px', fontSize: '14px', color: '#888' }}>
        <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Главная</Link>
        <FiChevronRight size={12} />
        <span style={{ color: '#333' }}>Политика конфиденциальности</span>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '40px 50px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', maxWidth: '900px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginTop: 0, marginBottom: '10px', color: '#111' }}>
          Политика конфиденциальности
        </h1>
        <p style={{ color: '#999', fontSize: '13px', marginBottom: '30px' }}>
          Последнее обновление: {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div style={{ color: '#444', lineHeight: '1.9', fontSize: '15px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginTop: '30px', marginBottom: '12px' }}>1. Общие положения</h2>
          <p>
            Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты персональных данных 
            пользователей интернет-магазина «СБОРКА» (далее — «Магазин»), расположенного по адресу sborka.ru.
          </p>
          <p>
            Используя сайт Магазина и предоставляя свои персональные данные, Пользователь выражает согласие с условиями настоящей Политики.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginTop: '30px', marginBottom: '12px' }}>2. Какие данные мы собираем</h2>
          <p>При регистрации и оформлении заказов мы можем запрашивать следующие данные:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li><strong>Логин (имя пользователя)</strong> — для идентификации учётной записи</li>
            <li><strong>Пароль</strong> — хранится исключительно в зашифрованном виде (bcrypt-хэш). Мы никогда не видим и не храним ваш пароль в открытом виде</li>
            <li><strong>Номер телефона</strong> — для связи по вопросам доставки</li>
            <li><strong>Адрес доставки</strong> — для отправки заказа</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginTop: '30px', marginBottom: '12px' }}>3. Цели обработки данных</h2>
          <p>Персональные данные используются исключительно для:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li>Оформления и доставки заказов</li>
            <li>Связи с покупателем по вопросам заказа</li>
            <li>Отображения истории заказов в личном кабинете</li>
            <li>Улучшения качества обслуживания</li>
          </ul>
          <p>
            Мы <strong>не передаём</strong> персональные данные третьим лицам, за исключением транспортных компаний (СДЭК, Почта России) 
            в объёме, необходимом для доставки заказа.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginTop: '30px', marginBottom: '12px' }}>4. Защита данных</h2>
          <p>
            Для защиты персональных данных применяются следующие меры:
          </p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li>Пароли хранятся в виде bcrypt-хэшей и не подлежат дешифровке</li>
            <li>Авторизация осуществляется через JWT-токены с ограниченным сроком действия</li>
            <li>Доступ к базе данных ограничен и защищён</li>
            <li>Платёжные данные (номера карт) не сохраняются на нашем сервере — оплата происходит через защищённый шлюз платёжной системы</li>
          </ul>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginTop: '30px', marginBottom: '12px' }}>5. Cookies и аналитика</h2>
          <p>
            Сайт использует localStorage браузера для хранения корзины покупок и настроек пользователя. 
            Эти данные хранятся только на устройстве пользователя и не передаются на сервер.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginTop: '30px', marginBottom: '12px' }}>6. Удаление данных</h2>
          <p>
            Вы можете запросить полное удаление своей учётной записи и всех связанных данных, обратившись по электронной почте: 
            <a href="mailto:info@sborka.ru" style={{ color: '#7A0000', fontWeight: '600' }}> info@sborka.ru</a>.
          </p>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginTop: '30px', marginBottom: '12px' }}>7. Контактная информация</h2>
          <p>
            По вопросам, связанным с обработкой персональных данных, обращайтесь:<br />
            Email: <a href="mailto:info@sborka.ru" style={{ color: '#7A0000' }}>info@sborka.ru</a><br />
            Телефон: <a href="tel:+78001234567" style={{ color: '#7A0000' }}>8 (800) 123-45-67</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
