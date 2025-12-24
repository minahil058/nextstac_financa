import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
    console.log('--- Starting API Tests ---');

    try {
        // 1. Health Check
        console.log('\n[TEST 1] GET /health');
        const healthRes = await fetch(`${BASE_URL}/health`);
        const healthData = await healthRes.json();
        console.log('Status:', healthRes.status);
        console.log('Response:', healthData);
        if (healthRes.status !== 200) throw new Error('Health check failed');

        // 2. Auth Login (Mock)
        console.log('\n[TEST 2] POST /auth/login');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@test.com', password: 'password' })
        });
        const loginData = await loginRes.json();
        console.log('Status:', loginRes.status);
        console.log('User:', loginData.user ? loginData.user.email : 'No user');
        if (loginRes.status !== 200) throw new Error('Login failed');

        // 3. Get Employees
        console.log('\n[TEST 3] GET /hr/employees');
        const getEmpRes = await fetch(`${BASE_URL}/hr/employees`);
        const employees = await getEmpRes.json();
        console.log('Status:', getEmpRes.status);
        console.log('Employee Count:', employees.length);
        if (getEmpRes.status !== 200) throw new Error('Get Employees failed');

        // 4. Create Employee
        console.log('\n[TEST 4] POST /hr/employees');
        const newEmpPayload = {
            firstName: 'Test',
            lastName: 'User',
            email: `testuser-${Date.now()}@example.com`,
            position: 'Tester',
            department: 'Development',
            salary: 60000
        };
        const createRes = await fetch(`${BASE_URL}/hr/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEmpPayload)
        });
        const createdEmp = await createRes.json();
        console.log('Status:', createRes.status);
        console.log('Created ID:', createdEmp.id);
        if (createRes.status !== 201) throw new Error('Create Employee failed');

        // 5. Update Employee
        console.log(`\n[TEST 5] PUT /hr/employees/${createdEmp.id}`);
        const updateRes = await fetch(`${BASE_URL}/hr/employees/${createdEmp.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ updates: { status: 'On Leave', salary: 65000 } })
        });
        const updatedEmp = await updateRes.json();
        console.log('Status:', updateRes.status);
        console.log('Updated Status:', updatedEmp.status);
        if (updatedEmp.status !== 'On Leave') throw new Error('Update Employee failed');

        // 6. Delete Employee
        console.log(`\n[TEST 6] DELETE /hr/employees/${createdEmp.id}`);
        const deleteRes = await fetch(`${BASE_URL}/hr/employees/${createdEmp.id}`, { method: 'DELETE' });
        console.log('Status:', deleteRes.status);
        if (deleteRes.status !== 200) throw new Error('Delete Employee failed');

        console.log('\n--- ALL TESTS PASSED ---');

    } catch (error) {
        console.error('\n!!! TEST FAILED !!!');
        console.error(error);
        process.exit(1);
    }
};

runTests();
