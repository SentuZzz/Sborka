import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiTruck, FiCreditCard, FiShield, FiRotateCcw, FiTag, FiCopy, FiCheck, FiChevronRight } from 'react-icons/fi';

const tabs = [
  { id: 'delivery', label: 'Доставка и оплата', icon: FiTruck },
  { id: 'warranty', label: 'Гарантия и возврат', icon: FiShield },
  { id: 'promo', label: 'Промокоды и акции', icon: FiTag },
];

const InfoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'delivery';
  const [copied, setCopied] = useState(false);

  const setTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const copyPromo = () => {
    navigator.clipboard.writeText('RUSSIA10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Хлебные крошки */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px', fontSize: '14px', color: '#888' }}>
        <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Главная</Link>
        <FiChevronRight size={12} />
        <span style={{ color: '#333' }}>Информация</span>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Боковые вкладки */}
        <div style={{ flex: '0 0 260px' }}>
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '16px 20px',
                    border: 'none',
                    borderLeft: isActive ? '4px solid #7A0000' : '4px solid transparent',
                    background: isActive ? '#fdf5f5' : 'white',
                    color: isActive ? '#7A0000' : '#333',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Контент */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '35px 40px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

            {/* ===== ДОСТАВКА И ОПЛАТА ===== */}
            {activeTab === 'delivery' && (
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginTop: 0, marginBottom: '30px', color: '#111' }}>
                  Доставка и оплата
                </h1>

                {/* Доставка */}
                <div style={{ marginBottom: '35px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f0fff4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiTruck size={22} color="#16a34a" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Доставка</h2>
                  </div>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ padding: '20px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                      <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px', color: '#111' }}>Курьером по Москве</div>
                      <p style={{ margin: 0, color: '#555', lineHeight: '1.7', fontSize: '15px' }}>
                        Доставка в течение <strong>1-2 рабочих дней</strong>. Бесплатно при заказе от <strong>50 000 ₽</strong>, 
                        при меньшей сумме — 500 ₽. Курьер привезёт заказ до двери и подождёт, пока вы проверите комплектацию.
                      </p>
                    </div>
                    <div style={{ padding: '20px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                      <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px', color: '#111' }}>СДЭК / Почта России</div>
                      <p style={{ margin: 0, color: '#555', lineHeight: '1.7', fontSize: '15px' }}>
                        Доставка в регионы за <strong>3-7 рабочих дней</strong>. Стоимость рассчитывается по тарифам 
                        транспортной компании при оформлении заказа. Все отправления страхуются на полную стоимость.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Оплата */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiCreditCard size={22} color="#2563eb" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Оплата</h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {[
                      { title: 'Картой онлайн', desc: 'Visa, MasterCard, МИР. Безопасная оплата через защищённый шлюз.' },
                      { title: 'СБП (Система быстрых платежей)', desc: 'Моментальная оплата по QR-коду через мобильный банк.' },
                      { title: 'Наличными курьеру', desc: 'Оплатите при получении заказа. Только для доставки по Москве.' },
                      { title: 'Безналичный расчёт (B2B)', desc: 'Выставим счёт для юридических лиц. Работаем с НДС.' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '20px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                        <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px', color: '#111' }}>{item.title}</div>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== ГАРАНТИЯ И ВОЗВРАТ ===== */}
            {activeTab === 'warranty' && (
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginTop: 0, marginBottom: '30px', color: '#111' }}>
                  Гарантия и возврат
                </h1>

                {/* Гарантия */}
                <div style={{ marginBottom: '35px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiShield size={22} color="#2563eb" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Гарантия</h2>
                  </div>

                  <div style={{ padding: '24px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0', marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 12px 0', color: '#333', lineHeight: '1.8', fontSize: '15px' }}>
                      На все товары действует гарантия производителя — от <strong>12 до 36 месяцев</strong> в зависимости от категории 
                      и бренда. Для товаров параллельного импорта гарантийное обслуживание осуществляется нашим магазином.
                    </p>
                    <p style={{ margin: 0, color: '#555', lineHeight: '1.8', fontSize: '15px' }}>
                      Если у вас сгорела видеокарта, вышел из строя SSD или процессор перестал стартовать — свяжитесь с нами, 
                      и мы подскажем, куда обратиться для гарантийного ремонта или замены. В большинстве случаев мы берём 
                      это на себя и решаем вопрос за 5-14 рабочих дней.
                    </p>
                  </div>
                </div>

                {/* Возврат */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiRotateCcw size={22} color="#d97706" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Возврат</h2>
                  </div>

                  <div style={{ padding: '24px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0', marginBottom: '16px' }}>
                    <p style={{ margin: '0 0 12px 0', color: '#333', lineHeight: '1.8', fontSize: '15px' }}>
                      Вы можете вернуть товар надлежащего качества в течение <strong>14 дней</strong> с момента получения, 
                      при условии сохранения товарного вида, упаковки и всех пломб. Товар не должен быть во вскрытой упаковке.
                    </p>
                  </div>

                  <div style={{ padding: '20px', background: '#fff5f5', borderRadius: '10px', border: '1px solid #fecaca' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '10px', color: '#dc2626' }}>Не подлежат возврату:</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', lineHeight: '1.8', fontSize: '14px' }}>
                      <li>Товары со следами механических повреждений (гнутые ножки на процессорах и материнских платах)</li>
                      <li>Товары со вскрытой или нарушенной заводской термопастой</li>
                      <li>Товары с нарушенными гарантийными пломбами и стикерами</li>
                      <li>Программное обеспечение с активированной лицензией</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ПРОМОКОДЫ И АКЦИИ ===== */}
            {activeTab === 'promo' && (
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginTop: 0, marginBottom: '30px', color: '#111' }}>
                  Промокоды и акции
                </h1>

                {/* Как применить промокод */}
                <div style={{ marginBottom: '35px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Как применить промокод?</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                      { step: '1', text: 'Добавьте нужные товары в корзину' },
                      { step: '2', text: 'Перейдите на страницу корзины' },
                      { step: '3', text: 'Введите промокод в поле «Промокод» и нажмите «Применить»' },
                      { step: '4', text: 'Скидка автоматически применится к итоговой сумме' },
                    ].map((item) => (
                      <div key={item.step} style={{ padding: '20px', background: '#fafafa', borderRadius: '10px', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#7A0000', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', marginBottom: '12px' }}>
                          {item.step}
                        </div>
                        <p style={{ margin: 0, color: '#555', fontSize: '14px', lineHeight: '1.6' }}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Активный промокод */}
                <div style={{ marginBottom: '35px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Активный промокод</h2>
                  <div style={{ 
                    padding: '28px', 
                    background: 'linear-gradient(135deg, #0B0B0B, #1a1a2e)', 
                    borderRadius: '14px', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '20px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Скидка 10% на весь заказ</div>
                      <div style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '4px', fontFamily: 'monospace' }}>RUSSIA10</div>
                    </div>
                    <button 
                      onClick={copyPromo}
                      style={{ 
                        padding: '14px 28px', 
                        background: copied ? '#16a34a' : '#7A0000', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontWeight: '700',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background 0.3s',
                      }}
                    >
                      {copied ? <><FiCheck size={18} /> Скопировано!</> : <><FiCopy size={18} /> Скопировать</>}
                    </button>
                  </div>
                </div>

                {/* Условия */}
                <div style={{ padding: '20px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '10px', color: '#92400e' }}>Условия использования</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350f', lineHeight: '1.8', fontSize: '14px' }}>
                    <li>Скидка по промокоду применяется к <strong>итоговой сумме заказа</strong>, а не к отдельным товарам</li>
                    <li>Скидки по промокодам <strong>не суммируются</strong> с уже действующими скидками на карточке товара — применяется наибольшая из двух</li>
                    <li>Один промокод можно использовать неограниченное количество раз</li>
                    <li>Магазин оставляет за собой право изменить или отменить промокод в любое время</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
