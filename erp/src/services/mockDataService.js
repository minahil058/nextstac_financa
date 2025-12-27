import { faker } from '@faker-js/faker';
import { chartOfAccounts } from '../data/chartOfAccounts';

const API_URL = 'http://localhost:5000/api';

const STORAGE_KEYS = {
    EMPLOYEES: 'erp_mock_employees_v3_force_fix', // Bumped key to force re-seed
    PRODUCTS: 'erp_mock_products',
    CUSTOMERS: 'erp_mock_customers',
    VENDORS: 'erp_mock_vendors',
};

// Helper to get or seed data
const getOrSeed = (key, seedFn, count = 10) => {
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.warn(`Failed to parse ${key}, reseeding.`);
        }
    }
    const data = Array.from({ length: count }, seedFn);
    localStorage.setItem(key, JSON.stringify(data));
    return data;
};

export const mockDataService = {
    // Users (RBAC)
    getUsers: () => {
        const key = 'erp_mock_users_v2';
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
                console.warn('Detected corrupted mock user data, re-seeding...');
                localStorage.removeItem(key);
            } else {
                return parsed;
            }
        }

        const users = [
            {
                id: '1',
                name: 'Super Admin',
                email: 'admin@test.com',
                password: 'password',
                role: 'super_admin',
                status: 'Active',
                avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff'
            },
            {
                id: '2',
                name: 'E-commerce Manager',
                email: 'ecom@test.com',
                password: 'password',
                role: 'ecommerce_admin',
                status: 'Active',
                avatar: 'https://ui-avatars.com/api/?name=Ecom+Admin&background=10b981&color=fff'
            },
            {
                id: '3',
                name: 'Dev Admin',
                email: 'dev@test.com',
                password: 'password',
                role: 'dev_admin',
                status: 'Active',
                avatar: 'https://ui-avatars.com/api/?name=Dev+Admin&background=f59e0b&color=fff'
            }
        ];

        localStorage.setItem(key, JSON.stringify(users));
        return users;
    },

    // Admin Alias & Helpers
    getAdmins: () => mockDataService.getUsers(),

    addAdmin: (admin) => {
        const users = mockDataService.getUsers();
        const newAdmin = {
            id: faker.string.uuid(),
            password: 'password', // Default
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=random`,
            status: 'Active',
            sharePercentage: 0,
            ...admin
        };
        users.push(newAdmin);
        localStorage.setItem('erp_mock_users_v2', JSON.stringify(users));
        return { success: true, data: newAdmin };
    },

    updateAdmin: (id, updates) => {
        const users = mockDataService.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('erp_mock_users_v2', JSON.stringify(users));
            return { success: true, data: users[index] };
        }
        return { success: false, error: 'User not found' };
    },

    deleteAdmin: (id) => {
        const users = mockDataService.getUsers();
        const newUsers = users.filter(u => u.id !== id);
        localStorage.setItem('erp_mock_users_v2', JSON.stringify(newUsers));
        return { success: true };
    },

    // Compensation Config
    getCompensationConfig: () => {
        const key = 'erp_mock_comp_config';
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);

        const config = { basePool: 50000 };
        localStorage.setItem(key, JSON.stringify(config));
        return config;
    },

    updateCompensationConfig: (updates) => {
        const config = mockDataService.getCompensationConfig();
        const newConfig = { ...config, ...updates };
        localStorage.setItem('erp_mock_comp_config', JSON.stringify(newConfig));
        return { success: true, data: newConfig };
    },

    // Employees
    getEmployees: () => {
        return getOrSeed(STORAGE_KEYS.EMPLOYEES, () => {
            // Create a fixed set of employees for testing specific departments
            const fixedDepts = ['Development', 'Ecommerce'];
            const dept = faker.helpers.arrayElement([...fixedDepts, faker.commerce.department()]);

            return {
                id: faker.string.uuid(),
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
                position: faker.person.jobTitle(),
                department: dept, // Mix of fixed and random depts
                salary: faker.finance.amount({ min: 30000, max: 120000, dec: 0 }),
                joinDate: faker.date.past({ years: 5 }).toISOString(),
                status: faker.helpers.arrayElement(['Active', 'On Leave', 'Terminated']),
                avatar: faker.image.url(),
                phone: faker.phone.number(),
                address: faker.location.city() + ', ' + faker.location.country(),
            };
        }, 20);
    },

    addEmployee: (employee) => {
        const employees = mockDataService.getEmployees();
        const newEmployee = {
            id: faker.string.uuid(),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.firstName + ' ' + employee.lastName)}&background=random`,
            ...employee
        };
        employees.unshift(newEmployee);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
        return { success: true, data: newEmployee };
    },

    updateEmployee: (id, updates) => {
        const employees = mockDataService.getEmployees();
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
            return { success: true, data: employees[index] };
        }
        return { success: false, error: 'Employee not found' };
    },

    deleteEmployee: (id) => {
        const employees = mockDataService.getEmployees();
        const newEmployees = employees.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(newEmployees));
        return { success: true };
    },

    // --- INVENTORY ---
    getProducts: async () => {
        const response = await fetch(`${API_URL}/inventory/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    addProduct: async (product) => {
        const response = await fetch(`${API_URL}/inventory/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Failed to add product');
        return { success: true, data: await response.json() };
    },

    updateProduct: async (id, updates) => {
        // Frontend sends { id, data: updates } or similar. Adjust to API expectations.
        const response = await fetch(`${API_URL}/inventory/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates }),
        });
        if (!response.ok) throw new Error('Failed to update product');
        return { success: true, data: await response.json() };
    },

    deleteProduct: async (id) => {
        const response = await fetch(`${API_URL}/inventory/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return { success: true };
    },

    // --- FINANCE: INVOICES ---
    getInvoices: async () => {
        const response = await fetch(`${API_URL}/finance/invoices`);
        if (!response.ok) throw new Error('Failed to fetch invoices');
        return response.json();
    },

    addInvoice: async (invoice) => {
        const response = await fetch(`${API_URL}/finance/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoice),
        });
        if (!response.ok) throw new Error('Failed to add invoice');
        return { success: true, data: await response.json() };
    },

    updateInvoiceStatus: async (id, status) => {
        const response = await fetch(`${API_URL}/finance/invoices/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update invoice status');
        return { success: true, data: await response.json() };
    },

    deleteInvoice: async (id) => {
        const response = await fetch(`${API_URL}/finance/invoices/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete invoice');
        return { success: true };
    },

    // --- FINANCE: PAYMENTS ---
    getPayments: async () => {
        const response = await fetch(`${API_URL}/finance/payments`);
        if (!response.ok) throw new Error('Failed to fetch payments');
        return response.json();
    },

    addPayment: async (payment) => {
        const response = await fetch(`${API_URL}/finance/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment),
        });
        if (!response.ok) throw new Error('Failed to add payment');
        return { success: true, data: await response.json() };
    },

    updatePaymentStatus: async (id, status) => {
        const response = await fetch(`${API_URL}/finance/payments/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update payment status');
        return { success: true, data: await response.json() };
    },

    deletePayment: async (id) => {
        const response = await fetch(`${API_URL}/finance/payments/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete payment');
        return { success: true };
    },

    // Vendors
    getVendors: () => {
        return getOrSeed(STORAGE_KEYS.VENDORS, () => ({
            id: faker.string.uuid(),
            companyName: faker.company.name(),
            contactPerson: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            rating: faker.number.int({ min: 1, max: 5 }),
            status: faker.helpers.arrayElement(['Active', 'Inactive'])
        }), 8);
    },

    addVendor: (vendor) => {
        const vendors = mockDataService.getVendors();
        const newVendor = {
            id: faker.string.uuid(),
            status: 'Active',
            rating: 5,
            ...vendor
        };
        vendors.unshift(newVendor);
        localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
        return { success: true, data: newVendor };
    },

    updateVendor: (id, updates) => {
        const vendors = mockDataService.getVendors();
        const index = vendors.findIndex(v => v.id === id);
        if (index !== -1) {
            vendors[index] = { ...vendors[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
            return { success: true, data: vendors[index] };
        }
        return { success: false, error: 'Vendor not found' };
    },

    deleteVendor: (id) => {
        const vendors = mockDataService.getVendors();
        const newVendors = vendors.filter(v => v.id !== id);
        localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(newVendors));
        return { success: true };
    },

    // Purchase Orders
    getPurchaseOrders: () => {
        return getOrSeed('erp_mock_purchase_orders', () => ({
            id: faker.string.uuid(),
            poNumber: `PO-${faker.string.numeric(5)}`,
            vendor: faker.company.name(),
            date: faker.date.recent({ days: 45 }).toISOString(),
            expectedDate: faker.date.soon({ days: 15 }).toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 500, max: 10000, dec: 2 })),
            status: faker.helpers.arrayElement(['Draft', 'Ordered', 'Received', 'Cancelled']),
        }), 15);
    },

    addPurchaseOrder: (order) => {
        const orders = mockDataService.getPurchaseOrders();
        const newOrder = {
            id: faker.string.uuid(),
            poNumber: `PO-${faker.string.numeric(5)}`,
            status: 'Draft',
            ...order
        };
        orders.unshift(newOrder);
        localStorage.setItem('erp_mock_purchase_orders', JSON.stringify(orders));
        return { success: true, data: newOrder };
    },

    updatePurchaseOrder: (id, updates) => {
        const orders = mockDataService.getPurchaseOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates };
            localStorage.setItem('erp_mock_purchase_orders', JSON.stringify(orders));
            return { success: true, data: orders[index] };
        }
        return { success: false, error: 'Order not found' };
    },

    deletePurchaseOrder: (id) => {
        const orders = mockDataService.getPurchaseOrders();
        const newOrders = orders.filter(o => o.id !== id);
        localStorage.setItem('erp_mock_purchase_orders', JSON.stringify(newOrders));
        return { success: true };
    },

    // Bills
    getBills: () => {
        return getOrSeed('erp_mock_bills', () => ({
            id: faker.string.uuid(),
            billNumber: `BILL-${faker.string.numeric(5)}`,
            vendor: faker.company.name(),
            date: faker.date.recent({ days: 30 }).toISOString(),
            dueDate: faker.date.soon({ days: 30 }).toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 100, max: 5000, dec: 2 })),
            status: faker.helpers.arrayElement(['Paid', 'Pending', 'Overdue']),
        }), 15);
    },

    addBill: (bill) => {
        const bills = mockDataService.getBills();
        const newBill = {
            id: faker.string.uuid(),
            billNumber: `BILL-${faker.string.numeric(5)}`,
            status: 'Pending',
            ...bill
        };
        bills.unshift(newBill);
        localStorage.setItem('erp_mock_bills', JSON.stringify(bills));
        return { success: true, data: newBill };
    },

    updateBill: (id, updates) => {
        const bills = mockDataService.getBills();
        const index = bills.findIndex(b => b.id === id);
        if (index !== -1) {
            bills[index] = { ...bills[index], ...updates };
            localStorage.setItem('erp_mock_bills', JSON.stringify(bills));
            return { success: true, data: bills[index] };
        }
        return { success: false, error: 'Bill not found' };
    },

    deleteBill: (id) => {
        const bills = mockDataService.getBills();
        const newBills = bills.filter(b => b.id !== id);
        localStorage.setItem('erp_mock_bills', JSON.stringify(newBills));
        return { success: true };
    },

    // --- CRM: CUSTOMERS ---
    getCustomers: async () => {
        const response = await fetch(`${API_URL}/crm/customers`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        return response.json();
    },

    addCustomer: async (customer) => {
        const response = await fetch(`${API_URL}/crm/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customer),
        });
        if (!response.ok) throw new Error('Failed to add customer');
        return { success: true, data: await response.json() };
    },

    updateCustomer: async (id, updates) => {
        const response = await fetch(`${API_URL}/crm/customers/${id}`, {
            method: 'PUT', // Route uses PUT
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates }),
        });
        if (!response.ok) throw new Error('Failed to update customer');
        return { success: true, data: await response.json() };
    },

    deleteCustomer: async (id) => {
        const response = await fetch(`${API_URL}/crm/customers/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete customer');
        return { success: true };
    },

    // Orders (Sales)
    getOrders: () => {
        return getOrSeed('erp_mock_orders', () => ({
            id: faker.string.uuid(),
            orderNumber: `ORD-${faker.string.numeric(6)}`,
            customer: faker.person.fullName(),
            date: faker.date.recent({ days: 60 }).toISOString(),
            formattedDate: faker.date.recent().toLocaleDateString(),
            amount: parseFloat(faker.finance.amount({ min: 50, max: 3000, dec: 2 })),
            status: faker.helpers.arrayElement(['Processing', 'Shipped', 'Delivered', 'Cancelled']),
            paymentStatus: faker.helpers.arrayElement(['Paid', 'Unpaid'])
        }), 20);
    },

    // Leads
    getLeads: () => {
        return getOrSeed('erp_mock_leads', () => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            company: faker.company.name(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            source: faker.helpers.arrayElement(['Website', 'Referral', 'Social Media', 'Cold Call']),
            status: faker.helpers.arrayElement(['New', 'Contacted', 'Qualified', 'Lost']),
            value: parseFloat(faker.finance.amount({ min: 1000, max: 50000, dec: 0 }))
        }), 15);
    },

    addLead: (lead) => {
        const leads = mockDataService.getLeads();
        const newLead = {
            id: faker.string.uuid(),
            status: 'New',
            ...lead
        };
        leads.unshift(newLead);
        localStorage.setItem('erp_mock_leads', JSON.stringify(leads));
        return { success: true, data: newLead };
    },

    updateLead: (id, updates) => {
        const leads = mockDataService.getLeads();
        const index = leads.findIndex(l => l.id === id);
        if (index !== -1) {
            leads[index] = { ...leads[index], ...updates };
            localStorage.setItem('erp_mock_leads', JSON.stringify(leads));
            return { success: true, data: leads[index] };
        }
        return { success: false, error: 'Lead not found' };
    },

    deleteLead: (id) => {
        const leads = mockDataService.getLeads();
        const newLeads = leads.filter(l => l.id !== id);
        localStorage.setItem('erp_mock_leads', JSON.stringify(newLeads));
        return { success: true };
    },

    convertLead: (id) => {
        const leads = mockDataService.getLeads();
        const lead = leads.find(l => l.id === id);
        if (lead) {
            mockDataService.addCustomer({
                name: lead.name,
                company: lead.company,
                email: lead.email,
                phone: lead.phone,
                status: 'Active',
                notes: `Converted from lead. Source: ${lead.source}`
            });
            return mockDataService.deleteLead(id);
        }
        return { success: false, error: 'Lead not found' };
    },

    // Follow-ups
    getFollowUps: () => {
        return getOrSeed('erp_mock_followups', () => ({
            id: faker.string.uuid(),
            contact: faker.person.fullName(),
            type: faker.helpers.arrayElement(['Call', 'Email', 'Meeting']),
            date: faker.date.future({ days: 14 }).toISOString(),
            status: faker.helpers.arrayElement(['Scheduled', 'Pending', 'Done']),
            notes: faker.lorem.sentence()
        }), 10);
    },

    // Files (Documents)
    getFiles: () => {
        return getOrSeed('erp_mock_files', () => ({
            id: faker.string.uuid(),
            name: faker.system.commonFileName(faker.helpers.arrayElement(['pdf', 'docx', 'xlsx', 'jpg'])),
            type: faker.system.fileType(),
            size: faker.number.int({ min: 100, max: 10000 }) + ' KB',
            uploadedBy: faker.person.fullName(),
            date: faker.date.recent().toISOString()
        }), 20);
    },

    addFile: (file) => {
        const files = mockDataService.getFiles();
        const newFile = {
            id: faker.string.uuid(),
            date: new Date().toISOString(),
            uploadedBy: 'Current User',
            size: (Math.random() * 5000 + 500).toFixed(0) + ' KB',
            ...file
        };
        files.unshift(newFile);
        localStorage.setItem('erp_mock_files', JSON.stringify(files));
        return { success: true, data: newFile };
    },

    deleteFile: (id) => {
        const files = mockDataService.getFiles();
        const newFiles = files.filter(f => f.id !== id);
        localStorage.setItem('erp_mock_files', JSON.stringify(newFiles));
        return { success: true };
    },

    // Activity Logs
    getLogs: () => {
        return getOrSeed('erp_mock_logs', () => ({
            id: faker.string.uuid(),
            user: faker.person.fullName(),
            action: faker.helpers.arrayElement(['Created Invoice', 'Updated Employee', 'Deleted Product', 'Logged In', 'Exported Report']),
            module: faker.helpers.arrayElement(['Finance', 'HR', 'Inventory', 'Auth']),
            timestamp: faker.date.recent().toISOString(),
            ip: faker.internet.ipv4()
        }), 25);
    },

    // Attendance
    getAttendance: () => {
        return getOrSeed('erp_mock_attendance', () => ({
            id: faker.string.uuid(),
            employeeName: faker.person.fullName(),
            date: faker.date.recent({ days: 14 }).toLocaleDateString(),
            checkIn: '09:00 AM',
            checkOut: '05:00 PM',
            status: faker.helpers.arrayElement(['Present', 'Absent', 'Late', 'Half Day']),
            workHours: '8h 0m'
        }), 20);
    },

    updateAttendance: (id, updates) => {
        const attendance = mockDataService.getAttendance();
        const index = attendance.findIndex(p => p.id === id);
        if (index !== -1) {
            attendance[index] = { ...attendance[index], ...updates };
            // Persist to localStorage
            const records = JSON.parse(localStorage.getItem('erp_mock_attendance'));
            if (records) {
                const storageIndex = records.findIndex(r => r.id === id);
                if (storageIndex !== -1) {
                    records[storageIndex] = { ...records[storageIndex], ...updates };
                    localStorage.setItem('erp_mock_attendance', JSON.stringify(records));
                }
            }
            return attendance[index];
        }
        return null;
    },

    addAttendance: (newRecord) => {
        const attendance = mockDataService.getAttendance();
        const record = {
            id: newRecord.id || Math.floor(Math.random() * 10000),
            workHours: '8h 0m',
            ...newRecord
        };
        attendance.unshift(record);
        localStorage.setItem('erp_mock_attendance', JSON.stringify(attendance));
        return record;
    },

    // Salaries (Payroll)
    getSalaries: () => {
        return getOrSeed('erp_mock_salaries', () => ({
            id: faker.string.uuid(),
            employeeName: faker.person.fullName(),
            paymentDate: faker.date.recent({ days: 30 }).toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 3000, max: 10000, dec: 2 })),
            method: faker.helpers.arrayElement(['Bank Transfer', 'Check']),
            status: faker.helpers.arrayElement(['Paid', 'Pending'])
        }), 15);
    },

    updateSalary: (id, updates) => {
        const salaries = mockDataService.getSalaries();
        const index = salaries.findIndex(s => s.id === id);
        if (index !== -1) {
            salaries[index] = { ...salaries[index], ...updates };
            localStorage.setItem('erp_mock_salaries', JSON.stringify(salaries));
            return { success: true, data: salaries[index] };
        }
        return { success: false, error: 'Salary record not found' };
    },

    // Company Profile
    getCompanyProfile: () => {
        return getOrSeed('erp_mock_company_profile', () => ({
            id: faker.string.uuid(),
            name: 'Financa Tech Global',
            legalName: 'Financa Technologies Pvt Ltd',
            logo: faker.image.url({ width: 200, height: 200 }),
            website: 'www.financa-tech.com',
            email: 'contact@financa-tech.com',
            phone: '+1 (555) 123-4567',
            foundedYear: '2015',
            description: 'Leading provider of enterprise ERP solutions and global e-commerce development. Bridging the gap between modern tech and business efficiency.',
            taxId: 'US-EIN-98-7654321',
            registrationNumber: 'REG-2015-8899',
            vatNumber: 'EU998877665',

            // International Commerce
            currencies: ['USD', 'EUR', 'GBP', 'INR'],
            primaryLanguage: 'English',
            timeZone: 'GMT-5 (EST)',
            operatingRegions: ['North America', 'Europe', 'Asia Pacific'],

            // Dev & Tech
            type: 'Technology & Retail',
            techStack: ['React', 'Node.js', 'Python', 'AWS', 'Shopify Plus'],

            // Address
            headquarters: {
                street: '123 Innovation Drive, Tech Park',
                city: 'San Francisco',
                state: 'CA',
                country: 'USA',
                zip: '94043'
            },

            socials: {
                linkedin: 'linkedin.com/company/financa',
                github: 'github.com/financa-dev',
                twitter: '@financa_tech'
            }
        }), 1)[0];
    },

    // Leave Management
    getAllLeaves: () => {
        const key = 'erp_mock_all_leaves_v4';
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Failed to parse leaves, regenerating.');
            }
        }

        const employees = mockDataService.getEmployees() || [];
        if (employees.length === 0) return [];

        const leaves = [];

        employees.forEach(emp => {
            const count = faker.number.int({ min: 1, max: 5 });
            for (let i = 0; i < count; i++) {
                leaves.push({
                    id: faker.string.uuid(),
                    employeeId: emp.id,
                    employeeName: `${emp.firstName} ${emp.lastName}`,
                    avatar: emp.avatar,
                    position: emp.position,
                    type: faker.helpers.arrayElement(['Sick Leave', 'Vacation', 'Personal', 'Emergency']),
                    startDate: faker.date.past({ years: 1 }).toISOString(),
                    endDate: faker.date.past({ years: 1 }).toISOString(),
                    days: faker.number.int({ min: 1, max: 5 }),
                    reason: faker.lorem.sentence(),
                    status: faker.helpers.arrayElement(['Approved', 'Rejected']),
                    requestedOn: faker.date.past({ years: 1 }).toISOString()
                });
            }
        });

        for (let i = 0; i < 5; i++) {
            const emp = faker.helpers.arrayElement(employees);
            leaves.push({
                id: faker.string.uuid(),
                employeeId: emp.id,
                employeeName: `${emp.firstName} ${emp.lastName}`,
                avatar: emp.avatar,
                position: emp.position,
                type: faker.helpers.arrayElement(['Sick Leave', 'Vacation', 'Personal', 'Emergency']),
                startDate: faker.date.soon({ days: 10 }).toISOString(),
                endDate: faker.date.soon({ days: 15 }).toISOString(),
                days: faker.number.int({ min: 1, max: 5 }),
                reason: faker.lorem.sentence(),
                status: 'Pending',
                requestedOn: faker.date.recent({ days: 2 }).toISOString()
            });
        }

        const sortedLeaves = leaves.sort((a, b) => new Date(b.requestedOn) - new Date(a.requestedOn));
        localStorage.setItem(key, JSON.stringify(sortedLeaves));
        return sortedLeaves;
    },

    getLeaveRequests: () => {
        const all = mockDataService.getAllLeaves();
        return all.filter(l => l.status === 'Pending');
    },

    getEmployeeLeaves: (employeeId) => {
        const all = mockDataService.getAllLeaves();
        return all.filter(l => l.employeeId === employeeId).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    },

    updateLeaveStatus: (id, status) => {
        const all = mockDataService.getAllLeaves();
        const index = all.findIndex(l => l.id === id);
        if (index !== -1) {
            all[index] = { ...all[index], status };
            localStorage.setItem('erp_mock_all_leaves_v3', JSON.stringify(all));
            return all[index];
        }
        return null;
    },

    processPayroll: (period) => {
        const salaries = mockDataService.getSalaries();
        const newRecords = Array.from({ length: 5 }).map(() => ({
            id: faker.string.uuid(),
            employeeName: faker.person.fullName(),
            paymentDate: new Date().toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 3000, max: 10000, dec: 2 })),
            method: 'Bank Transfer',
            status: 'Pending'
        }));

        salaries.unshift(...newRecords);
        localStorage.setItem('erp_mock_salaries', JSON.stringify(salaries));
        return newRecords;
    },

    getSalaryHistory: (employeeId) => {
        const key = `erp_mock_salary_history_${employeeId || 'default'}`;
        return getOrSeed(key, () => ({
            id: faker.string.uuid(),
            employeeId: employeeId,
            amount: parseFloat(faker.finance.amount({ min: 40000, max: 90000, dec: 0 })),
            effectiveDate: faker.date.past({ years: 3 }).toISOString(),
            reason: faker.helpers.arrayElement(['Initial Offer', 'Annual Review', 'Promotion', 'Market Adjustment']),
        }), 5).sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    },

    // Accounts (Finance)
    getAccounts: () => {
        return getOrSeed('erp_mock_accounts', null, 0) || (() => {
            localStorage.setItem('erp_mock_accounts', JSON.stringify(chartOfAccounts));
            return chartOfAccounts;
        })();
    },

    // Transactions (Finance)
    getTransactions: () => {
        return getOrSeed('erp_mock_transactions', () => {
            const accounts = chartOfAccounts;
            const debitAccount = faker.helpers.arrayElement(accounts.filter(a => a.normalBalance === 'Debit'));
            const creditAccount = faker.helpers.arrayElement(accounts.filter(a => a.normalBalance === 'Credit'));

            return {
                id: faker.string.uuid(),
                date: faker.date.recent({ days: 90 }).toISOString(),
                description: faker.finance.transactionDescription(),
                amount: parseFloat(faker.finance.amount({ min: 100, max: 10000, dec: 2 })),
                debit_account_id: debitAccount.id,
                credit_account_id: creditAccount.id,
                debitAccount: debitAccount,
                creditAccount: creditAccount
            };
        }, 50);
    },

    addTransaction: (transaction) => {
        const transactions = mockDataService.getTransactions();
        const newTransaction = {
            id: faker.string.uuid(),
            ...transaction,
            date: transaction.date || new Date().toISOString()
        };
        transactions.unshift(newTransaction);
        localStorage.setItem('erp_mock_transactions', JSON.stringify(transactions));
        return { success: true, data: newTransaction };
    },

    resetData: () => {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        const customKeys = [
            'erp_mock_accounts', 'erp_mock_files', 'erp_mock_logs', 'erp_mock_transactions',
            'erp_mock_admins', 'erp_mock_branches', 'erp_mock_departments', 'erp_mock_attendance',
            'erp_mock_salaries', 'erp_mock_leave', 'erp_mock_warehouses', 'erp_mock_stock_movements'
        ];
        customKeys.forEach(key => localStorage.removeItem(key));
        window.location.reload();
    },

    // --- Phase 2: New Modules ---

    // --- Branches ---
    getBranches: () => {
        return getOrSeed('erp_mock_branches', () => ({
            id: faker.string.uuid(),
            name: faker.location.city() + ' Branch',
            manager: faker.person.fullName(),
            address: faker.location.streetAddress(),
            phone: faker.phone.number(),
            status: 'Active'
        }), 5);
    },

    addBranch: (branch) => {
        const branches = mockDataService.getBranches();
        const newBranch = {
            id: faker.string.uuid(),
            ...branch,
            status: 'Active'
        };
        branches.push(newBranch);
        localStorage.setItem('erp_mock_branches', JSON.stringify(branches));
        return { success: true, data: newBranch };
    },

    updateBranch: (id, updates) => {
        const branches = mockDataService.getBranches();
        const index = branches.findIndex(b => b.id === id);
        if (index !== -1) {
            branches[index] = { ...branches[index], ...updates };
            localStorage.setItem('erp_mock_branches', JSON.stringify(branches));
            return { success: true, data: branches[index] };
        }
        return { success: false, error: 'Branch not found' };
    },

    // --- Departments ---
    getDepartments: () => {
        return getOrSeed('erp_mock_departments', () => ({
            id: faker.string.uuid(),
            name: faker.commerce.department(),
            head: faker.person.fullName(),
            employeeCount: faker.number.int({ min: 5, max: 50 }),
            budget: parseFloat(faker.finance.amount({ min: 50000, max: 500000, dec: 2 }))
        }), 8);
    },

    addDepartment: (dept) => {
        const departments = mockDataService.getDepartments();
        const newDept = {
            id: faker.string.uuid(),
            ...dept,
            employeeCount: 0
        };
        departments.push(newDept);
        localStorage.setItem('erp_mock_departments', JSON.stringify(departments));
        return { success: true, data: newDept };
    },

    updateDepartment: (id, updates) => {
        const departments = mockDataService.getDepartments();
        const index = departments.findIndex(d => d.id === id);
        if (index !== -1) {
            departments[index] = { ...departments[index], ...updates };
            localStorage.setItem('erp_mock_departments', JSON.stringify(departments));
            return { success: true, data: departments[index] };
        }
        return { success: false, error: 'Department not found' };
    },

    deleteDepartment: (id) => {
        const departments = mockDataService.getDepartments();
        const newDepartments = departments.filter(d => d.id !== id);
        localStorage.setItem('erp_mock_departments', JSON.stringify(newDepartments));
        return { success: true };
    },

    // --- Warehouses ---
    getWarehouses: () => {
        return getOrSeed('erp_mock_warehouses', () => ({
            id: faker.string.uuid(),
            name: faker.location.city() + ' Warehouse',
            location: faker.location.streetAddress(),
            capacity: faker.number.int({ min: 1000, max: 10000 }),
            manager: faker.person.fullName(),
            status: 'Active',
            contactNumber: faker.phone.number()
        }), 4);
    },

    addWarehouse: (warehouse) => {
        const warehouses = mockDataService.getWarehouses();
        const newWarehouse = {
            id: faker.string.uuid(),
            status: 'Active',
            ...warehouse
        };
        warehouses.push(newWarehouse);
        localStorage.setItem('erp_mock_warehouses', JSON.stringify(warehouses));
        return { success: true, data: newWarehouse };
    },

    updateWarehouse: (id, updates) => {
        const warehouses = mockDataService.getWarehouses();
        const index = warehouses.findIndex(w => w.id === id);
        if (index !== -1) {
            warehouses[index] = { ...warehouses[index], ...updates };
            localStorage.setItem('erp_mock_warehouses', JSON.stringify(warehouses));
            return { success: true, data: warehouses[index] };
        }
        return { success: false, error: 'Warehouse not found' };
    },

    deleteWarehouse: (id) => {
        const warehouses = mockDataService.getWarehouses();
        const newWarehouses = warehouses.filter(w => w.id !== id);
        localStorage.setItem('erp_mock_warehouses', JSON.stringify(newWarehouses));
        return { success: true };
    },

    // --- Stock Movements ---
    getStockMovements: () => {
        return getOrSeed('erp_mock_stock_movements', () => {
            const products = mockDataService.getProducts();
            const product = faker.helpers.arrayElement(products);
            return {
                id: faker.string.uuid(),
                productId: product?.id || faker.string.uuid(),
                productName: product?.name || 'Generic Item',
                sku: product?.sku || 'SKU-000',
                type: faker.helpers.arrayElement(['In', 'Out', 'Adjustment']),
                quantity: faker.number.int({ min: 1, max: 100 }),
                date: faker.date.recent().toISOString(),
                reason: faker.helpers.arrayElement(['Purchase', 'Sale', 'Damage', 'Correction']),
                reference: `REF-${faker.string.alphanumeric(6).toUpperCase()}`
            };
        }, 30);
    },

    // --- Returns ---
    getReturns: () => {
        return getOrSeed('erp_mock_returns', () => ({
            id: faker.string.uuid(),
            returnNumber: `RET-${faker.string.numeric(5)}`,
            referenceInvoice: `INV-${faker.string.numeric(5)}`,
            entityName: faker.company.name(),
            type: faker.helpers.arrayElement(['Credit Note', 'Debit Note']), // Credit = Sales Return, Debit = Purchase Return
            date: faker.date.recent({ days: 60 }).toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 50, max: 2000, dec: 2 })),
            reason: faker.helpers.arrayElement(['Damaged Goods', 'Incorrect Item', 'Defective', 'Overcharged', 'Cancelled']),
            status: faker.helpers.arrayElement(['Pending', 'Approved', 'Processed', 'Rejected'])
        }), 20);
    },

    addReturn: (returnData) => {
        const returns = mockDataService.getReturns();
        const newReturn = {
            id: faker.string.uuid(),
            returnNumber: `RET-${faker.string.numeric(5)}`,
            date: new Date().toISOString(),
            status: 'Pending',
            ...returnData
        };
        returns.unshift(newReturn);
        localStorage.setItem('erp_mock_returns', JSON.stringify(returns));
        return { success: true, data: newReturn };
    },

    updateReturnStatus: (id, status) => {
        const returns = mockDataService.getReturns();
        const index = returns.findIndex(r => r.id === id);
        if (index !== -1) {
            returns[index].status = status;
            localStorage.setItem('erp_mock_returns', JSON.stringify(returns));
            return { success: true, data: returns[index] };
        }
        return { success: false, error: 'Return not found' };
    },

    addStockMovement: (movement) => {
        const movements = mockDataService.getStockMovements();
        const newMovement = {
            id: faker.string.uuid(),
            date: new Date().toISOString(),
            ...movement
        };
        movements.unshift(newMovement);
        localStorage.setItem('erp_mock_stock_movements', JSON.stringify(movements));
        return { success: true, data: newMovement };
    },

    // --- Accounting / Journal ---
    getAccounts: () => {
        // Return flattened accounts list or structured based on chartOfAccounts
        // Assuming chartOfAccounts is array of { id, name, type, ... }
        return chartOfAccounts;
    },

    getTransactions: () => {
        return getOrSeed('erp_mock_transactions', () => {
            const accounts = chartOfAccounts;
            const debitAcc = faker.helpers.arrayElement(accounts.filter(a => a.type === 'Asset' || a.type === 'Expense'));
            const creditAcc = faker.helpers.arrayElement(accounts.filter(a => a.type === 'Liability' || a.type === 'Revenue' || a.type === 'Equity'));

            return {
                id: faker.string.uuid(),
                date: faker.date.recent({ days: 30 }).toISOString(),
                description: faker.finance.transactionDescription(),
                amount: parseFloat(faker.finance.amount({ min: 100, max: 5000, dec: 2 })),
                debit_account_id: debitAcc?.id,
                credit_account_id: creditAcc?.id,
                debitAccount: debitAcc,
                creditAccount: creditAcc,
                reference: `JRN-${faker.string.numeric(5)}`
            };
        }, 15);
    },

    addTransaction: (transaction) => {
        const transactions = mockDataService.getTransactions();
        const newTransaction = {
            id: faker.string.uuid(),
            reference: `JRN-${faker.string.numeric(5)}`,
            ...transaction
        };
        transactions.unshift(newTransaction);
        localStorage.setItem('erp_mock_transactions', JSON.stringify(transactions));
        return { success: true, data: newTransaction };
    },

    // Vendors
    getVendors: () => {
        return getOrSeed('erp_mock_vendors', () => ({
            id: faker.string.uuid(),
            companyName: faker.company.name(),
            contactPerson: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            status: faker.helpers.arrayElement(['Active', 'Inactive']),
            rating: faker.number.int({ min: 3, max: 5 })
        }), 12);
    },

    addVendor: (vendor) => {
        const vendors = mockDataService.getVendors();
        const newVendor = {
            id: faker.string.uuid(),
            status: 'Active',
            rating: 5,
            ...vendor
        };
        vendors.unshift(newVendor);
        localStorage.setItem('erp_mock_vendors', JSON.stringify(vendors));
        return { success: true, data: newVendor };
    },

    updateVendor: (id, updates) => {
        const vendors = mockDataService.getVendors();
        const index = vendors.findIndex(v => v.id === id);
        if (index !== -1) {
            vendors[index] = { ...vendors[index], ...updates };
            localStorage.setItem('erp_mock_vendors', JSON.stringify(vendors));
            return { success: true, data: vendors[index] };
        }
        return { success: false, error: 'Vendor not found' };
    },

    deleteVendor: (id) => {
        const vendors = mockDataService.getVendors();
        const newVendors = vendors.filter(v => v.id !== id);
        localStorage.setItem('erp_mock_vendors', JSON.stringify(newVendors));
        return { success: true };
    },

    // Orders Actions
    addOrder: (order) => {
        const orders = mockDataService.getOrders();
        const newOrder = {
            id: faker.string.uuid(),
            orderNumber: `ORD-${faker.string.numeric(6)}`,
            status: 'Processing',
            paymentStatus: 'Pending',
            date: new Date().toISOString(),
            ...order
        };
        orders.unshift(newOrder);
        localStorage.setItem('erp_mock_orders', JSON.stringify(orders));
        return { success: true, data: newOrder };
    },

    updateOrderStatus: (id, status) => {
        const orders = mockDataService.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], status };
            localStorage.setItem('erp_mock_orders', JSON.stringify(orders));
            return { success: true, data: orders[index] };
        }
        return { success: false, error: 'Order not found' };
    },

    updateOrderPaymentStatus: (id, status) => {
        const orders = mockDataService.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], paymentStatus: status };
            localStorage.setItem('erp_mock_orders', JSON.stringify(orders));
            return { success: true, data: orders[index] };
        }
        return { success: false, error: 'Order not found' };
    },

    deleteOrder: (id) => {
        const orders = mockDataService.getOrders();
        const newOrders = orders.filter(o => o.id !== id);
        localStorage.setItem('erp_mock_orders', JSON.stringify(newOrders));
        return { success: true };
    }
};
