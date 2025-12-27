import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { jest } from '@jest/globals';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import crmRoutes from './routes/crmRoutes.js';
import purchasingRoutes from './routes/purchasingRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

// Setup Express App for Testing
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/purchasing', purchasingRoutes);
app.use('/api/system', systemRoutes);

// Mock DB interactions to avoid messing with real DB during basic route tests
// Or better, we test against the real SQLite DB since it's local and we can use a test DB file.
// For this verifying run, we wil stick to the live logic but ensure we handle side effects or just accept created data.

describe('ERP Backend API Endpoints', () => {

    // --- Auth ---
    describe('Auth Module', () => {
        it('POST /api/auth/login - should fail with invalid credentials', async () => {
            const res = await request(app).post('/api/auth/login').send({
                email: 'wrong@test.com',
                password: 'wrong'
            });
            expect(res.statusCode).not.toBe(200); // 401 or 400
        });
    });

    // --- Inventory ---
    describe('Inventory Module', () => {
        let createdProductId;
        it('GET /api/inventory/products - should return list', async () => {
            const res = await request(app).get('/api/inventory/products');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('POST /api/inventory/products - should create product', async () => {
            const res = await request(app).post('/api/inventory/products').send({
                name: 'Jest Test Product',
                sku: `JEST-${Date.now()}`,
                price: 150,
                stock: 10
            });
            expect(res.statusCode).toBe(201);
            createdProductId = res.body.id;
        });
    });

    // --- CRM ---
    describe('CRM Module', () => {
        it('GET /api/crm/customers - should return list', async () => {
            const res = await request(app).get('/api/crm/customers');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('POST /api/crm/customers - should create customer', async () => {
            const res = await request(app).post('/api/crm/customers').send({
                name: 'Jest Customer',
                email: `jest${Date.now()}@test.com`,
                status: 'Active'
            });
            expect(res.statusCode).toBe(201);
        });
    });

    // --- Finance ---
    describe('Finance Module', () => {
        it('GET /api/finance/invoices - should return list', async () => {
            const res = await request(app).get('/api/finance/invoices');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('POST /api/finance/invoices - should create invoice with items', async () => {
            const res = await request(app).post('/api/finance/invoices').send({
                customer: 'Jest Customer',
                date: '2025-01-01',
                dueDate: '2025-02-01',
                items: [
                    { name: 'Item 1', quantity: 2, price: 10 },
                    { name: 'Item 2', quantity: 1, price: 50 }
                ]
            });
            expect(res.statusCode).toBe(201);
            expect(res.body.amount).toBe(70); // 2*10 + 1*50
        });

        it('GET /api/finance/payments - should return list', async () => {
            const res = await request(app).get('/api/finance/payments');
            expect(res.statusCode).toBe(200);
        });
    });

    // --- Purchasing ---
    describe('Purchasing Module', () => {
        it('GET /api/purchasing/vendors - should return list', async () => {
            const res = await request(app).get('/api/purchasing/vendors');
            expect(res.statusCode).toBe(200);
        });

        it('POST /api/purchasing/vendors - should create vendor', async () => {
            const res = await request(app).post('/api/purchasing/vendors').send({
                companyName: 'Jest Vendor',
                email: 'vendor@test.com'
            });
            expect(res.statusCode).toBe(201);
        });

        it('GET /api/purchasing/purchase-orders - should return list', async () => {
            const res = await request(app).get('/api/purchasing/purchase-orders');
            expect(res.statusCode).toBe(200);
        });
    });

    // --- System ---
    describe('System Module', () => {
        it('GET /api/system/company-profile - should return profile', async () => {
            const res = await request(app).get('/api/system/company-profile');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('name');
        });

        it('GET /api/system/logs - should return logs', async () => {
            const res = await request(app).get('/api/system/logs');
            expect(res.statusCode).toBe(200);
        });
    });
});
