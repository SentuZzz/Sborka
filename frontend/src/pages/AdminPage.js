import React, { useState, useRef } from 'react';
import { FiEdit3, FiPlusCircle, FiShoppingBag, FiPackage, FiChevronDown, FiChevronUp, FiLock, FiGrid, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { ReactComponent as EditIcon } from '../assets/icons/edit.svg';
import { ReactComponent as TrashIcon } from '../assets/icons/trash.svg';
import { ReactComponent as CheckIcon } from '../assets/icons/check.svg';
import { ReactComponent as CloseIcon } from '../assets/icons/close.svg';

// Граф допустимых переходов (совпадает с бэкендом)
const TRANSITIONS = {
  'Новый':        ['В обработке', 'Отменен'],
  'В обработке':  ['Доставляется', 'Отменен'],
  'Доставляется': ['Доставлен',    'Отменен'],
  'Доставлен':    [],
  'Отменен':      [],
};
const STATUS_COLORS = {
  'Новый':        { bg: '#dbeafe', color: '#1d4ed8' },
  'В обработке':  { bg: '#fef3c7', color: '#d97706' },
  'Доставляется': { bg: '#e0f2fe', color: '#0369a1' },
  'Доставлен':    { bg: '#dcfce7', color: '#16a34a' },
  'Отменен':      { bg: '#fee2e2', color: '#dc2626' },
};

const AdminPage = ({ role, analytics, editingId, setEditingId, handleFileUpload, handleSubmitProduct, form, setForm, emptyForm, products, categories, handleAddCategory, handleDeleteCategory, handleEditClick, handleDeleteProduct, handleAssignDiscount, orders, setOrders, authConfig, refreshAdminData }) => {
  const [discountPromptId, setDiscountPromptId] = useState(null);
  const [discountVal, setDiscountVal] = useState('');
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'categories'
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [newCatName, setNewCatName] = useState('');

  if (role !== 'admin') return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Доступ закрыт</h2>;

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatusId(orderId);
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus }, authConfig);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      // Обновляем аналитику если статус влияет на выручку
      if (refreshAdminData) refreshAdminData();
    } catch (e) {
      alert('Ошибка обновления статуса');
    }
    setUpdatingStatusId(null);
  };

  const tabStyle = (tab) => ({
    padding: '10px 22px',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #7A0000' : '3px solid transparent',
    background: 'none',
    fontWeight: activeTab === tab ? '800' : '500',
    color: activeTab === tab ? '#7A0000' : '#666',
    fontSize: '15px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  });

  return (
    <div className="admin-page">
      {analytics && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', background: '#111', color: 'white', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '14px', opacity: 0.8, marginBottom: '10px' }}>Выручка</h3>
            <h2 style={{ fontSize: '32px', margin: 0 }}>{Number(analytics.revenue).toLocaleString()} ₽</h2>
          </div>
          <div style={{ flex: '1 1 200px', background: '#7A0000', color: 'white', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '14px', opacity: 0.8, marginBottom: '10px' }}>Заказов</h3>
            <h2 style={{ fontSize: '32px', margin: 0 }}>{analytics.ordersCount} шт.</h2>
          </div>
          <div style={{ flex: '1 1 200px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>Топ товаров</h3>
            {analytics.popular?.slice(0, 3).map((p, i) => (
              <div key={i} style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>
                <strong>{i + 1}.</strong> {p.product_name} <span style={{ color: '#888' }}>× {p.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Вкладки */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5', marginBottom: '25px', background: 'white', borderRadius: '12px 12px 0 0', padding: '0 20px' }}>
        <button style={tabStyle('products')} onClick={() => setActiveTab('products')}>
          <FiPackage size={16} /> Товары ({products.length})
        </button>
        <button style={tabStyle('categories')} onClick={() => setActiveTab('categories')}>
          <FiGrid size={16} /> Категории ({categories?.length || 0})
        </button>
        <button style={tabStyle('orders')} onClick={() => setActiveTab('orders')}>
          <FiShoppingBag size={16} /> Заказы ({orders.length})
        </button>
      </div>

      {/* ═══ ВКЛАДКА: ТОВАРЫ ═══ */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* ФОРМА ДОБАВЛЕНИЯ / РЕДАКТИРОВАНИЯ */}
          <div style={{ flex: '1 1 350px', background: 'white', padding: '30px', borderRadius: '12px', position: 'sticky', top: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: editingId ? '#007bff' : '#333', marginBottom: '20px', fontSize: '20px' }}>
              {editingId ? <><FiEdit3 size={18} style={{ verticalAlign: 'text-bottom' }} /> Редактирование</> : <><FiPlusCircle size={18} style={{ verticalAlign: 'text-bottom' }} /> Добавление товара</>}
            </h2>
            
            <div style={{ marginBottom: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '13px' }}>Загрузить основное фото:</label>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ fontSize: '12px' }} />
            </div>
            
            <form onSubmit={handleSubmitProduct} style={{ display: 'grid', gap: '12px' }}>
              <input placeholder="Название товара" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input type="number" placeholder="Базовая цена" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', flex: '1 1 100px', fontSize: '14px' }} />
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', flex: '1 1 100px', fontSize: '14px', background: 'white' }}>
                  <option value="">Выберите категорию</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input placeholder="Бренд" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', flex: '1 1 100px', fontSize: '14px' }} />
                <label style={{ display: 'flex', alignItems: 'center', flex: '1 1 80px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_russian} onChange={e => setForm({ ...form, is_russian: e.target.checked })} style={{ marginRight: '8px' }} /> РФ
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input type="number" placeholder="Количество в наличии" min="0" value={form.stock_count} onChange={e => setForm({ ...form, stock_count: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', flex: '1 1 100px', fontSize: '14px' }} />
                <input placeholder="SKU (артикул)" value={form.sku || ''} onChange={e => setForm({ ...form, sku: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', flex: '1 1 100px', fontSize: '14px' }} />
              </div>

              <input placeholder="Ссылки на картинки через запятую" value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              <textarea placeholder="Краткое описание для карточки" value={form.short_description} rows="2" onChange={e => setForm({ ...form, short_description: e.target.value })} style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />
              <textarea placeholder='Характеристики в JSON: {"Сокет": "AM4"}' value={form.specs} rows="3" onChange={e => setForm({ ...form, specs: e.target.value })} style={{ padding: '12px', fontFamily: 'monospace', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px' }} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: editingId ? '#007bff' : '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingId ? 'Сохранить' : 'Создать товар'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ padding: '14px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>
          
          {/* ТАБЛИЦА ТОВАРОВ */}
          <div style={{ flex: '2 1 500px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Управление товарами ({products.length})</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '12px 8px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>ID</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Название</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Цена</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Наличие</th>
                  <th style={{ padding: '12px 8px', fontSize: '12px', color: '#888', textTransform: 'uppercase', textAlign: 'right' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 8px', color: '#bbb', fontSize: '13px' }}>#{p.id}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <Link to={`/product/${p.id}`} style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>{p.name}</Link>
                      {p.is_russian && <span style={{ background: '#111', color: 'white', padding: '2px 5px', borderRadius: '3px', fontSize: '10px', marginLeft: '6px', fontWeight: 'bold' }}>RU</span>}
                    </td>
                    <td style={{ padding: '12px 8px', whiteSpace: 'nowrap', fontSize: '14px' }}>
                      {p.price.toLocaleString()} ₽ 
                      {p.discount_percent > 0 && <span style={{ color: '#C41E3A', fontSize: '12px', marginLeft: '6px', fontWeight: 'bold' }}>(-{p.discount_percent}%)</span>}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
                        background: p.stock_count === 0 ? '#fee2e2' : p.stock_count < 5 ? '#fef3c7' : '#dcfce7',
                        color: p.stock_count === 0 ? '#dc2626' : p.stock_count < 5 ? '#d97706' : '#16a34a' }}>
                        {p.stock_count === 0 ? 'Нет' : `${p.stock_count} шт.`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* СКИДКА */}
                        {discountPromptId === p.id ? (
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input type="number" min="0" max="99" value={discountVal} onChange={e => setDiscountVal(e.target.value)} placeholder="%" style={{ width: '45px', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontSize: '12px' }} />
                            <button onClick={() => { handleAssignDiscount(p.id, Number(discountVal)); setDiscountPromptId(null); }} style={{ background: '#28a745', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}>
                              <CheckIcon width="14" height="14" fill="white" />
                            </button>
                            <button onClick={() => setDiscountPromptId(null)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}>
                              <CloseIcon width="14" height="14" fill="white" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setDiscountPromptId(p.id); setDiscountVal(p.discount_percent || ''); }} style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '7px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', whiteSpace: 'nowrap' }}>
                            {p.discount_percent > 0 ? `${p.discount_percent}%` : '% Скидка'}
                          </button>
                        )}
                        <button onClick={() => handleEditClick(p)} style={{ background: '#ffc107', border: 'none', padding: '7px 10px', borderRadius: '4px', cursor: 'pointer', color: '#111', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <EditIcon width="13" height="13" fill="#111" /> Изменить
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '7px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <TrashIcon width="13" height="13" fill="white" /> Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ ВКЛАДКА: КАТЕГОРИИ ═══ */}
      {activeTab === 'categories' && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Управление категориями</h2>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <input 
              placeholder="Название новой категории" 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)} 
              style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', flex: 1, fontSize: '14px' }} 
            />
            <button 
              onClick={() => { if(newCatName.trim()) { handleAddCategory(newCatName); setNewCatName(''); } }}
              style={{ padding: '12px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Добавить
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                <span style={{ fontWeight: '600' }}>{cat.name}</span>
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', display: 'flex' }}
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ВКЛАДКА: ЗАКАЗЫ ═══ */}
      {activeTab === 'orders' && (
        <div style={{ background: 'white', borderRadius: '0 0 12px 12px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Управление заказами ({orders.length})</h2>
          
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#bbb', fontSize: '16px' }}>
              Заказов пока нет
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map(order => {
                const statusStyle = STATUS_COLORS[order.status] || { bg: '#f5f5f5', color: '#666' };
                const isExpanded = expandedOrderId === order.id;
                return (
                  <div key={order.id} style={{ border: '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden' }}>
                    {/* Заголовок заказа */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: '#fafafa', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: '#111', minWidth: '60px' }}>
                        #{order.id}
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>Покупатель</div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{order.username}</div>
                      </div>
                      <div style={{ flex: '1 1 100px' }}>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>Сумма</div>
                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#7A0000' }}>{Number(order.total_price).toLocaleString()} ₽</div>
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>Дата</div>
                        <div style={{ fontSize: '13px' }}>{new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div style={{ flex: '1 1 180px' }}>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Статус</div>
                        {/* Текущий статус */}
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                          background: statusStyle.bg, color: statusStyle.color, marginBottom: '6px',
                        }}>
                          {(TRANSITIONS[order.status] || []).length === 0 && <FiLock size={11} />}
                          {order.status}
                        </span>
                        {/* Следующий шаг: показываем только допустимые переходы */}
                        {(TRANSITIONS[order.status] || []).length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {(TRANSITIONS[order.status] || []).map(nextStatus => {
                              const ns = STATUS_COLORS[nextStatus] || { bg: '#f5f5f5', color: '#333' };
                              const isCancelBtn = nextStatus === 'Отменен';
                              return (
                                <button
                                  key={nextStatus}
                                  disabled={updatingStatusId === order.id}
                                  onClick={() => handleStatusChange(order.id, nextStatus)}
                                  style={{
                                    padding: '4px 10px', borderRadius: '14px', border: 'none',
                                    background: isCancelBtn ? '#fee2e2' : ns.bg,
                                    color: isCancelBtn ? '#dc2626' : ns.color,
                                    fontWeight: '700', fontSize: '11px', cursor: 'pointer',
                                    opacity: updatingStatusId === order.id ? 0.6 : 1,
                                    transition: 'opacity 0.2s',
                                  }}
                                >
                                  {nextStatus}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        style={{ background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555' }}
                      >
                        {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                        {isExpanded ? 'Свернуть' : 'Состав'}
                      </button>
                    </div>

                    {/* Состав заказа (accordion) */}
                    {isExpanded && (
                      <div style={{ padding: '16px 20px', borderTop: '1px solid #eee' }}>
                        {order.phone && (
                          <div style={{ marginBottom: '10px', fontSize: '13px', color: '#555' }}>
                            <strong>Телефон:</strong> {order.phone} &nbsp;|&nbsp;
                            <strong>Адрес:</strong> {order.delivery_address || '—'}
                            {order.promo_applied && <> &nbsp;|&nbsp; <strong>Промокод:</strong> <span style={{ color: '#7A0000', fontWeight: '700' }}>{order.promo_applied}</span></>}
                          </div>
                        )}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                              <th style={{ padding: '8px', textAlign: 'left', color: '#888', fontWeight: '600' }}>Товар</th>
                              <th style={{ padding: '8px', textAlign: 'right', color: '#888', fontWeight: '600' }}>Цена</th>
                              <th style={{ padding: '8px', textAlign: 'right', color: '#888', fontWeight: '600' }}>Кол-во</th>
                              <th style={{ padding: '8px', textAlign: 'right', color: '#888', fontWeight: '600' }}>Итого</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.items || []).map((item, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <td style={{ padding: '8px', fontWeight: '600' }}>{item.product_name}</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>{Number(item.price).toLocaleString()} ₽</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>× {item.quantity}</td>
                                <td style={{ padding: '8px', textAlign: 'right', fontWeight: '700', color: '#7A0000' }}>{(item.price * item.quantity).toLocaleString()} ₽</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;