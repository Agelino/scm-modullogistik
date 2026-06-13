/**
 * Socket.io Handler untuk Real-time GPS Tracking
 */

const Tracking = require('../models/Tracking');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Driver mengirim update lokasi
    socket.on('location:update', async (data) => {
      try {
        const { deliveryPlanId, driverId, vehicleId, lat, lng, speed, heading, status } = data;

        // Save to database
        const tracking = await Tracking.create({
          deliveryPlan: deliveryPlanId,
          driver: driverId,
          vehicle: vehicleId,
          currentLocation: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          speed: speed || 0,
          heading: heading || 0,
          status: status || 'in_transit'
        });

        // Broadcast to room subscribers
        io.to(`plan:${deliveryPlanId}`).emit('location:updated', {
          deliveryPlanId,
          driverId,
          vehicleId,
          lat,
          lng,
          speed,
          heading,
          status,
          timestamp: tracking.timestamp
        });

        // Broadcast to all monitoring clients
        io.to('monitoring').emit('fleet:position', {
          deliveryPlanId,
          driverId,
          vehicleId,
          lat,
          lng,
          speed,
          heading,
          status,
          timestamp: tracking.timestamp
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to update location', error: error.message });
      }
    });

    // Status perjalanan berubah
    socket.on('status:change', async (data) => {
      const { deliveryPlanId, driverId, status } = data;
      
      io.to(`plan:${deliveryPlanId}`).emit('status:changed', {
        deliveryPlanId,
        driverId,
        status,
        timestamp: new Date()
      });

      io.to('monitoring').emit('fleet:status', {
        deliveryPlanId,
        driverId,
        status,
        timestamp: new Date()
      });
    });

    // Subscribe to a delivery plan's updates
    socket.on('tracking:subscribe', (data) => {
      const { deliveryPlanId } = data;
      socket.join(`plan:${deliveryPlanId}`);
      console.log(`👁️ Socket ${socket.id} subscribed to plan:${deliveryPlanId}`);
    });

    // Subscribe to monitoring room (admin dashboard)
    socket.on('monitoring:subscribe', () => {
      socket.join('monitoring');
      console.log(`📡 Socket ${socket.id} joined monitoring room`);
    });

    // Unsubscribe
    socket.on('tracking:unsubscribe', (data) => {
      const { deliveryPlanId } = data;
      socket.leave(`plan:${deliveryPlanId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocketHandlers;
