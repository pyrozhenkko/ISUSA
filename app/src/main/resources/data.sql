-- ==========================================
-- 1. Таблиця ROLES (Ролі користувачів)
-- Важливо: Назви ролей мають відповідати тим, що використовуються в SecurityConfig
-- та AuthService (наприклад, "ADMIN", "STUDENT").
-- ==========================================

INSERT INTO Roles (RoleName) VALUES ('ADMIN');
INSERT INTO Roles (RoleName) VALUES ('STUDENT');
INSERT INTO Roles (RoleName) VALUES ('TEACHER');
INSERT INTO Roles (RoleName) VALUES ('DEANERY_STAFF');


-- ==========================================
-- 2. Таблиця APPLICATIONSTATUS (Статуси заявок)
-- Важливо: Статус "Нова" є ОБОВ'ЯЗКОВИМ, оскільки він
-- хардкодиться в ApplicationService при створенні заявки.
-- ==========================================

INSERT INTO ApplicationStatus (StatusName) VALUES ('Нова');
INSERT INTO ApplicationStatus (StatusName) VALUES ('На розгляді');
INSERT INTO ApplicationStatus (StatusName) VALUES ('Потребує уточнення');
INSERT INTO ApplicationStatus (StatusName) VALUES ('Схвалено');
INSERT INTO ApplicationStatus (StatusName) VALUES ('Відхилено');
INSERT INTO ApplicationStatus (StatusName) VALUES ('Скасовано');


-- ==========================================
-- 3. Таблиця APPLICATIONTYPE (Типи заявок)
-- Це список, з якого студент обирає тип при створенні заявки.
-- Описи (Description) додані для кращого розуміння інтерфейсу.
-- ==========================================

INSERT INTO ApplicationType (TypeName, Description)
VALUES ('Матеріальна допомога', 'Заява на отримання одноразової грошової допомоги у зв’язку з важким матеріальним станом.');

INSERT INTO ApplicationType (TypeName, Description)
VALUES ('Академічна відпустка', 'Заява на перерву у навчанні за станом здоров’я або сімейними обставинами.');

INSERT INTO ApplicationType (TypeName, Description)
VALUES ('Поселення у гуртожиток', 'Заява на надання ліжко-місця у гуртожитку університету.');

INSERT INTO ApplicationType (TypeName, Description)
VALUES ('Індивідуальний графік', 'Заява на переведення на індивідуальний графік навчання (для працюючих студентів).');

INSERT INTO ApplicationType (TypeName, Description)
VALUES ('Дублікат студентського квитка', 'Заява на виготовлення нового квитка у зв’язку з втратою або пошкодженням старого.');

INSERT INTO ApplicationType (TypeName, Description)
VALUES ('Довідка про навчання', 'Запит на отримання довідки для військкомату або за місцем вимоги.');



-- Інсерт для суперюзера, захешований пароль admin
INSERT INTO users (username, full_name, email, password_hash, is_active, roleid)
VALUES (
           'super_admin',
           'Головний Адміністратор',
           'admin@isusa.edu',
           '$2a$10$Uc.SZ0hvGJQlYdsAp7be1.lFjmOnc7aAr4L0YY3/VN3oK.F8zJHRG',
           'true',
           2
       );

