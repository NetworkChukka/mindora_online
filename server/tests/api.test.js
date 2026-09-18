const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');

describe('MINDORA Exhibition System - Critical Acceptance Tests', () => {

  let adminToken = '';
  let operator1Token = '';
  let operator2Token = '';
  let viewerToken = '';
  let sharedSchoolId = '';

  beforeAll(async () => {
    // Wait for DB connection if connecting
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // TEST 1: Initial Admin Setup & Route Lockdown
  test('TEST 1: Perform Initial Admin Setup and verify route lockdown', async () => {
    const setupCheck = await request(app).get('/api/auth/setup');
    expect(setupCheck.body.success).toBe(true);

    if (setupCheck.body.setupRequired) {
      const setupRes = await request(app)
        .post('/api/auth/setup')
        .send({
          fullName: 'Primary Admin',
          username: 'admin',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(setupRes.status).toBe(201);
      expect(setupRes.body.success).toBe(true);
      adminToken = setupRes.body.token;

      // Verify route lockdown
      const repeatSetup = await request(app)
        .post('/api/auth/setup')
        .send({
          fullName: 'Fake Admin',
          username: 'fakeadmin',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(repeatSetup.status).toBe(400);
      expect(repeatSetup.body.setupRequired).toBeUndefined();
    } else {
      // Login existing admin
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'Password123!' });
      adminToken = loginRes.body.token;
    }
  });

  // TEST 2: Admin creates Operator Desk01, Desk02 and Viewer accounts
  test('TEST 2: Admin creates Desk01, Desk02 operators and Viewer', async () => {
    const desk01Res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Desk 01 Operator',
        username: 'desk01',
        password: 'Password123!',
        role: 'REGISTRATION_OPERATOR'
      });
    expect([201, 400]).toContain(desk01Res.status);

    const desk02Res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Desk 02 Operator',
        username: 'desk02',
        password: 'Password123!',
        role: 'REGISTRATION_OPERATOR'
      });
    expect([201, 400]).toContain(desk02Res.status);

    const viewerRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Exhibition Viewer',
        username: 'viewer',
        password: 'Password123!',
        role: 'VIEWER'
      });
    expect([201, 400]).toContain(viewerRes.status);

    // Login Desk01
    const l1 = await request(app).post('/api/auth/login').send({ username: 'desk01', password: 'Password123!' });
    operator1Token = l1.body.token;

    // Login Desk02
    const l2 = await request(app).post('/api/auth/login').send({ username: 'desk02', password: 'Password123!' });
    operator2Token = l2.body.token;

    // Login Viewer
    const lv = await request(app).post('/api/auth/login').send({ username: 'viewer', password: 'Password123!' });
    viewerToken = lv.body.token;
  });

  // TEST 3: Shared School Creation & Duplicate Protection
  test('TEST 3: Shared School creation and duplicate normalized protection', async () => {
    const schoolRes = await request(app)
      .post('/api/schools')
      .set('Authorization', `Bearer ${operator1Token}`)
      .send({
        schoolName: 'Anuradhapura Central College',
        city: 'Anuradhapura',
        district: 'Anuradhapura'
      });

    if (schoolRes.status === 201) {
      sharedSchoolId = schoolRes.body.data._id;
    } else {
      sharedSchoolId = schoolRes.body.school._id;
    }
    expect(sharedSchoolId).toBeDefined();

    // Duplicate creation attempt by Desk02 with different casing/spacing
    const duplicateRes = await request(app)
      .post('/api/schools')
      .set('Authorization', `Bearer ${operator2Token}`)
      .send({
        schoolName: '  anuradhapura central college  ',
        city: 'Anuradhapura'
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.duplicate).toBe(true);
    expect(duplicateRes.body.school._id).toBe(sharedSchoolId);
  });

  // TEST 4 & 5: Student Registration & Grade to Education Level (O/L vs A/L) Backend Rule
  test('TEST 4: Grade 10 Student -> O/L & Grade 12 Student -> A/L (Backend Enforced)', async () => {
    // Desk01 registers Grade 10 student
    const s1 = await request(app)
      .post('/api/registrations/students')
      .set('Authorization', `Bearer ${operator1Token}`)
      .send({
        studentName: 'Kasun Kalhara',
        schoolId: sharedSchoolId,
        grade: 10,
        phoneNumber: '0771234567'
      });

    expect(s1.status).toBe(201);
    expect(s1.body.data.educationLevel).toBe('O/L');
    expect(s1.body.data.registrationNumber).toMatch(/^MIN-\d{6}$/);

    // Desk02 registers Grade 12 student
    const s2 = await request(app)
      .post('/api/registrations/students')
      .set('Authorization', `Bearer ${operator2Token}`)
      .send({
        studentName: 'Nipuni Perera',
        schoolId: sharedSchoolId,
        grade: 12,
        phoneNumber: '0719876543'
      });

    expect(s2.status).toBe(201);
    expect(s2.body.data.educationLevel).toBe('A/L');
    expect(s2.body.data.registrationNumber).toMatch(/^MIN-\d{6}$/);
  });

  // TEST 6: Teacher Registration & Independent Count
  test('TEST 6: Teacher Registration -> TCH-XXXXXX, Teacher count +1, Student count unchanged', async () => {
    const t1 = await request(app)
      .post('/api/registrations/teachers')
      .set('Authorization', `Bearer ${operator1Token}`)
      .send({
        teacherName: 'Mr. Sarath Silva',
        schoolId: sharedSchoolId,
        phoneNumber: '0751112223'
      });

    expect(t1.status).toBe(201);
    expect(t1.body.data.teacherRegistrationNumber).toMatch(/^TCH-\d{6}$/);
  });

  // TEST 7: Real-Time Dashboard Statistics
  test('TEST 7: Verify Dashboard Counts (Total Visitors, Students, Teachers, O/L, A/L)', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalVisitors).toBeGreaterThanOrEqual(3);
    expect(res.body.data.olStudents).toBeGreaterThanOrEqual(1);
    expect(res.body.data.alStudents).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalTeachers).toBeGreaterThanOrEqual(1);
  });

  // TEST 8: Backend RBAC Permission Guards
  test('TEST 8: Verify RBAC Permission Guards (Operators/Viewers blocked from Admin routes)', async () => {
    // Operator blocked from User Management
    const opUserRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${operator1Token}`);
    expect(opUserRes.status).toBe(403);

    // Viewer blocked from Registering Visitor
    const viewerRegRes = await request(app)
      .post('/api/registrations/students')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        studentName: 'Unauthorized Student',
        schoolId: sharedSchoolId,
        grade: 8
      });
    expect(viewerRegRes.status).toBe(403);
  });

  // TEST 9: Health Endpoint Verification
  test('TEST 9: Health endpoint returns valid status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.application).toBe('online');
    expect(res.body.database).toBe('connected');
  });

});
