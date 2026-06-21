-- =====================================================
-- Bpicius Database Backup (SQL Format)
-- Generated for full-stack Bpicius Vendor Portal & Marketplace
-- Compatible with SQLite
-- =====================================================

PRAGMA foreign_keys = ON;

-- =====================
-- TABLES
-- =====================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'vendor', 'customer', 'guest')),
  vendor_id INTEGER,
  avatar TEXT,
  password TEXT DEFAULT 'demo123',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'approved',
  email TEXT,
  phone TEXT,
  logo TEXT,
  team_size INTEGER DEFAULT 1,
  joined TEXT
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  name TEXT NOT NULL,
  photo TEXT,
  price REAL,
  description TEXT,
  availability TEXT DEFAULT 'In stock',
  time_made TEXT,
  category TEXT,
  approved INTEGER DEFAULT 1,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  vendor_id INTEGER,
  assignee TEXT,
  status TEXT DEFAULT 'todo',
  due TEXT,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER,
  amount REAL,
  status TEXT DEFAULT 'pending',
  date TEXT,
  due_date TEXT,
  file TEXT,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  vendor_id INTEGER,
  items TEXT,
  total REAL,
  status TEXT DEFAULT 'placed',
  date TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Issues / Support
CREATE TABLE IF NOT EXISTS issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  subject TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  date TEXT,
  related_order INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER,
  menu_item_id INTEGER,
  PRIMARY KEY (user_id, menu_item_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  vendor_id INTEGER,
  name TEXT,
  date TEXT,
  file_path TEXT
);

-- =====================
-- SEED DATA
-- =====================

-- Users
INSERT OR IGNORE INTO users (id, name, email, role, vendor_id, avatar, status) VALUES 
(1, 'Luis Rivera', 'luis@bpicius.com', 'admin', NULL, 'https://i.pravatar.cc/32?img=68', 'active'),
(2, 'Elena Torres', 'elena@lacocina.com', 'vendor', 1, 'https://i.pravatar.cc/32?img=47', 'active'),
(3, 'Maria Gonzalez', 'maria@example.com', 'customer', NULL, 'https://i.pravatar.cc/32?img=40', 'active'),
(4, 'James Kim', 'james@example.com', 'customer', NULL, 'https://i.pravatar.cc/32?img=32', 'active');

-- Vendors
INSERT OR IGNORE INTO vendors (id, name, category, status, email, phone, logo, team_size, joined) VALUES 
(1, 'La Cocina de Elena', 'Mexican', 'approved', 'elena@lacocina.com', '(505) 555-0142', 'https://i.pravatar.cc/48?img=47', 7, '2024-09-12'),
(2, 'Nonna''s Pasta', 'Italian', 'approved', 'nonna@pasta.com', '(505) 555-0198', 'https://i.pravatar.cc/48?img=28', 4, '2024-10-03'),
(3, 'Tokyo Street', 'Asian', 'pending', 'hello@tokyostreet.com', '(505) 555-0211', 'https://i.pravatar.cc/48?img=15', 3, '2025-01-15'),
(4, 'The Burger Joint', 'American', 'approved', 'orders@burgerjoint.com', '(505) 555-0333', 'https://i.pravatar.cc/48?img=32', 9, '2024-08-22');

-- Menu Items
INSERT OR IGNORE INTO menu_items (id, vendor_id, name, photo, price, description, availability, time_made, category, approved) VALUES 
(101, 1, 'Chicken Tamales', 'https://picsum.photos/id/292/300/200', 14, 'Slow-cooked chicken in corn masa', 'In stock', '45 min', 'Mexican', 1),
(102, 2, 'Truffle Cacio e Pepe', 'https://picsum.photos/id/312/300/200', 19, 'Fresh handmade pasta, aged parmesan', 'Limited', '18 min', 'Italian', 1),
(103, 4, 'Smash Burger', 'https://picsum.photos/id/292/300/200', 13, 'Double beef smash, American cheese', 'In stock', '12 min', 'American', 1),
(104, 1, 'Al Pastor Tacos', 'https://picsum.photos/id/312/300/200', 11, 'Marinated pork, pineapple, cilantro', 'In stock', '22 min', 'Mexican', 1);

-- Tasks
INSERT OR IGNORE INTO tasks (id, title, description, vendor_id, assignee, status, due) VALUES 
(201, 'Restock masa for weekend', 'Need 40 lbs fresh masa', 1, 'Elena T.', 'todo', '2025-02-12'),
(202, 'Approve new vendor application', 'Review documents + menu photos', 3, 'Luis R.', 'inprogress', '2025-02-10'),
(203, 'Fix invoice #INV-884', 'Customer paid wrong amount', 2, 'Maria S.', 'done', '2025-02-08');

-- Invoices
INSERT OR IGNORE INTO invoices (id, vendor_id, amount, status, date, due_date, file) VALUES 
(301, 1, 1240, 'paid', '2025-01-28', '2025-02-12', 'INV-884.pdf'),
(302, 2, 890, 'pending', '2025-02-01', '2025-02-18', 'INV-885.pdf'),
(303, 4, 2100, 'overdue', '2025-01-15', '2025-01-30', 'INV-879.pdf');

-- Orders
INSERT OR IGNORE INTO orders (id, user_id, vendor_id, items, total, status, date) VALUES 
(501, 3, 1, '[{"name":"Chicken Tamales","qty":2,"price":14},{"name":"Al Pastor Tacos","qty":3,"price":11}]', 61, 'delivered', '2025-01-28'),
(502, 3, 4, '[{"name":"Smash Burger","qty":1,"price":13}]', 13, 'preparing', '2025-02-05');

-- Issues
INSERT OR IGNORE INTO issues (id, user_id, subject, description, status, date, related_order) VALUES 
(601, 3, 'Order was missing items', 'I only received 1 tamale instead of 2.', 'open', '2025-01-29', 501);

-- Favorites (Maria likes Chicken Tamales and Smash Burger)
INSERT OR IGNORE INTO favorites (user_id, menu_item_id) VALUES 
(3, 101),
(3, 103);

-- Documents (sample)
INSERT OR IGNORE INTO documents (id, user_id, vendor_id, name, date) VALUES 
(1, 2, 1, 'Menu - February 2025.pdf', '2025-02-01'),
(2, 1, NULL, 'Vendor Agreement - La Cocina.pdf', '2025-01-15');

-- Reset sequences (important for SQLite)
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM users) WHERE name = 'users';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM vendors) WHERE name = 'vendors';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM menu_items) WHERE name = 'menu_items';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM tasks) WHERE name = 'tasks';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM invoices) WHERE name = 'invoices';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM orders) WHERE name = 'orders';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM issues) WHERE name = 'issues';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM documents) WHERE name = 'documents';

-- End of backup
-- To restore: sqlite3 bpicius.db < backup.sql