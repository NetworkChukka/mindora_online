const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const User = require('../models/User');

let ioInstance = null;

function initSocketIO(io) {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.status === 'ACTIVE') {
          socket.user = user;
          socket.join(`role:${user.role}`);
          socket.join('authenticated');
        }
      } else {
        socket.join('public_display');
      }
      next();
    } catch (err) {
      // Allow unauthenticated socket connection in public_display room for live TV screen
      socket.join('public_display');
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user ? socket.user.username : 'Public Display'})`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

function getIO() {
  return ioInstance;
}

/**
 * Emit helper functions for real-time synchronization
 */
function broadcastSchoolCreated(school) {
  if (!ioInstance) return;
  ioInstance.to('authenticated').emit('school:created', school);
}

function broadcastSchoolUpdated(school) {
  if (!ioInstance) return;
  ioInstance.to('authenticated').emit('school:updated', school);
}

function broadcastStudentRegistered(student, dashboardStats) {
  if (!ioInstance) return;
  ioInstance.emit('student:registered', student);
  ioInstance.emit('student:created', student);
  if (dashboardStats) {
    ioInstance.emit('dashboard:update', dashboardStats);
  }
}

function broadcastStudentUpdated(student, dashboardStats) {
  if (!ioInstance) return;
  ioInstance.emit('student:updated', student);
  if (dashboardStats) {
    ioInstance.emit('dashboard:update', dashboardStats);
  }
}

function broadcastTeacherRegistered(teacher, dashboardStats) {
  if (!ioInstance) return;
  ioInstance.emit('teacher:registered', teacher);
  ioInstance.emit('teacher:created', teacher);
  if (dashboardStats) {
    ioInstance.emit('dashboard:update', dashboardStats);
  }
}

function broadcastTeacherUpdated(teacher, dashboardStats) {
  if (!ioInstance) return;
  ioInstance.emit('teacher:updated', teacher);
  if (dashboardStats) {
    ioInstance.emit('dashboard:update', dashboardStats);
  }
}

function broadcastDashboardUpdate(stats) {
  if (!ioInstance) return;
  ioInstance.emit('dashboard:update', stats);
}

module.exports = {
  initSocketIO,
  getIO,
  broadcastSchoolCreated,
  broadcastSchoolUpdated,
  broadcastStudentRegistered,
  broadcastStudentUpdated,
  broadcastTeacherRegistered,
  broadcastTeacherUpdated,
  broadcastDashboardUpdate
};
