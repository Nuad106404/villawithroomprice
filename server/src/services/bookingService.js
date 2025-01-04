import Villa from '../models/Villa.js';

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

export const calculateTotalPrice = async (checkIn, checkOut) => {
  try {
    const villa = await Villa.findOne();
    if (!villa) {
      throw new Error('Villa not found');
    }

    let totalPrice = 0;
    const currentDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    while (currentDate < endDate) {
      const isWeekendDay = isWeekend(currentDate);
      const pricing = isWeekendDay ? villa.pricing.weekend : villa.pricing.weekday;
      
      // Use discounted price if available, otherwise use regular price
      const priceForDay = pricing.discounted || pricing.regular;
      totalPrice += priceForDay;

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalPrice;
  } catch (error) {
    console.error('Error calculating total price:', error);
    throw error;
  }
};

export const getAvailableDates = async (startDate, endDate) => {
  try {
    // Get all bookings that overlap with the requested date range
    const bookings = await Booking.find({
      $and: [
        { 'bookingDetails.checkIn': { $lte: endDate } },
        { 'bookingDetails.checkOut': { $gte: startDate } },
        { status: { $nin: ['cancelled', 'expired'] } }
      ]
    });

    // Create an array of all dates in the range
    const dates = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const isWeekendDay = isWeekend(currentDate);
      const villa = await Villa.findOne();
      
      const pricing = isWeekendDay ? villa.pricing.weekend : villa.pricing.weekday;
      const price = pricing.discounted || pricing.regular;

      dates.push({
        date: dateString,
        available: !bookings.some(booking => 
          new Date(dateString) >= new Date(booking.bookingDetails.checkIn) &&
          new Date(dateString) < new Date(booking.bookingDetails.checkOut)
        ),
        isWeekend: isWeekendDay,
        price
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  } catch (error) {
    console.error('Error getting available dates:', error);
    throw error;
  }
};
