const express = require('express'), cors = require('cors'), { Pool } = require('pg'), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken'), multer = require('multer'), fs = require('fs'), path = require('path'), nodemailer = require('nodemailer');
const app = express(); app.use(cors()); app.use(express.json());
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const upload = multer({ storage: multer.diskStorage({ destination: (req, file, cb) => cb(null, 'uploads/'), filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) }) });
app.use('/uploads', express.static('uploads'));
const pool = new Pool({ connectionString: process.env.DATABASE_URL }), SECRET_KEY = 'super-secret-key-pcforge';

// ===== NODEMAILER =====
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.yandex.ru';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');

let transporter = null;
if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  console.log('[SMTP] Nodemailer configured with', SMTP_USER);
} else {
  console.log('[SMTP] No SMTP credentials — codes will be logged to console (dev mode)');
}

const sendEmail = async (to, subject, html) => {
  if (transporter) {
    await transporter.sendMail({ from: `"СБОРКА" <${SMTP_USER}>`, to, subject, html });
    console.log(`[SMTP] Email sent to ${to}: ${subject}`);
  } else {
    console.log(`[DEV-EMAIL] To: ${to} | Subject: ${subject} | Body: ${html}`);
  }
};

const authenticateToken = (req, res, next) => { const token = req.headers['authorization']?.split(' ')[1]; if (!token) return res.status(401).json({ error: 'Нет токена' }); jwt.verify(token, SECRET_KEY, (err, user) => { if (err) return res.status(403).json({ error: 'Неверный токен' }); req.user = user; next(); }); };
const isAdmin = (req, res, next) => { authenticateToken(req, res, () => { if (req.user.role !== 'admin') return res.status(403).json({ error: 'Отказ' }); next(); }); };

const initDB = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, price INTEGER NOT NULL, is_russian BOOLEAN DEFAULT false, category VARCHAR(100), brand VARCHAR(100), short_description TEXT, full_description TEXT, specs JSONB DEFAULT '{}', images TEXT[] DEFAULT '{}', stock_count INTEGER DEFAULT 0, sku VARCHAR(50) UNIQUE);`);
    const cols=["ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100)","ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100)","ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT","ALTER TABLE products ADD COLUMN IF NOT EXISTS full_description TEXT","ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'","ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'","ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 0","ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(50)"];for(let c of cols)await pool.query(c);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS old_price INTEGER;`);
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE, password VARCHAR(255), role VARCHAR(50) DEFAULT 'user', phone VARCHAR(50), address TEXT, email VARCHAR(255));`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, username VARCHAR(255), total_price INTEGER, status VARCHAR(50) DEFAULT 'Новый', delivery_address TEXT, phone VARCHAR(50), promo_applied VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_applied VARCHAR(50);`);
  
    await pool.query(`CREATE TABLE IF NOT EXISTS order_items (id SERIAL PRIMARY KEY, order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE, product_id INTEGER, product_name VARCHAR(255), price INTEGER, quantity INTEGER DEFAULT 1);`);
    await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;`);
    await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id INTEGER;`);
  
    await pool.query(`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, username VARCHAR(255), rating INTEGER CHECK (rating>=1 AND rating<=5), comment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    await pool.query(`CREATE TABLE IF NOT EXISTS wishlist (id SERIAL PRIMARY KEY, username VARCHAR(255), product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, UNIQUE(username, product_id));`);
    
    // Таблица категорий
    await pool.query(`CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL);`);
    const catCheck = await pool.query("SELECT COUNT(*) FROM categories");
    if (catCheck.rows[0].count === '0') {
      await pool.query("INSERT INTO categories (name) SELECT DISTINCT category FROM products WHERE category IS NOT NULL ON CONFLICT DO NOTHING");
    }

    // Таблица кодов подтверждения (регистрация + сброс пароля)
    await pool.query(`CREATE TABLE IF NOT EXISTS email_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(10) NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'register',
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    // Создаем админа
    const a = await pool.query("SELECT * FROM users WHERE username='admin'");
    if (a.rows.length === 0) {
      const h = await bcrypt.hash('admin123', 10);
      await pool.query("INSERT INTO users (username,password,role) VALUES ($1,$2,'admin')", ['admin', h]);
    }

    // === АВТОМАТИЧЕСКОЕ ЗАПОЛНЕНИЕ ТОВАРОВ ===
    const pCheck = await pool.query("SELECT COUNT(*) FROM products");
    if (pCheck.rows[0].count === '0') {
      console.log('База пуста! Начинаю автоматическую загрузку товаров...');
      
      const mockProducts = [
        {
          name: "Процессор Эльбрус-8СВ", price: 145000, is_russian: true, category: "Процессоры", brand: "МЦСТ",
          short: "Восьмиядерный процессор российской разработки на архитектуре VLIW.",
          full: "Эльбрус-8СВ — это высокопроизводительный процессор российской разработки. Предназначен для создания серверов и рабочих станций с повышенными требованиями к информационной безопасности. Отлично справляется с математическими вычислениями благодаря архитектуре VLIW.",
          specs: {"Архитектура": "Эльбрус (VLIW)", "Ядра": 8, "Частота": "1.5 ГГц", "Техпроцесс": "28 нм", "Тепловыделение (TDP)": "90 Вт"},
          images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Elbrus-8C_processor.jpg/800px-Elbrus-8C_processor.jpg"],
          stock_count: 12, sku: "ELB-8SV"
        },
        {
          name: "Процессор Baikal-M", price: 85000, is_russian: true, category: "Процессоры", brand: "Байкал",
          short: "Отечественный ARM-процессор для рабочих станций и моноблоков.",
          full: "Baikal-M (BE-M1000) — отечественная система на кристалле с восемью ядрами ARM Cortex-A57 и восьмиядерным графическим процессором Mali-T628. Отличный выбор для корпоративных устройств.",
          specs: {"Архитектура": "ARMv8-A", "Ядра": 8, "Частота": "1.5 ГГц", "Графика": "Mali-T628 MP8", "Техпроцесс": "28 нм"},
          images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Baikal-M_SoC.jpg/800px-Baikal-M_SoC.jpg"],
          stock_count: 45, sku: "BKL-M1000"
        },
        {
          name: "Видеокарта NVIDIA GeForce RTX 4090", price: 220000, is_russian: false, category: "Видеокарты", brand: "NVIDIA",
          short: "Флагманская видеокарта для бескомпромиссного гейминга в 4K.",
          full: "NVIDIA GeForce RTX 4090 — это невероятно мощная видеокарта серии GeForce. Она обеспечивает колоссальный скачок в производительности, эффективности и графике на базе ИИ с технологией DLSS 3. Идеальна для рендеринга и тяжелых игр.",
          specs: {"Видеопамять": "24 ГБ GDDR6X", "Шина памяти": "384 бит", "Ядра CUDA": 16384, "Рекомендуемый БП": "850 Вт"},
          images: ["https://images.unsplash.com/photo-1692291942036-7c0507a8fc06?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80"],
          stock_count: 5, sku: "NV-RTX4090"
        },
        {
          name: "Процессор Intel Core i9-14900K", price: 68000, is_russian: false, category: "Процессоры", brand: "Intel",
          short: "24-ядерный монстр для игр и создания контента.",
          full: "Процессор Intel Core i9-14900K 14-го поколения обеспечивает невероятную частоту до 6.0 ГГц из коробки. Гибридная архитектура Performance-core и Efficient-core оптимизирует вашу работу и игры.",
          specs: {"Сокет": "LGA 1700", "Ядра": "24 (8P + 16E)", "Потоки": 32, "Базовая частота": "3.2 ГГц", "Макс. частота": "6.0 ГГц"},
          images: ["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80"],
          stock_count: 23, sku: "INT-I9-14900K"
        },
        {
          name: "Материнская плата GIGABYTE X670E AORUS MASTER", price: 45000, is_russian: false, category: "Материнские платы", brand: "GIGABYTE",
          short: "Топовая материнская плата для процессоров AMD Ryzen 7000.",
          full: "Плата формата E-ATX с невероятной системой питания (16+2+2 фазы), поддержкой PCIe 5.0 для видеокарты и SSD, а также мощными радиаторами для экстремального разгона.",
          specs: {"Сокет": "AM5", "Чипсет": "AMD X670E", "Тип памяти": "DDR5", "Форм-фактор": "E-ATX"},
          images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"],
          stock_count: 18, sku: "GIG-X670E-AORUS"
        },
        {
          name: "Оперативная память Kingston FURY Beast DDR5-6000 32GB", price: 15000, is_russian: false, category: "Оперативная память", brand: "Kingston",
          short: "Высокоскоростная DDR5 память с RGB-подсветкой.",
          full: "Kingston FURY Beast DDR5 — это высокоскоростные модули памяти нового поколения с частотой 6000 МГц. Низкие задержки CL36 и оптимизация под платформу Intel XMP 3.0 и AMD EXPO обеспечивают максимальную производительность.",
          specs: {"Тип": "DDR5", "Объем": "32 ГБ (2x16)", "Частота": "6000 МГц", "Тайминги": "CL36"},
          images: ["https://images.unsplash.com/photo-1562976540-1502c2145851?auto=format&fit=crop&w=800&q=80"],
          stock_count: 67, sku: "KS-FURY-DDR5-32"
        },
        {
          name: "SSD Samsung 990 Pro 2TB NVMe", price: 18000, is_russian: false, category: "SSD", brand: "Samsung",
          short: "Скоростной NVMe SSD нового поколения PCIe 4.0.",
          full: "Samsung 990 Pro — это профессиональный NVMe SSD следующего поколения. Скорость последовательного чтения до 7450 МБ/с делает его идеальным для работы с большими файлами, игр и профессионального контента.",
          specs: {"Интерфейс": "PCIe 4.0 x4 NVMe", "Объем": "2 ТБ", "Чтение": "7450 МБ/с", "Запись": "6900 МБ/с"},
          images: ["https://images.unsplash.com/photo-1604754742629-3e5728249d73?auto=format&fit=crop&w=800&q=80"],
          stock_count: 34, sku: "SAM-990PRO-2TB"
        },
        {
          name: "Видеокарта AMD Radeon RX 7900 XTX", price: 115000, is_russian: false, category: "Видеокарты", brand: "AMD",
          short: "Флагман AMD с 24 ГБ памяти для игр в 4K.",
          full: "AMD Radeon RX 7900 XTX — топовая видеокарта нового поколения на архитектуре RDNA 3. Обеспечивает исключительную производительность в играх при разрешении 4K благодаря 24 ГБ видеопамяти GDDR6.",
          specs: {"Видеопамять": "24 ГБ GDDR6", "Шина памяти": "384 бит", "Потоковые процессоры": 6144, "Рекомендуемый БП": "800 Вт"},
          images: ["https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80"],
          stock_count: 8, sku: "AMD-RX7900XTX"
        },
      ];

      for (const p of mockProducts) {
        await pool.query(
          `INSERT INTO products (name,price,is_russian,category,brand,short_description,full_description,specs,images,stock_count,sku) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [p.name, p.price, p.is_russian, p.category, p.brand, p.short, p.full, JSON.stringify(p.specs), p.images, p.stock_count, p.sku]
        );
      }
      console.log(`Загружено ${mockProducts.length} товаров`);
    }
  } catch (err) { 
    console.error('DB Error:', err); 
  }
}; initDB();

app.post('/api/upload', isAdmin, upload.single('image'), (req, res) => { if (!req.file) return res.status(400).json({ error: 'Нет файла' }); res.json({ imageUrl: `http://localhost:5000/uploads/${req.file.filename}` }); });
app.get('/api/products', async (req, res) => { 
  try { 
    const { page, limit = 12, search, category, brand, sort, russian } = req.query;
    
    let conditions = [];
    let params = [];
    let paramIdx = 1;
    
    if (search) { conditions.push(`p.name ILIKE $${paramIdx}`); params.push(`%${search}%`); paramIdx++; }
    if (category) { conditions.push(`p.category = $${paramIdx}`); params.push(category); paramIdx++; }
    if (brand) { conditions.push(`p.brand = $${paramIdx}`); params.push(brand); paramIdx++; }
    if (russian === 'true') { conditions.push(`p.is_russian = true`); }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    let orderClause = 'ORDER BY p.id ASC';
    if (sort === 'asc') orderClause = 'ORDER BY p.price ASC';
    else if (sort === 'desc') orderClause = 'ORDER BY p.price DESC';
    else if (sort === 'rating') orderClause = 'ORDER BY avg_rating DESC';
    
    const baseQuery = `
      SELECT p.*, 
             COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating, 
             COUNT(r.id) as review_count 
      FROM products p 
      LEFT JOIN reviews r ON p.id = r.product_id 
      ${whereClause}
      GROUP BY p.id 
      ${orderClause}
    `;
    
    if (page) {
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;
      
      const countQuery = `SELECT COUNT(DISTINCT p.id) as total FROM products p ${whereClause}`;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);
      
      const dataQuery = `${baseQuery} LIMIT ${limitNum} OFFSET ${offset}`;
      const dataResult = await pool.query(dataQuery, params);
      
      res.json({ data: dataResult.rows, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    } else {
      res.json((await pool.query(baseQuery, params)).rows);
    }
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  } 
});
app.get('/api/products/:id', async (req, res) => { try { const r = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]); if (r.rows.length === 0) return res.status(404).json({ error: 'Нет' }); res.json(r.rows[0]); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/products/:id/reviews', async (req, res) => { try { res.json((await pool.query('SELECT * FROM reviews WHERE product_id=$1 ORDER BY created_at DESC', [req.params.id])).rows); } catch (e) { res.status(500).json({ error: e.message }); } });
app.post('/api/products/:id/reviews', authenticateToken, async (req, res) => { 
  const { rating, comment } = req.body;
  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Рейтинг: 1-5' });
  }
  if (comment && (typeof comment !== 'string' || comment.length > 1000)) {
    return res.status(400).json({ error: 'Комментарий: до 1000 символов' });
  }
  try { 
    await pool.query('INSERT INTO reviews (product_id,username,rating,comment) VALUES ($1,$2,$3,$4)', [req.params.id, req.user.username, rating, comment || null]); 
    res.json({ message: 'OK' }); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  } 
});
app.put('/api/reviews/:id', isAdmin, async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || isNaN(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Рейтинг: 1-5' });
  if (comment && (typeof comment !== 'string' || comment.length > 1000)) return res.status(400).json({ error: 'Комментарий: до 1000 символов' });
  try {
    await pool.query('UPDATE reviews SET rating=$1, comment=$2 WHERE id=$3', [rating, comment || null, req.params.id]);
    res.json({ message: 'OK' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete('/api/reviews/:id', isAdmin, async (req, res) => { await pool.query('DELETE FROM reviews WHERE id=$1', [req.params.id]); res.json({ message: 'OK' }); });

// ТОВАРЫ CRUD
app.post('/api/products', isAdmin, async (req, res) => {
  const { name, price, old_price, is_russian, category, brand, short_description, full_description, specs, images, stock_count, sku } = req.body;
  if (!name || typeof name !== 'string' || name.length < 1 || name.length > 255) return res.status(400).json({ error: 'Название: 1-255 символов' });
  if (!price || isNaN(price) || price <= 0 || price > 10000000) return res.status(400).json({ error: 'Цена: положительное число до 10M' });
  if (old_price && (isNaN(old_price) || old_price <= 0)) return res.status(400).json({ error: 'Старая цена: положительное число' });
  if (category && (typeof category !== 'string' || category.length > 100)) return res.status(400).json({ error: 'Категория: до 100 символов' });
  if (brand && (typeof brand !== 'string' || brand.length > 100)) return res.status(400).json({ error: 'Бренд: до 100 символов' });
  if (specs && typeof specs !== 'object') return res.status(400).json({ error: 'Specs должен быть объектом' }); 
  if (images && !Array.isArray(images)) return res.status(400).json({ error: 'Images: массив строк' });
  if (stock_count !== undefined && (isNaN(stock_count) || stock_count < 0)) return res.status(400).json({ error: 'Stock: неотрицательное число' });
  if (sku && (typeof sku !== 'string' || sku.length > 50)) return res.status(400).json({ error: 'SKU: до 50 символов' });
  
  try {
    const r = await pool.query(`INSERT INTO products (name,price,old_price,is_russian,category,brand,short_description,full_description,specs,images,stock_count,sku) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`, 
      [name, price, old_price || null, is_russian || false, category || null, brand || null, short_description || null, full_description || null, specs || {}, images || [], stock_count || 0, sku || null]
    ); 
    res.json(r.rows[0]); 
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/products/:id', isAdmin, async (req, res) => { 
  const { name, price, old_price, is_russian, category, brand, short_description, full_description, specs, images, stock_count, sku } = req.body;
  
  if (!name || typeof name !== 'string' || name.length < 1 || name.length > 255) return res.status(400).json({ error: 'Название: 1-255 символов' });
  if (!price || isNaN(price) || price <= 0 || price > 10000000) return res.status(400).json({ error: 'Цена: положительное число до 10M' });
  if (old_price && (isNaN(old_price) || old_price <= 0)) return res.status(400).json({ error: 'Старая цена: положительное число' });
  if (category && (typeof category !== 'string' || category.length > 100)) return res.status(400).json({ error: 'Категория: до 100 символов' });
  if (brand && (typeof brand !== 'string' || brand.length > 100)) return res.status(400).json({ error: 'Бренд: до 100 символов' });
  if (specs && typeof specs !== 'object') return res.status(400).json({ error: 'Specs должен быть объектом' }); 
  if (images && !Array.isArray(images)) return res.status(400).json({ error: 'Images: массив строк' });
  if (stock_count !== undefined && (isNaN(stock_count) || stock_count < 0)) return res.status(400).json({ error: 'Stock: неотрицательное число' });
  if (sku && (typeof sku !== 'string' || sku.length > 50)) return res.status(400).json({ error: 'SKU: до 50 символов' });
  
  try {
    const r = await pool.query(`UPDATE products SET name=$1,price=$2,old_price=$3,is_russian=$4,category=$5,brand=$6,short_description=$7,full_description=$8,specs=$9,images=$10,stock_count=$11,sku=$12 WHERE id=$13 RETURNING *`, 
      [name, price, old_price || null, is_russian || false, category || null, brand || null, short_description || null, full_description || null, specs || {}, images || [], stock_count || 0, sku || null, req.params.id]
    ); 
    res.json(r.rows[0]); 
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete('/api/products/:id', isAdmin, async (req, res) => { await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]); res.json({ message: 'OK' }); });

// КАТЕГОРИИ
app.get('/api/categories', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM categories ORDER BY name ASC')).rows); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/categories', isAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.length < 1) return res.status(400).json({ error: 'Название категории обязательно' });
  try {
    const r = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
    res.json(r.rows[0]);
  } catch (e) { res.status(400).json({ error: 'Категория уже существует' }); }
});
app.delete('/api/categories/:id', isAdmin, async (req, res) => {
  try { await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]); res.json({ message: 'OK' }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ИЗБРАННОЕ
app.get('/api/wishlist', authenticateToken, async (req, res) => { const r = await pool.query('SELECT p.* FROM products p JOIN wishlist w ON p.id=w.product_id WHERE w.username=$1', [req.user.username]); res.json(r.rows); });
app.post('/api/wishlist/:id', authenticateToken, async (req, res) => { try { await pool.query('INSERT INTO wishlist (username,product_id) VALUES ($1,$2)', [req.user.username, req.params.id]); res.json({ msg: 'Added' }); } catch (e) { res.json({ msg: 'Already added' }); } });
app.delete('/api/wishlist/:id', authenticateToken, async (req, res) => { await pool.query('DELETE FROM wishlist WHERE username=$1 AND product_id=$2', [req.user.username, req.params.id]); res.json({ msg: 'Removed' }); });

// ПРОФИЛЬ
app.get('/api/profile', authenticateToken, async (req, res) => { const r = await pool.query('SELECT username,phone,address,email FROM users WHERE username=$1', [req.user.username]); res.json(r.rows[0]); });
app.put('/api/profile', authenticateToken, async (req, res) => { 
  const { phone, address } = req.body;
  if (phone && (typeof phone !== 'string' || phone.length > 50)) {
    return res.status(400).json({ error: 'Телефон: до 50 символов' });
  }
  if (address && (typeof address !== 'string' || address.length > 500)) {
    return res.status(400).json({ error: 'Адрес: до 500 символов' });
  }
  await pool.query('UPDATE users SET phone=$1,address=$2 WHERE username=$3', [phone || null, address || null, req.user.username]); 
  res.json({ msg: 'Обновлено' }); 
});

// ЗАКАЗЫ + ПРОМОКОД
app.post('/api/orders', authenticateToken, async (req, res) => { 
  const { items, promo, phone, address } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }
  for (const i of items) {
    if (!i.id || !i.name || !i.price || isNaN(i.price) || i.price <= 0 || !i.quantity || isNaN(i.quantity) || i.quantity <= 0) {
      return res.status(400).json({ error: 'Неверные товары в корзине' });
    }
  }
  if (promo && typeof promo !== 'string') {
    return res.status(400).json({ error: 'Промо: строка' });
  }
  if (!phone || typeof phone !== 'string' || phone.length > 50) {
    return res.status(400).json({ error: 'Телефон: до 50 символов' });
  }
  if (!address || typeof address !== 'string' || address.length > 500) {
    return res.status(400).json({ error: 'Адрес: до 500 символов' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Проверяем наличие по каждому товару с блокировкой строки (FOR UPDATE)
    const stockErrors = [];
    for (const item of items) {
      const prod = await client.query(
        'SELECT id, name, stock_count, price, discount_percent FROM products WHERE id=$1 FOR UPDATE',
        [item.id]
      );
      if (prod.rows.length === 0) {
        stockErrors.push(`Товар "${item.name}" больше не доступен`);
        continue;
      }
      const p = prod.rows[0];
      if (p.stock_count < item.quantity) {
        stockErrors.push(
          p.stock_count === 0
            ? `Товар "${p.name}" закончился — уберите его из корзины`
            : `Товар "${p.name}": запрошено ${item.quantity} шт., в наличии ${p.stock_count} шт.`
        );
      }
    }
    if (stockErrors.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: stockErrors.join('; ') });
    }

    // 2. Считаем сумму с учётом скидок
    let total = 0;
    for (const item of items) {
      const prod = await client.query('SELECT price, discount_percent FROM products WHERE id=$1', [item.id]);
      const p = prod.rows[0];
      const effectivePrice = p.discount_percent > 0
        ? Math.floor(p.price - (p.price * p.discount_percent / 100))
        : p.price;
      total += effectivePrice * item.quantity;
    }

    let appliedPromo = null;
    if (promo === 'RUSSIA10') {
      total = Math.floor(total * 0.9);
      appliedPromo = 'RUSSIA10';
    }

    // 3. Создаём заказ
    const o = await client.query(
      'INSERT INTO orders (username,total_price,phone,delivery_address,promo_applied) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [req.user.username, total, phone, address, appliedPromo]
    );
    const orderId = o.rows[0].id;

    // 4. Заполняем order_items и списываем stock_count
    for (const item of items) {
      const prod = await client.query('SELECT price, discount_percent FROM products WHERE id=$1', [item.id]);
      const p = prod.rows[0];
      const effectivePrice = p.discount_percent > 0
        ? Math.floor(p.price - (p.price * p.discount_percent / 100))
        : p.price;

      await client.query(
        'INSERT INTO order_items (order_id,product_id,product_name,price,quantity) VALUES ($1,$2,$3,$4,$5)',
        [orderId, item.id, item.name, effectivePrice, item.quantity]
      );
      // Списываем остаток
      await client.query(
        'UPDATE products SET stock_count = stock_count - $1 WHERE id=$2',
        [item.quantity, item.id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Заказ принят' });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});
app.get('/api/orders/my', authenticateToken, async (req, res) => { res.json((await pool.query('SELECT * FROM orders WHERE username=$1 ORDER BY created_at DESC', [req.user.username])).rows); });
app.get('/api/orders', isAdmin, async (req, res) => { 
  try {
    const orders = (await pool.query('SELECT * FROM orders ORDER BY created_at DESC')).rows;
    // Подгружаем состав каждого заказа
    for (const order of orders) {
      const items = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [order.id]);
      order.items = items.rows;
    }
    res.json(orders);
  } catch(e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/orders/:id/items', isAdmin, async (req, res) => { 
  try { res.json((await pool.query('SELECT * FROM order_items WHERE order_id=$1', [req.params.id])).rows); }
  catch(e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/orders/:id/status', isAdmin, async (req, res) => {
  const { status } = req.body;

  // Граф допустимых переходов: из какого статуса в какие можно перейти
  const TRANSITIONS = {
    'Новый':        ['В обработке', 'Отменен'],
    'В обработке':  ['Доставляется', 'Отменен'],
    'Доставляется': ['Доставлен',    'Отменен'],
    'Доставлен':    [],   // терминальный — нельзя ничего менять
    'Отменен':      [],   // терминальный — нельзя ничего менять
  };

  if (!status) {
    return res.status(400).json({ error: 'Укажите статус' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRow = await client.query('SELECT status FROM orders WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (orderRow.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    const prevStatus = orderRow.rows[0].status;

    // Проверяем допустимость перехода
    const allowed = TRANSITIONS[prevStatus] || [];
    if (!allowed.includes(status)) {
      await client.query('ROLLBACK');
      if (allowed.length === 0) {
        return res.status(400).json({ error: `Статус «${prevStatus}» является финальным — изменить нельзя` });
      }
      return res.status(400).json({
        error: `Недопустимый переход: «${prevStatus}» → «${status}». Разрешено: ${allowed.join(', ')}`
      });
    }

    // Отмена: возвращаем товары на склад (только один раз — т.к. из Отменен выйти нельзя)
    if (status === 'Отменен') {
      const orderItems = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id=$1 AND product_id IS NOT NULL',
        [req.params.id]
      );
      for (const item of orderItems.rows) {
        await client.query(
          'UPDATE products SET stock_count = stock_count + $1 WHERE id=$2',
          [item.quantity, item.product_id]
        );
      }
    }

    await client.query('UPDATE orders SET status=$1 WHERE id=$2', [status, req.params.id]);
    await client.query('COMMIT');
    res.json({ message: 'OK', status, allowedNext: TRANSITIONS[status] || [] });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// АНАЛИТИКА (Дашборд)
app.get('/api/analytics', isAdmin, async (req, res) => { const rev = await pool.query("SELECT SUM(total_price) as sum, COUNT(id) as cnt FROM orders WHERE status!='Отменен'"); const pop = await pool.query("SELECT product_name, SUM(quantity) as qty FROM order_items GROUP BY product_name ORDER BY qty DESC LIMIT 5"); res.json({ revenue: rev.rows[0].sum || 0, ordersCount: rev.rows[0].cnt || 0, popular: pop.rows }); });

// ===== АВТОРИЗАЦИЯ =====

// Отправка кода подтверждения (регистрация или сброс пароля)
app.post('/api/auth/send-code', async (req, res) => {
  const { email, type } = req.body; // type: 'register' | 'reset'
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Укажите корректный email' });
  }
  const validType = ['register', 'reset'].includes(type) ? type : 'register';
  
  try {
    if (validType === 'register') {
      // Проверяем, не занят ли email
      const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Этот email уже зарегистрирован' });
      }
    } else {
      // Для сброса — проверяем что email существует
      const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
      if (existing.rows.length === 0) {
        return res.status(400).json({ error: 'Аккаунт с таким email не найден' });
      }
    }

    // Удаляем старые коды для этого email и типа
    await pool.query('DELETE FROM email_codes WHERE email=$1 AND type=$2', [email, validType]);
    
    // Генерируем 6-значный код
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
    
    await pool.query(
      'INSERT INTO email_codes (email, code, type, expires_at) VALUES ($1, $2, $3, $4)',
      [email, code, validType, expiresAt]
    );
    
    const subject = validType === 'register' ? 'Код подтверждения — СБОРКА' : 'Сброс пароля — СБОРКА';
    const html = validType === 'register'
      ? `<h2>Добро пожаловать в СБОРКУ!</h2><p>Ваш код подтверждения:</p><h1 style="font-size:40px;letter-spacing:8px;color:#7A0000">${code}</h1><p>Код действует 10 минут.</p>`
      : `<h2>Сброс пароля — СБОРКА</h2><p>Ваш код для сброса пароля:</p><h1 style="font-size:40px;letter-spacing:8px;color:#7A0000">${code}</h1><p>Код действует 10 минут. Если вы не запрашивали сброс — проигнорируйте письмо.</p>`;
    
    await sendEmail(email, subject, html);
    
    res.json({ message: 'Код отправлен на почту' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Регистрация с верификацией email
app.post('/api/register', async (req, res) => { 
  const { username, password, confirmPassword, email, code } = req.body;
  
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string' || username.length < 3 || username.length > 50 || password.length < 6) {
    return res.status(400).json({ error: 'Имя пользователя: 3-50 символов, пароль: минимум 6 символов' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Пароли не совпадают' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Укажите корректный email' });
  }
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Введите код подтверждения' });
  }
  
  try {
    // Проверяем код
    const codeRow = await pool.query(
      "SELECT * FROM email_codes WHERE email=$1 AND type='register' AND used=false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email]
    );
    if (codeRow.rows.length === 0) {
      return res.status(400).json({ error: 'Код истёк или не найден. Запросите новый.' });
    }
    if (codeRow.rows[0].code !== code) {
      return res.status(400).json({ error: 'Неверный код подтверждения' });
    }
    
    // Помечаем код как использованный
    await pool.query('UPDATE email_codes SET used=true WHERE id=$1', [codeRow.rows[0].id]);
    
    const h = await bcrypt.hash(password, 10); 
    await pool.query("INSERT INTO users (username,password,email) VALUES ($1,$2,$3)", [username, h, email]); 
    res.json({ message: 'OK' }); 
  } catch (e) { 
    res.status(400).json({ error: 'Пользователь или email уже существует' }); 
  } 
});

// Подтверждение сброса пароля
app.post('/api/auth/reset-password/confirm', async (req, res) => {
  const { email, code, newPassword } = req.body;
  
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Пароль: минимум 6 символов' });
  }
  
  try {
    const codeRow = await pool.query(
      "SELECT * FROM email_codes WHERE email=$1 AND type='reset' AND used=false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email]
    );
    if (codeRow.rows.length === 0) {
      return res.status(400).json({ error: 'Код истёк или не найден. Запросите новый.' });
    }
    if (codeRow.rows[0].code !== code) {
      return res.status(400).json({ error: 'Неверный код' });
    }
    
    await pool.query('UPDATE email_codes SET used=true WHERE id=$1', [codeRow.rows[0].id]);
    const h = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password=$1 WHERE email=$2', [h, email]);
    
    res.json({ message: 'Пароль успешно изменён' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/login', async (req, res) => { 
  const { username, password } = req.body;
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Неверные данные' });
  }
  // Поддержка входа по username ИЛИ email
  const u = (await pool.query('SELECT * FROM users WHERE username=$1 OR email=$1', [username])).rows[0]; 
  if (u && await bcrypt.compare(password, u.password)) { 
    res.json({ token: jwt.sign({ role: u.role, username: u.username }, SECRET_KEY), role: u.role, username: u.username }); 
  } else { 
    res.status(400).json({ error: 'Ошибка входа' }); 
  } 
});

app.patch('/api/products/:id/discount', isAdmin, async (req, res) => {
  const { discount_percent } = req.body;
  if (discount_percent === undefined || isNaN(discount_percent) || discount_percent < 0 || discount_percent > 99) {
    return res.status(400).json({ error: 'Скидка должна быть числом от 0 до 99%' });
  }
  try {
    await pool.query('UPDATE products SET discount_percent=$1 WHERE id=$2', [discount_percent, req.params.id]);
    const r = await pool.query(
      `SELECT p.*, COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating, COUNT(r.id) as review_count 
       FROM products p LEFT JOIN reviews r ON p.id = r.product_id 
       WHERE p.id = $1 GROUP BY p.id`, 
      [req.params.id]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(5000, () => console.log('Backend 5000'));