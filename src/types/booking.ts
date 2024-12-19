export interface BookingDetails {
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
}

export interface BookingCalculation {
  numberOfNights: number;
  basePrice: number;
  total: number;
  taxes: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BookingState {
  step: number;
  customerInfo: CustomerInfo;
  bookingDetails: BookingDetails;
  paymentMethod: 'bank_transfer' | 'promptpay' | null;
  reservationId: string | null;
}