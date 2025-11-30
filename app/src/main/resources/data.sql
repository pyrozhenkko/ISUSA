-- =================================================================
-- 1. ПРАВА ДОСТУПУ (PERMISSIONS)
-- Визначаємо, що взагалі МОЖНА робити в системі.
-- =================================================================
INSERT INTO permissions (permission_name) VALUES
                                              ('application:create'),       -- Створювати заявки
                                              ('application:read_own'),     -- Читати ТІЛЬКИ свої заявки
                                              ('application:read'),         -- Читати ВСІ заявки (для персоналу)
                                              ('application:update_status'),-- Міняти статус (Деканат)
                                              ('application:verify_sign'),  -- Перевіряти підпис
                                              ('recommendation:create'),    -- Писати рекомендації (Викладач)
                                              ('user:manage')               -- Створювати юзерів (Адмін)
    ON CONFLICT (permission_name) DO NOTHING;

-- =================================================================
-- 2. РОЛІ (ROLES)
-- Основні посади в університеті.
-- =================================================================
INSERT INTO roles (role_name) VALUES
                                  ('STUDENT'),
                                  ('TEACHER'),
                                  ('DEANERY_STAFF'),
                                  ('ADMIN')
    ON CONFLICT (role_name) DO NOTHING;

-- =================================================================
-- 3. ЗВ'ЯЗОК РОЛЕЙ ТА ПРАВ (ROLE_PERMISSIONS)
-- САМЕ ТУТ ми даємо студенту право читати свої заяви.
-- =================================================================

-- === СТУДЕНТ (STUDENT) ===
-- Отримує право створювати (create) і читати свої (read_own)
INSERT INTO role_permissions (roleid, permissionid)
SELECT r.roleid, p.permissionid
FROM roles r, permissions p
WHERE r.role_name = 'STUDENT'
  AND p.permission_name IN ('application:create', 'application:read_own')
    ON CONFLICT (roleid, permissionid) DO NOTHING;

-- === ВИКЛАДАЧ (TEACHER) ===
-- Читає всі, перевіряє підпис, пише рекомендації
INSERT INTO role_permissions (roleid, permissionid)
SELECT r.roleid, p.permissionid
FROM roles r, permissions p
WHERE r.role_name = 'TEACHER'
  AND p.permission_name IN ('application:read', 'application:verify_sign', 'recommendation:create')
    ON CONFLICT (roleid, permissionid) DO NOTHING;

-- === ДЕКАНАТ (DEANERY_STAFF) ===
-- Читає всі, змінює статус, перевіряє підпис
INSERT INTO role_permissions (roleid, permissionid)
SELECT r.roleid, p.permissionid
FROM roles r, permissions p
WHERE r.role_name = 'DEANERY_STAFF'
  AND p.permission_name IN ('application:read', 'application:update_status', 'application:verify_sign')
    ON CONFLICT (roleid, permissionid) DO NOTHING;

-- === АДМІН (ADMIN) ===
-- Має права на все, плюс керування юзерами
INSERT INTO role_permissions (roleid, permissionid)
SELECT r.roleid, p.permissionid
FROM roles r, permissions p
WHERE r.role_name = 'ADMIN'
  AND p.permission_name IN ('application:read', 'application:update_status', 'application:verify_sign', 'user:manage')
    ON CONFLICT (roleid, permissionid) DO NOTHING;

-- =================================================================
-- 4. СТАТУСИ ЗАЯВОК (APPLICATION_STATUS)
-- =================================================================
INSERT INTO application_status (status_name) VALUES
                                                 ('Нова'),
                                                 ('На розгляді'),
                                                 ('Потребує уточнення'),
                                                 ('Схвалено'),
                                                 ('Відхилено'),
                                                 ('Скасовано')
    ON CONFLICT (status_name) DO NOTHING;

-- =================================================================
-- 5. ТИПИ ЗАЯВОК (APPLICATION_TYPE)
-- =================================================================
INSERT INTO application_type (type_name, description) VALUES
                                                          ('Матеріальна допомога', 'Заява на отримання одноразової грошової допомоги.'),
                                                          ('Академічна відпустка', 'Заява на перерву у навчанні за станом здоров’я.'),
                                                          ('Поселення у гуртожиток', 'Заява на надання ліжко-місця.'),
                                                          ('Індивідуальний графік', 'Переведення на індивідуальний графік навчання.'),
                                                          ('Дублікат квитка', 'Виготовлення нового студентського квитка.'),
                                                          ('Довідка про навчання', 'Запит на отримання довідки для військкомату.')
    ON CONFLICT (type_name) DO NOTHING;

-- =================================================================
-- 6. СТВОРЕННЯ СУПЕР-АДМІНА
-- Логін: admin / Пароль: adminpass
-- =================================================================
INSERT INTO users (roleid, username, password_hash, full_name, email, is_active)
VALUES (
           (SELECT roleid FROM roles WHERE role_name = 'ADMIN'),
           'admin',
           '$2a$10$t3X.d6H1Xl3L4Qo2g5Y9sO.xK2c9aB0J1K8L5O.xK2c9aB0J1K8L5O',
           'Головний Адміністратор',
           'admin@university.edu',
           TRUE
       )
    ON CONFLICT (username) DO NOTHING;