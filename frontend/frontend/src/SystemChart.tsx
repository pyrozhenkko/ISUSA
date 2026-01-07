import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

const SystemChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchChartData = async () => {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8081/api/admin/reports/chart?days=7', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const json = await response.json();
                setData(json);
            }
        };
        fetchChartData();
    }, []);

    return (
        <Card sx={{ mt: 2, mb: 2, p: 2, backgroundColor: '#0f172a', color: '#fff', borderRadius: '15px' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Здоров'я системи (Останні 7 днів)</Typography>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Legend />
                            <Line type="monotone" dataKey="infoCount" name="Info" stroke="#3b82f6" strokeWidth={2} />
                            <Line type="monotone" dataKey="warnCount" name="Warn" stroke="#f59e0b" strokeWidth={2} />
                            <Line type="monotone" dataKey="errorCount" name="Error" stroke="#ef4444" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default SystemChart;