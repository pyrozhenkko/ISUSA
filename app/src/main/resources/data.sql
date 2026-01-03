-- =================================================================
-- 1. ПРАВА ДОСТУПУ (PERMISSIONS)
-- =================================================================
INSERT INTO permissions (permission_name) VALUES
                                              ('application:create'),
                                              ('application:read_own'),
                                              ('application:read'),
                                              ('application:update_status'),
                                              ('application:verify_sign'),
                                              ('recommendation:create'),
                                              ('user:manage')
    ON CONFLICT (permission_name) DO NOTHING;

-- =================================================================
-- 2. РОЛІ (ROLES)
-- =================================================================
INSERT INTO roles (role_name) VALUES
                                  ('STUDENT'),
                                  ('TEACHER'),
                                  ('DEANERY_STAFF'),
                                  ('ADMIN')
    ON CONFLICT (role_name) DO NOTHING;

-- =================================================================
-- 3. ЗВ'ЯЗОК РОЛЕЙ ТА ПРАВ (ROLE_PERMISSIONS)
-- =================================================================

-- === СТУДЕНТ ===
INSERT INTO role_permissions (roleid, permissionid)
SELECT r.roleid, p.permissionid
FROM roles r, permissions p
WHERE r.role_name = 'STUDENT'
  AND p.permission_name IN ('application:create', 'application:read_own')
    ON CONFLICT (roleid, permissionid) DO NOTHING;

-- === ВИКЛАДАЧ ===
INSERT INTO role_permissions (roleid, permissionid)
SELECT r.roleid, p.permissionid
FROM roles r, permissions p
WHERE r.role_name = 'TEACHER'
  AND p.permission_name IN ('application:read', 'application:verify_sign', 'recommendation:create')
    ON CONFLICT (roleid, permissionid) DO NOTHING;

-- === ДЕКАНАТ ===
INSERT INTO role_permissions (roleid, permissionid)
SELECT r.roleid, p.permissionid
FROM roles r, permissions p
WHERE r.role_name = 'DEANERY_STAFF'
  AND p.permission_name IN ('application:read', 'application:update_status', 'application:verify_sign')
    ON CONFLICT (roleid, permissionid) DO NOTHING;

-- === АДМІН ===
INSERT INTO role_permissions (roleid, permissionid)
SELECT r.roleid, p.permissionid
FROM roles r, permissions p
WHERE r.role_name = 'ADMIN'
    ON CONFLICT (roleid, permissionid) DO NOTHING;

-- =================================================================
-- 4. СТАТУСИ ЗАЯВОК (APPLICATION_STATUS)
-- =================================================================
INSERT INTO application_status (status_name) VALUES
                                                 ('Чернетка'),
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
                                                          ('Академічна відпустка', 'Заява на перерву у навчанні за станом здоров''я.'),
                                                          ('Поселення у гуртожиток', 'Заява на надання ліжко-місця.'),
                                                          ('Індивідуальний графік', 'Переведення на індивідуальний графік навчання.'),
                                                          ('Дублікат квитка', 'Виготовлення нового студентського квитка.'),
                                                          ('Довідка про навчання', 'Запит на отримання довідки для військкомату.')
    ON CONFLICT (type_name) DO NOTHING;

-- =================================================================
-- 6. СТВОРЕННЯ СУПЕР-АДМІНА
-- =================================================================
INSERT INTO users (
    roleid,
    username,
    password_hash,
    -- full_name ПРИБРАНО
    first_name,
    middle_name,
    last_name,
    email,
    phone_number,
    date_of_birth,
    faculty,
    department,
    position,
    enrolled_date,
    is_active,
    is_deleted,
    failed_login_attempts
)
VALUES (
           (SELECT roleid FROM roles WHERE role_name = 'ADMIN'),
           'admin',
           '$2a$10$kIaRs3P/j1DFqxjjThQEmOVQVcRmWVJpH8a2lSrCEPHV/0KLBRdiG',
           -- Значення 'Петренко Олександр Миколайович' ПРИБРАНО
           'Олександр',
           'Миколайович',
           'Петренко',
           'admin@university.edu',
           '+380501111111',
           '1980-01-15'::timestamp,
           'Адміністрація',
           'Відділ інформаційних технологій',
           'Системний адміністратор',
           '2010-09-01'::timestamp,
           TRUE,
           FALSE,
           0
       )
    ON CONFLICT (username) DO NOTHING;

-- =================================================================
-- 7. СТВОРЕННЯ ТЕСТОВОГО СТУДЕНТА
-- =================================================================
INSERT INTO users (
    roleid,
    username,
    password_hash,
    -- full_name ПРИБРАНО
    first_name,
    middle_name,
    last_name,
    email,
    phone_number,
    date_of_birth,
    faculty,
    department,
    position,
    enrolled_date,
    is_active,
    is_deleted,
    failed_login_attempts
)
VALUES (
           (SELECT roleid FROM roles WHERE role_name = 'STUDENT'),
           'student',
           '$2a$10$rVvSmxxWDXHfnlmWHVV7qOcpnwXN.ksKGgxvPJTQW.5z8LBq8K7Xa',
           -- Значення 'Іваненко Іван Петрович' ПРИБРАНО
           'Іван',
           'Петрович',
           'Іваненко',
           'student@university.edu',
           '+380501234567',
           '2004-05-15'::timestamp,
           'Факультет Інформаційних Технологій',
           'Кафедра програмної інженерії',
           'Студент',
           '2021-09-01'::timestamp,
           TRUE,
           FALSE,
           0
       )
    ON CONFLICT (username) DO NOTHING;

-- Додати студента до таблиці students
INSERT INTO students (studentid, userid, specialty, groupid, year_of_study)
VALUES (
           (SELECT userid FROM users WHERE username = 'student'),
           (SELECT userid FROM users WHERE username = 'student'),
           'Програмна Інженерія',
           'ПІ-21',
           2
       )
    ON CONFLICT (userid) DO NOTHING;