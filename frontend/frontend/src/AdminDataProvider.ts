import { fetchUtils, type DataProvider } from 'react-admin';

const apiUrl = 'http://localhost:8081/api/admin';

const httpClient = (url: string, options: any = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('authToken'); 
    options.headers.set('Authorization', `Bearer ${token}`);
    return fetchUtils.fetchJson(url, options);
};

const mapResource = (resource: string, item: any) => {
    const isUserResource = resource.includes('users');
    return {
        ...item,
        id: isUserResource ? item.userId : item.applicationId,
    };
};

export const adminDataProvider: DataProvider = {
    getList: async (resource, params) => {
        const url = `${apiUrl}/${resource}`;
        const { json } = await httpClient(url);
        
        return {
            data: json.map((item: any) => mapResource(resource, item)),
            total: json.length,
        };
    },

    getOne: async (resource, params) => {
        const url = `${apiUrl}/${resource}/${params.id}`;
        const { json } = await httpClient(url);
        return {
            data: mapResource(resource, json),
        };
    },

    create: async (resource, params) => {
        let url = `${apiUrl}/${resource}`;
        
        if (resource === 'users') {
            url = params.data.roleName === 'STUDENT' 
                ? `${apiUrl}/users/student` 
                : `${apiUrl}/users/staff`;
        }

        const { json } = await httpClient(url, {
            method: 'POST',
            body: JSON.stringify(params.data),
        });
        
        return { 
            data: mapResource(resource, json) 
        };
    },

    update: async (resource, params) => {
        const url = `${apiUrl}/${resource}/${params.id}`;
        const { json } = await httpClient(url, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        });
        return { 
            data: mapResource(resource, json) 
        };
    },

    delete: async (resource, params) => {
        const url = `${apiUrl}/${resource}/${params.id}`;
        await httpClient(url, { method: 'DELETE' });
        return { 
        data: params.previousData ? params.previousData : { id: params.id } 
    } as any;
    },

    deleteMany: async (resource, params) => {
        await Promise.all(
            params.ids.map(id => httpClient(`${apiUrl}/${resource}/${id}`, { method: 'DELETE' }))
        );
        return { data: params.ids };
    },
    
    getMany: async (resource, params) => {
        const url = `${apiUrl}/${resource}`;
        const { json } = await httpClient(url);
        const mappedData = json.map((item: any) => mapResource(resource, item));
        return { 
            data: mappedData.filter((item: any) => params.ids.includes(item.id)) 
        };
    },

    getManyReference: async (resource, params) => {
        return { data: [], total: 0 };
    },

    updateMany: async (resource, params) => {
        return { data: params.ids };
    },
    
    getStudentHistory: async (id: number) => {
        const { json } = await httpClient(`${apiUrl}/users/${id}/student-history`);
        return json;
    },
    getStaffHistory: async (id: number) => {
        const { json } = await httpClient(`${apiUrl}/users/${id}/staff-activity`);
        return json;
    }
};