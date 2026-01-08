import React from 'react';
import { 
    Admin, Resource, List, Datagrid, TextField, 
    EmailField, BooleanField, DateField, Edit, 
    SimpleForm, TextInput, SelectInput, Create,
    useRecordContext, useNotify, useRefresh, Button, Show, TabbedShowLayout, Tab
} from 'react-admin';
import { Typography } from '@mui/material'
import { adminDataProvider } from './AdminDataProvider';
import { adminAuthProvider } from './adminAuthProvider';
import SystemChart from './SystemChart';
import { Power, RotateCcw, UserCheck, Archive } from 'lucide-react';

// --- КАСТОМНІ КОМПОНЕНТИ ТА КНОПКИ ---

const ToggleActiveButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record) return null;

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); 
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://localhost:8081/api/admin/users/${record.id}/toggle-active`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                notify(record.isActive ? 'Користувача деактивовано' : 'Користувача активовано', { type: 'info' });
                refresh();
            } else {
                notify('Помилка при зміні статусу', { type: 'warning' });
            }
        } catch (error) {
            notify('Помилка мережі', { type: 'error' });
        }
    };

    return (
        <Button 
            label={record.isActive ? "Вимкнути" : "Увімкнути"} 
            onClick={handleToggle}
            color={record.isActive ? "error" : "primary"}
        >
            <Power size={18} />
        </Button>
    );
};

const Dashboard = () => (
    <div style={{ padding: '20px' }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Панель моніторингу</Typography>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <SystemChart />
        </div>
    </div>
);

// Кнопка відновлення видаленого користувача
const RestoreUserButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record) return null;

    const handleRestore = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:8081/api/admin/users/${record.id}/restore`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            notify('Користувача успішно відновлено');
            refresh();
        }
    };

    return (
        <Button label="Відновити" onClick={handleRestore}>
            <RotateCcw size={18} />
        </Button>
    );
};

// --- РЕСУРСИ (СПИСКИ ТА ФОРМИ) ---

const UserList = () => (
    <List title="Управління користувачами">
        <Datagrid rowClick="edit">
            <TextField source="userId" label="ID" />
            <TextField source="username" label="Логін" />
            <TextField source="firstName" label="Ім'я" />
            <TextField source="lastName" label="Прізвище" />
            <EmailField source="email" />
            <TextField source="role.roleName" label="Роль" />
            <BooleanField source="isActive" label="Активний" />
            <ToggleActiveButton />
        </Datagrid>
    </List>
);

const DeletedUserList = () => (
    <List title="Видалені користувачі">
        <Datagrid>
            <TextField source="userId" label="ID" />
            <TextField source="username" label="Логін" />
            <EmailField source="email" />
            <DateField source="deletedDate" label="Дата видалення" showTime />
            <RestoreUserButton />
        </Datagrid>
    </List>
);

const UserCreate = () => (
    <Create title="Додати нового користувача">
        <SimpleForm>
            <Typography variant="h6" sx={{ mb: 2 }}>Основні дані</Typography>
            <TextInput source="username" label="Логін" fullWidth required />
            <TextInput source="password" label="Пароль" type="password" fullWidth required />
            <TextInput source="email" label="Email" fullWidth required />
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <TextInput source="firstName" label="Ім'я" required />
                <TextInput source="lastName" label="Прізвище" required />
                <TextInput source="middleName" label="По батькові" />
            </div>

            <SelectInput source="roleName" label="Роль користувача" required choices={[
                { id: 'STUDENT', name: 'Студент' },
                { id: 'TEACHER', name: 'Викладач' },
                { id: 'DEANERY_STAFF', name: 'Деканат' },
                { id: 'ADMIN', name: 'Адміністратор' },
            ]} />

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Додаткова інформація</Typography>
            <TextInput source="faculty" label="Факультет" />
            <TextInput source="department" label="Кафедра" />
            
            <TextInput source="studentId" label="Номер студентського (для студентів)" />
            <TextInput source="groupId" label="Група (напр. КН-31)" />
            <TextInput source="specialty" label="Спеціальність" />
            <SelectInput source="yearOfStudy" label="Курс" choices={[
                { id: 1, name: '1 курс' },
                { id: 2, name: '2 курс' },
                { id: 3, name: '3 курс' },
                { id: 4, name: '4 курс' },
            ]} />
        </SimpleForm>
    </Create>
);

const ApplicationList = () => (
    <List title="Всі заявки">
        <Datagrid rowClick="show">
            <TextField source="applicationId" label="ID" />
            <TextField source="applicationType.typeName" label="Тип" />
            <TextField source="applicationStatus.statusName" label="Статус" />
            <TextField source="student.userResponseDto.lastName" label="Прізвище студента" />
            <DateField source="createdDate" label="Створено" showTime />
        </Datagrid>
    </List>
);

// Компонент для відображення історії студента
const StudentHistoryTab = () => {
    const record = useRecordContext();
    const [history, setHistory] = React.useState<any>(null);

    React.useEffect(() => {
        if (record && record.role?.roleName === 'STUDENT') {
            adminDataProvider.getStudentHistory(record.id).then(setHistory);
        }
    }, [record]);

    if (!history) return <span>Завантаження історії...</span>;

    return (
        <div className="mt-4">
            <Typography variant="subtitle2" color="primary">Всього заяв: {history.totalApplications}</Typography>
            <Datagrid data={history.applications} bulkActionButtons={false}>
                <TextField source="applicationId" label="ID" />
                <TextField source="title" label="Тема" />
                <TextField source="applicationStatus.statusName" label="Статус" />
                <DateField source="createdDate" label="Дата" />
            </Datagrid>
        </div>
    );
};

// Компонент для історії дій співробітника
const StaffActivityTab = () => {
    const record = useRecordContext();
    const [activity, setActivity] = React.useState<any>(null);

    React.useEffect(() => {
        if (record && record.role?.roleName !== 'STUDENT') {
            adminDataProvider.getStaffHistory(record.id).then(setActivity);
        }
    }, [record]);

    if (!activity) return <span>Завантаження активності...</span>;

    return (
        <div className="mt-4">
            <Typography variant="subtitle2" color="secondary">Дій в системі: {activity.totalApplications}</Typography>
            <Datagrid data={activity.history} bulkActionButtons={false}>
                <TextField source="id" label="ID логу" />
                <TextField source="statusChange" label="Зміна статусу" />
                <TextField source="comment" label="Коментар" />
                <DateField source="changedDate" label="Дата" showTime />
            </Datagrid>
        </div>
    );
};

const UserShow = () => (
    <Show title="Детальний огляд та історія">
        <TabbedShowLayout>
            {/* Перша вкладка: Профіль */}
            <Tab label="Профіль">
                <TextField source="userId" label="ID" />
                <TextField source="username" label="Логін" />
                <TextField source="firstName" label="Ім'я" />
                <TextField source="lastName" label="Прізвище" />
                <EmailField source="email" />
                <TextField source="faculty" label="Факультет" />
                <TextField source="department" label="Кафедра" />
                <TextField source="role.roleName" label="Роль" />
            </Tab>

            {/* Друга вкладка: Історія (саме тут твої методи з бекенду) */}
            <Tab label="Активність / Історія" path="activity">
                <UserActivityWrapper />
            </Tab>
        </TabbedShowLayout>
    </Show>
);

const UserActivityWrapper = () => {
    const record = useRecordContext();
    if (!record) return null;
    
    return record.role?.roleName === 'STUDENT' 
        ? <StudentHistoryTab /> 
        : <StaffActivityTab />;
};

// --- ГОЛОВНА ПАНЕЛЬ ---

export const AdminPanel = () => (
    <Admin dataProvider={adminDataProvider} basename="/admin" authProvider={adminAuthProvider} dashboard={Dashboard}>
        {/* Активні користувачі */}
        <Resource 
            name="users" 
            list={UserList} 
            create={UserCreate} 
            edit={Edit} 
            show={UserShow}
            icon={UserCheck}
        />
        
        <Resource 
            name="users/deleted" 
            options={{ label: 'Видалені' }} 
            list={DeletedUserList}
            icon={Archive}
        />

        <Resource 
            name="applications" 
            list={ApplicationList} 
        />
    </Admin>
);