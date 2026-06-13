const Delivery = require('../models/Delivery');
const DeliveryPlan = require('../models/DeliveryPlan');

// POST /api/deliveries/:id/confirm — Upload proof of delivery
exports.confirmDelivery = async (req, res) => {
  try {
    const { receivedBy, signature, notes, temperature } = req.body;
    const photoProof = req.file ? `/uploads/${req.file.filename}` : '';

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        status: 'delivered',
        receivedBy,
        photoProof,
        signature,
        notes,
        temperature: temperature ? parseFloat(temperature) : null,
        receivedAt: new Date()
      },
      { new: true }
    ).populate('school').populate('driver');

    if (!delivery) return res.status(404).json({ success: false, message: 'Data pengiriman tidak ditemukan' });

    // Check if all deliveries for this plan are completed
    const pendingCount = await Delivery.countDocuments({
      deliveryPlan: delivery.deliveryPlan,
      status: 'pending'
    });

    if (pendingCount === 0) {
      await DeliveryPlan.findByIdAndUpdate(delivery.deliveryPlan, {
        status: 'completed',
        completedAt: new Date()
      });
    }

    res.json({ success: true, data: delivery, allDelivered: pendingCount === 0 });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/deliveries/:planId
exports.getDeliveriesByPlan = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryPlan: req.params.planId })
      .populate('school')
      .populate('driver');
    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/deliveries
exports.getAllDeliveries = async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
    const deliveries = await Delivery.find(filter)
      .populate('school')
      .populate('driver')
      .populate('deliveryPlan')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/deliveries/:id/status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ success: false, message: 'Tidak ditemukan' });
    res.json({ success: true, data: delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/deliveries — Create delivery records from a plan
exports.createDeliveriesFromPlan = async (req, res) => {
  try {
    const { deliveryPlanId } = req.body;
    const plan = await DeliveryPlan.findById(deliveryPlanId).populate('schools.school');
    if (!plan) return res.status(404).json({ success: false, message: 'Plan tidak ditemukan' });

    const deliveries = await Delivery.insertMany(
      plan.schools.map(s => ({
        deliveryPlan: plan._id,
        school: s.school._id,
        driver: plan.driver,
        portions: s.portions,
        status: 'pending'
      }))
    );

    res.status(201).json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
