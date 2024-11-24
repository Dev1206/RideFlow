const Ride = require('../models/Ride');
const User = require('../models/User');
const Driver = require('../models/Driver');

exports.createRide = async (req, res) => {
  try {
    const {
      name,
      phone,
      pickupLocation,
      dropLocation,
      pickupCoordinates,
      dropCoordinates,
      date,
      time,
      isPrivate,
      notes,
      returnRide,
      returnDate,
      returnTime
    } = req.body;

    // Get user by firebaseUID
    const user = await User.findOne({ firebaseUID: req.user.firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert date string to Date object while preserving the local date
    const localDate = new Date(date + 'T00:00:00');
    const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

    // Create the main ride
    const ride = new Ride({
      userId: user._id,
      firebaseUID: req.user.firebaseUID,
      name,
      phone,
      pickupLocation,
      dropLocation,
      pickupCoordinates,
      dropCoordinates,
      date: utcDate, // Use the corrected date
      time,
      isPrivate,
      notes,
      status: 'pending'
    });

    await ride.save();

    // If return ride is requested, create another ride with swapped locations
    let returnRideDoc = null;
    if (returnRide && returnDate && returnTime) {
      // Convert return date string to Date object while preserving the local date
      const localReturnDate = new Date(returnDate + 'T00:00:00');
      const utcReturnDate = new Date(localReturnDate.getTime() - localReturnDate.getTimezoneOffset() * 60000);

      returnRideDoc = new Ride({
        userId: user._id,
        firebaseUID: req.user.firebaseUID,
        name,
        phone,
        pickupLocation: dropLocation,
        dropLocation: pickupLocation,
        pickupCoordinates: dropCoordinates,
        dropCoordinates: pickupCoordinates,
        date: utcReturnDate, // Use the corrected return date
        time: returnTime,
        isPrivate,
        notes,
        status: 'pending',
        returnRide: true
      });

      await returnRideDoc.save();
    }

    res.status(201).json({
      message: 'Ride booked successfully',
      ride,
      returnRide: returnRideDoc
    });
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ 
      message: 'Failed to book ride',
      error: error.message 
    });
  }
};

exports.getUserRides = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get rides with populated driver details
    const rides = await Ride.find({ userId: user._id })
      .populate({
        path: 'driverId',
        select: 'name phone vehicle email',
        model: 'Driver'
      })
      .sort({ date: 1 });

    res.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ 
      message: 'Failed to fetch rides',
      error: error.message 
    });
  }
};

// Get all rides
exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('driver')
      .lean()
      .exec();

    res.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ message: 'Failed to fetch rides' });
  }
};

// Assign driver to ride
exports.assignDriver = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;

    // Find the driver first
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Update the ride with driver details
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { 
        driverId: driver._id,
        status: 'confirmed'
      },
      { new: true }
    ).populate({
      path: 'driverId',
      select: 'name email phone vehicle isAvailable'
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Transform the response to include driver details
    const transformedRide = {
      ...ride.toObject(),
      driver: {
        name: driver.name,
        phone: driver.phone,
        email: driver.email,
        vehicle: driver.vehicle,
        isAvailable: driver.isAvailable
      }
    };

    res.json(transformedRide);
  } catch (error) {
    console.error('Error assigning driver:', error);
    res.status(500).json({ message: 'Failed to assign driver' });
  }
};

// Update ride status
exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { rideId } = req.params;

    console.log('Updating ride status:', {
      rideId,
      status,
      userId: req.user.id,
      userRoles: req.user.roles
    });

    // Find the ride with populated driver info
    const ride = await Ride.findById(rideId)
      .populate({
        path: 'driverId',
        select: 'userId'
      });
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    console.log('Found ride:', {
      rideId: ride._id,
      currentStatus: ride.status,
      driverId: ride.driverId?._id,
      driverUserId: ride.driverId?.userId
    });

    // Check if user has permission to update status
    const isAdmin = req.user.roles.includes('admin');
    const isDeveloper = req.user.roles.includes('developer');
    const isAssignedDriver = ride.driverId && 
      ride.driverId.userId.toString() === req.user.id.toString();

    console.log('Permission check:', {
      isAdmin,
      isDeveloper,
      isAssignedDriver,
      requestedStatus: status
    });

    if (!isAdmin && !isDeveloper && !isAssignedDriver) {
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions',
        details: 'Only assigned drivers, admins, or developers can update ride status'
      });
    }

    // If user is driver, only allow updating from 'confirmed' to 'completed'
    if (isAssignedDriver && 
        !(ride.status === 'confirmed' && status === 'completed')) {
      return res.status(403).json({ 
        message: 'Drivers can only mark confirmed rides as completed',
        details: {
          currentStatus: ride.status,
          requestedStatus: status
        }
      });
    }

    // Update the status
    ride.status = status;
    await ride.save();

    console.log('Ride status updated successfully:', {
      rideId: ride._id,
      newStatus: status
    });

    // Return the updated ride with populated driver info
    const updatedRide = await Ride.findById(rideId)
      .populate({
        path: 'driverId',
        select: 'name email phone vehicle isAvailable'
      });

    res.json(updatedRide);
  } catch (error) {
    console.error('Error updating ride status:', error);
    res.status(500).json({ 
      message: 'Failed to update status',
      error: error.message 
    });
  }
};

// Delete ride
exports.deleteRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    
    // Find the ride first
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user has permission to delete this ride
    const isAdmin = req.user.roles.includes('admin');
    const isDeveloper = req.user.roles.includes('developer');
    const isOwner = ride.userId.toString() === req.user.id.toString();

    if (!isAdmin && !isDeveloper && !isOwner) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this ride',
        details: 'Only ride owner, admin, or developer can delete rides'
      });
    }

    // Only allow deletion of pending rides (unless admin/developer)
    if (!isAdmin && !isDeveloper && ride.status !== 'pending') {
      return res.status(403).json({ 
        message: 'Cannot delete ride that has already been assigned or completed',
        details: 'Only pending rides can be cancelled by customers'
      });
    }

    // Delete the ride
    await Ride.findByIdAndDelete(rideId);

    res.json({ 
      message: 'Ride deleted successfully',
      deletedRideId: rideId
    });
  } catch (error) {
    console.error('Error deleting ride:', error);
    res.status(500).json({ 
      message: 'Failed to delete ride',
      error: error.message 
    });
  }
};

// Get all drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate('userId', 'name email')
      .sort({ name: 1 }); // Sort alphabetically by name
    
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ 
      message: 'Failed to fetch drivers',
      error: error.message 
    });
  }
};

// Get driver's rides
exports.getDriverRides = async (req, res) => {
  try {
    // First find the driver
    const driver = await Driver.findOne({ firebaseUID: req.user.firebaseUID });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Get rides assigned to this driver
    const rides = await Ride.find({ driverId: driver._id })
      .sort({ date: -1, time: -1 });

    res.json(rides);
  } catch (error) {
    console.error('Error fetching driver rides:', error);
    res.status(500).json({ 
      message: 'Failed to fetch driver rides',
      error: error.message 
    });
  }
};

// Get dashboard metrics
exports.getDashboardMetrics = async (req, res) => {
  try {
    // Get counts from your database
    const [
      totalRides,
      totalUsers,
      totalDrivers,
      activeRides,
      completedRides,
      pendingRides,
      cancelledRides,
      availableDrivers,
      unavailableDrivers
    ] = await Promise.all([
      Ride.countDocuments(),
      User.countDocuments(),
      Driver.countDocuments(),
      Ride.countDocuments({ status: 'confirmed' }),
      Ride.countDocuments({ status: 'completed' }),
      Ride.countDocuments({ status: 'pending' }),
      Ride.countDocuments({ status: 'cancelled' }),
      Driver.countDocuments({ isAvailable: true }),
      Driver.countDocuments({ isAvailable: false })
    ]);

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [dailyBookings, dailyNewUsers] = await Promise.all([
      Ride.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: today } })
    ]);

    // Get weekly new users
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const weeklyNewUsers = await User.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    res.json({
      totalRides,
      totalUsers,
      totalDrivers,
      activeRides,
      completedRides,
      dailyBookings,
      activeUsers: totalUsers,
      newUsers: {
        daily: dailyNewUsers,
        weekly: weeklyNewUsers
      },
      rideStatus: {
        pending: pendingRides,
        inProgress: activeRides,
        completed: completedRides,
        cancelled: cancelledRides
      },
      driverStatus: {
        available: availableDrivers,
        unavailable: unavailableDrivers
      }
    });
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    res.status(500).json({ message: 'Error fetching dashboard metrics' });
  }
};

exports.getCompletedRides = async (req, res) => {
  try {
    // Find user first
    const user = await User.findOne({ firebaseUID: req.user.firebaseUID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query = { status: 'completed' };

    // If user is a customer, show only their rides
    if (req.user.roles.includes('customer')) {
      query.userId = user._id;
    }
    // If user is a driver, show rides they completed
    else if (req.user.roles.includes('driver')) {
      const driver = await Driver.findOne({ firebaseUID: req.user.firebaseUID });
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
      query.driverId = driver._id;
    }
    // Admin and developer can see all completed rides

    const rides = await Ride.find(query)
      .sort({ date: -1, time: -1 }) // Most recent first
      .populate({
        path: 'driverId',
        select: 'name phone vehicle email',
        model: 'Driver'
      })
      .populate('userId', 'name email');

    const ridesWithDriverInfo = rides.map(ride => ({
      ...ride.toObject(),
      driver: ride.driverId
    }));

    res.json(ridesWithDriverInfo);
  } catch (error) {
    console.error('Error fetching completed rides:', error);
    res.status(500).json({ 
      message: 'Failed to fetch completed rides',
      error: error.message 
    });
  }
}; 