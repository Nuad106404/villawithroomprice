import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchAllBookings, updateBookingStatus, deleteBooking, updateBooking } from '../../store/slices/adminSlice';
import { formatPrice } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MoreVertical, Eye, Check, X, Trash2, Edit2, LogIn, LogOut, Clock, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

type BookingStatus = 'pending' | 'pending_payment' | 'in_review' | 'confirmed' | 'cancelled' | 'expired' | 'checked_in' | 'checked_out';

interface Booking {
  _id: string;
  customerName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  guests: number;
}

interface EditFormData {
  customerName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
}

export default function AdminBookings() {
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading, error } = useSelector((state: RootState) => state.admin);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    customerName: '',
    checkIn: '',
    checkOut: '',
    guests: 0,
    totalPrice: 0,
  });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllBookings());
  }, [dispatch]);

  useEffect(() => {
    if (selectedBooking && isEditDialogOpen) {
      setEditForm({
        customerName: selectedBooking.customerName,
        checkIn: dayjs(selectedBooking.checkIn).format('YYYY-MM-DD'),
        checkOut: dayjs(selectedBooking.checkOut).format('YYYY-MM-DD'),
        guests: selectedBooking.guests,
        totalPrice: selectedBooking.totalPrice,
      });
    }
  }, [selectedBooking, isEditDialogOpen]);

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await dispatch(updateBookingStatus({ bookingId, status: newStatus })).unwrap();
      toast.success('Booking status updated successfully');
      setOpenDropdownId(null); // Close dropdown after action
    } catch (error) {
      toast.error('Failed to update booking status');
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      await dispatch(deleteBooking(bookingId)).unwrap();
      setIsDeleteDialogOpen(false);
      toast.success('Booking deleted successfully');
      setOpenDropdownId(null); // Close dropdown after action
    } catch (error) {
      toast.error('Failed to delete booking');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    // Validate form data
    if (!editForm.customerName) {
      toast.error('Customer name is required');
      return;
    }
    if (!editForm.checkIn || !editForm.checkOut) {
      toast.error('Check-in and check-out dates are required');
      return;
    }
    if (editForm.guests < 1) {
      toast.error('Number of guests must be at least 1');
      return;
    }
    if (editForm.totalPrice < 0) {
      toast.error('Total price cannot be negative');
      return;
    }

    try {
      const result = await dispatch(updateBooking({
        bookingId: selectedBooking._id,
        bookingData: {
          ...editForm,
          totalPrice: Number(editForm.totalPrice),
          guests: Number(editForm.guests),
        }
      })).unwrap();
      
      // Update the selected booking with the new data
      setSelectedBooking(result);
      toast.success('Booking updated successfully');
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast.error(error?.response?.data?.message || 'Failed to update booking. Please try again.');
    }
  };

  const getAllStatusActions = () => [
    { status: 'pending', label: 'Set as Pending', icon: Clock, color: 'text-yellow-600' },
    { status: 'confirmed', label: 'Confirm Booking', icon: Check, color: 'text-green-600' },
    { status: 'checked_in', label: 'Check In', icon: LogIn, color: 'text-blue-600' },
    { status: 'checked_out', label: 'Check Out', icon: LogOut, color: 'text-purple-600' },
    { status: 'cancelled', label: 'Cancel Booking', icon: X, color: 'text-red-600' }
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleActionClick = (bookingId: string) => {
    setOpenDropdownId(openDropdownId === bookingId ? null : bookingId);
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({
      customerName: booking.customerName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      totalPrice: booking.totalPrice
    });
    setIsEditDialogOpen(true);
    setOpenDropdownId(null); // Close dropdown after opening edit dialog
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-trigger')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-6">
      <Card className="w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Manage Bookings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking.customerName}</TableCell>
                  <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                  <TableCell>{booking.guests}</TableCell>
                  <TableCell>${booking.totalPrice}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            handleActionClick(booking._id);
                          }}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      {openDropdownId === booking._id && (
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsViewDialogOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(booking)}
                            className="cursor-pointer"
                          >
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Edit Booking</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <div className="px-2 py-1.5">
                            <span className="text-xs font-semibold text-muted-foreground">Status Actions</span>
                          </div>
                          
                          {getAllStatusActions().map((action) => (
                            <DropdownMenuItem
                              key={action.status}
                              onClick={() => handleStatusUpdate(booking._id, action.status)}
                              className={`cursor-pointer ${action.color} ${booking.status === action.status ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={booking.status === action.status}
                            >
                              <action.icon className="mr-2 h-4 w-4" />
                              <span>{action.label}</span>
                              {booking.status === action.status && (
                                <span className="ml-2 text-xs">(Current)</span>
                              )}
                            </DropdownMenuItem>
                          ))}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Booking</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      )}
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Customer</h4>
                <p>{selectedBooking.customerName}</p>
              </div>
              <div>
                <h4 className="font-medium">Check In</h4>
                <p>{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="font-medium">Check Out</h4>
                <p>{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="font-medium">Guests</h4>
                <p>{selectedBooking.guests}</p>
              </div>
              <div>
                <h4 className="font-medium">Total Price</h4>
                <p>${selectedBooking.totalPrice}</p>
              </div>
              <div>
                <h4 className="font-medium">Status</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedBooking && handleDelete(selectedBooking._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Make changes to the booking details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Customer name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="checkIn">Check In</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, checkIn: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="checkOut">Check Out</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm(prev => ({ ...prev, checkOut: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    value={editForm.guests}
                    onChange={(e) => setEditForm(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalPrice">Total Price</Label>
                  <Input
                    id="totalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.totalPrice}
                    onChange={(e) => setEditForm(prev => ({ ...prev, totalPrice: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
