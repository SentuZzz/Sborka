import React, { useState, useEffect } from 'react';
import axios from 'axios';
import bgImage from '../assets/icons/background.png';

const API = 'http://localhost:5000';

// Режимы: 'login' | 'register' | 'verify' | 'forgot' | 'forgot_verify'
const AuthModal = ({ isOpen, onClose, onLogin, onRegister, authName, setAuthName, authPassword, setAuthPassword }) => {
  const [mode, setMode] = useState('login');

  // Поля регистрации
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');

  // Восстановление пароля
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setMode('login');
      setError('');
      setSuccess('');
      setEmail('');
      setConfirmPassword('');
      setCode('');
      setForgotEmail('');
      setForgotCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setCountdown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  if (!isOpen) return null;

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ── Отправка кода на email при регистрации ──
  const handleSendRegisterCode = async () => {
    clearMessages();
    if (!authName || authName.length < 3) return setError('Логин: минимум 3 символа');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Укажите корректный email');
    if (!authPassword || authPassword.length < 6) return setError('Пароль: минимум 6 символов');
    if (authPassword !== confirmPassword) return setError('Пароли не совпадают');

    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/send-code`, { email, type: 'register' });
      setSuccess('Код отправлен на почту! Проверьте входящие (и спам).');
      setMode('verify');
      setCountdown(60);
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка отправки кода');
    }
    setLoading(false);
  };

  // ── Финальная регистрация с кодом ──
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!code || code.length !== 6) return setError('Введите 6-значный код из письма');
    setLoading(true);
    try {
      await axios.post(`${API}/api/register`, {
        username: authName,
        password: authPassword,
        confirmPassword,
        email,
        code,
      });
      setSuccess('Регистрация успешна! Теперь войдите.');
      setTimeout(() => { setMode('login'); setSuccess(''); }, 1500);
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка регистрации');
    }
    setLoading(false);
  };

  // ── Отправка кода сброса пароля ──
  const handleSendResetCode = async () => {
    clearMessages();
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) return setError('Укажите корректный email');
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/send-code`, { email: forgotEmail, type: 'reset' });
      setSuccess('Код отправлен на почту!');
      setMode('forgot_verify');
      setCountdown(60);
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка отправки кода');
    }
    setLoading(false);
  };

  // ── Подтверждение сброса пароля ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!forgotCode || forgotCode.length !== 6) return setError('Введите 6-значный код');
    if (!newPassword || newPassword.length < 6) return setError('Пароль: минимум 6 символов');
    if (newPassword !== confirmNewPassword) return setError('Пароли не совпадают');
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/reset-password/confirm`, {
        email: forgotEmail,
        code: forgotCode,
        newPassword,
      });
      setSuccess('Пароль успешно изменён! Войдите с новым паролем.');
      setTimeout(() => { setMode('login'); setSuccess(''); }, 2000);
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка сброса пароля');
    }
    setLoading(false);
  };

  const inputStyle = {
    background: '#e8e8e8', border: 'none', padding: '13px 16px', borderRadius: '8px',
    marginBottom: '14px', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: '#555', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const btnPrimary = { background: '#0B0B0B', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', width: '100%', marginBottom: '10px', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1 };
  const btnSecondary = { background: 'transparent', color: '#555', padding: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', width: '100%', textDecoration: 'underline' };

  const titles = {
    login: 'Вход',
    register: 'Регистрация',
    verify: 'Подтверждение',
    forgot: 'Восстановление',
    forgot_verify: 'Новый пароль',
  };

  return (
    <div
      className="modal-overlay-animate"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      onClick={onClose}
    >
      <div
        className="modal-content-animate"
        style={{ display: 'flex', width: '680px', minHeight: '420px', background: '#FDFBF7', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Левая панель — форма */}
        <div style={{ flex: 1, padding: '40px 36px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <h2 style={{ marginTop: 0, marginBottom: '6px', fontSize: '26px', fontWeight: '800', color: '#111' }}>
            {titles[mode]}
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#888' }}>
            {mode === 'login' && 'Войдите по логину или email'}
            {mode === 'register' && 'Создайте аккаунт в СБОРКЕ'}
            {mode === 'verify' && `Введите код, отправленный на ${email}`}
            {mode === 'forgot' && 'Введите email для получения кода'}
            {mode === 'forgot_verify' && `Введите код из письма на ${forgotEmail}`}
          </p>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', fontWeight: '600' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', fontWeight: '600' }}>
              {success}
            </div>
          )}

          {/* ── ВХОД ── */}
          {mode === 'login' && (
            <form onSubmit={onLogin} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Логин или Email</label>
              <input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="username или email@mail.ru" style={inputStyle} />
              <label style={labelStyle}>Пароль</label>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <button type="submit" style={btnPrimary} disabled={loading}>Войти</button>
              <div style={{ textAlign: 'center', color: '#bbb', fontSize: '12px', margin: '4px 0 10px' }}>или</div>
              <button type="button" onClick={() => { clearMessages(); setMode('register'); }} style={{ ...btnPrimary, background: '#7A0000' }}>Зарегистрироваться</button>
              <button type="button" onClick={() => { clearMessages(); setMode('forgot'); }} style={btnSecondary}>Забыли пароль?</button>
            </form>
          )}

          {/* ── РЕГИСТРАЦИЯ ── */}
          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Логин (имя пользователя)</label>
              <input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="minumum 3 символа" style={inputStyle} />
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.ru" style={inputStyle} />
              <label style={labelStyle}>Пароль</label>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="Минимум 6 символов" style={inputStyle} />
              <label style={labelStyle}>Повторите пароль</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Повторите пароль" style={inputStyle} />
              <button type="button" onClick={handleSendRegisterCode} style={btnPrimary} disabled={loading}>
                {loading ? 'Отправка...' : 'Получить код подтверждения'}
              </button>
              <button type="button" onClick={() => { clearMessages(); setMode('login'); }} style={btnSecondary}>Уже есть аккаунт? Войти</button>
            </div>
          )}

          {/* ── ВВОД КОДА РЕГИСТРАЦИИ ── */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Код из письма (6 цифр)</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                style={{ ...inputStyle, fontSize: '28px', letterSpacing: '10px', textAlign: 'center', fontWeight: 'bold' }}
              />
              <button type="submit" style={btnPrimary} disabled={loading}>
                {loading ? 'Проверка...' : 'Завершить регистрацию'}
              </button>
              {countdown > 0 ? (
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', margin: '8px 0' }}>
                  Повторная отправка через {countdown} сек.
                </p>
              ) : (
                <button type="button" onClick={handleSendRegisterCode} style={btnSecondary} disabled={loading}>
                  Отправить код повторно
                </button>
              )}
              <button type="button" onClick={() => { clearMessages(); setMode('register'); }} style={btnSecondary}>
                Назад
              </button>
            </form>
          )}

          {/* ── ВОССТАНОВЛЕНИЕ: ввод EMAIL ── */}
          {mode === 'forgot' && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Email от аккаунта</label>
              <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.ru" style={inputStyle} />
              <button type="button" onClick={handleSendResetCode} style={btnPrimary} disabled={loading}>
                {loading ? 'Отправка...' : 'Получить код сброса'}
              </button>
              <button type="button" onClick={() => { clearMessages(); setMode('login'); }} style={btnSecondary}>Назад</button>
            </div>
          )}

          {/* ── ВОССТАНОВЛЕНИЕ: код + новый пароль ── */}
          {mode === 'forgot_verify' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={labelStyle}>Код из письма (6 цифр)</label>
              <input
                value={forgotCode}
                onChange={e => setForgotCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                style={{ ...inputStyle, fontSize: '28px', letterSpacing: '10px', textAlign: 'center', fontWeight: 'bold' }}
              />
              <label style={labelStyle}>Новый пароль</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Минимум 6 символов" style={inputStyle} />
              <label style={labelStyle}>Повторите новый пароль</label>
              <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Повторите пароль" style={inputStyle} />
              <button type="submit" style={btnPrimary} disabled={loading}>
                {loading ? 'Сохранение...' : 'Установить новый пароль'}
              </button>
              {countdown > 0 ? (
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', margin: '8px 0' }}>
                  Повторная отправка через {countdown} сек.
                </p>
              ) : (
                <button type="button" onClick={handleSendResetCode} style={btnSecondary} disabled={loading}>
                  Отправить код повторно
                </button>
              )}
              <button type="button" onClick={() => { clearMessages(); setMode('forgot'); }} style={btnSecondary}>Назад</button>
            </form>
          )}
        </div>

        {/* Правая панель — декоративная */}
        <div style={{ width: '220px', background: `url(${bgImage}) center/cover`, borderLeft: '4px solid #C41E3A', flexShrink: 0 }} />
      </div>
    </div>
  );
};

export default AuthModal;