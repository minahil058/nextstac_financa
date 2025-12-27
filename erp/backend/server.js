import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import crmRoutes from './routes/crmRoutes.js';
import purchasingRoutes from './routes/purchasingRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchasing', purchasingRoutes); // Vendors
app.use('/api/system', systemRoutes);         // Logs, Profile

app.get('/', (req, res) => {
    res.send('Financa ERP API is running');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
