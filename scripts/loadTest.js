const https = require('https');

const HOST = 'mindora-online-eta.vercel.app';

console.log(`===========================================================`);
console.log(`  MINDORA MULTI-USER LIVE LOAD & CONCURRENCY TEST         `);
console.log(`  Target Host: https://${HOST}`);
console.log(`  Scenario: 10 Concurrent Users (6 Operators + 4 Viewers)   `);
console.log(`===========================================================`);

function makeRequest(path, method = 'GET', body = null, token = '') {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: HOST,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      timeout: 15000
    };

    const startTime = Date.now();
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed, duration });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody, duration });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function runLoadTest() {
  const stats = {
    totalRequests: 0,
    successfulRegistrations: 0,
    successfulReads: 0,
    errors: 0,
    latencies: []
  };

  const startTime = Date.now();
  let token = '';
  let schoolId = '';

  // 1. Initial Setup or Login Check
  try {
    const setupCheck = await makeRequest('/api/auth/setup');
    if (setupCheck.data && setupCheck.data.setupRequired) {
      console.log('Setup required. Creating load test admin...');
      const setupRes = await makeRequest('/api/auth/setup', 'POST', {
        fullName: 'Load Test Admin',
        username: 'loadadmin',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
      token = setupRes.data.token;
    } else {
      const loginRes = await makeRequest('/api/auth/login', 'POST', {
        username: 'admin',
        password: 'Password123!'
      });
      if (loginRes.data.success) {
        token = loginRes.data.token;
      }
    }
  } catch (err) {
    console.warn('Auth check warning:', err.message);
  }

  // 2. Fetch or Create Test School
  if (token) {
    try {
      const schoolRes = await makeRequest('/api/schools', 'POST', {
        schoolName: `Load Test College ${Date.now().toString().slice(-4)}`,
        city: 'Colombo'
      }, token);

      if (schoolRes.data.success) {
        schoolId = schoolRes.data.data._id;
      } else if (schoolRes.data.school) {
        schoolId = schoolRes.data.school._id;
      }
    } catch (err) {
      console.warn('School lookup warning:', err.message);
    }
  }

  // 3. Define Operator Worker (6 Users inputting data concurrently)
  const runOperatorWorker = async (workerId) => {
    const grades = [6, 7, 8, 9, 10, 11, 12, 13];
    for (let i = 0; i < 8; i++) { // 8 registration attempts per operator
      stats.totalRequests++;
      try {
        const isStudent = i % 2 === 0;
        let res;
        if (isStudent && schoolId && token) {
          res = await makeRequest('/api/registrations/students', 'POST', {
            studentName: `Student ${workerId}_${i}_${Date.now().toString().slice(-4)}`,
            schoolId,
            grade: grades[Math.floor(Math.random() * grades.length)],
            phoneNumber: '0771234567'
          }, token);
        } else if (schoolId && token) {
          res = await makeRequest('/api/registrations/teachers', 'POST', {
            teacherName: `Teacher ${workerId}_${i}_${Date.now().toString().slice(-4)}`,
            schoolId,
            phoneNumber: '0751112223'
          }, token);
        } else {
          res = await makeRequest('/api/dashboard/stats');
        }

        stats.latencies.push(res.duration);
        if (res.status === 201 || res.status === 200) {
          stats.successfulRegistrations++;
        } else {
          stats.errors++;
        }
      } catch (err) {
        stats.errors++;
      }
      // Simulate 400ms operator typing delay
      await new Promise(r => setTimeout(r, 400));
    }
  };

  // 4. Define Viewer Worker (4 Users querying live dashboard concurrently)
  const runViewerWorker = async (viewerId) => {
    for (let i = 0; i < 12; i++) { // 12 read attempts per viewer
      stats.totalRequests++;
      try {
        const res = await makeRequest('/api/dashboard/stats');
        stats.latencies.push(res.duration);
        if (res.status === 200) {
          stats.successfulReads++;
        } else {
          stats.errors++;
        }
      } catch (err) {
        stats.errors++;
      }
      await new Promise(r => setTimeout(r, 350));
    }
  };

  console.log('🚀 Executing 10 Concurrent Load Workers simultaneously...');

  // Launch 10 Workers simultaneously
  const workers = [
    runOperatorWorker(1),
    runOperatorWorker(2),
    runOperatorWorker(3),
    runOperatorWorker(4),
    runOperatorWorker(5),
    runOperatorWorker(6),
    runViewerWorker(1),
    runViewerWorker(2),
    runViewerWorker(3),
    runViewerWorker(4)
  ];

  await Promise.all(workers);

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const avgLatency = (stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length || 0).toFixed(0);
  const minLatency = Math.min(...stats.latencies);
  const maxLatency = Math.max(...stats.latencies);
  const successRate = ((stats.totalRequests - stats.errors) / stats.totalRequests * 100).toFixed(1);

  console.log(`\n===========================================================`);
  console.log(`  LOAD TEST RESULTS FOR https://${HOST}`);
  console.log(`===========================================================`);
  console.log(`  Total Duration:            ${totalTimeSec} seconds`);
  console.log(`  Total Requests Executed:   ${stats.totalRequests}`);
  console.log(`  Successful Registrations:  ${stats.successfulRegistrations}`);
  console.log(`  Successful Dashboard Reads:${stats.successfulReads}`);
  console.log(`  Failed Requests:           ${stats.errors}`);
  console.log(`  Average Latency:           ${avgLatency} ms`);
  console.log(`  Min / Max Latency:         ${minLatency} ms / ${maxLatency} ms`);
  console.log(`  Overall Success Rate:      ${successRate}%`);
  console.log(`===========================================================`);
}

runLoadTest();
