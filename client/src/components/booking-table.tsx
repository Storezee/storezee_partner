import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@shared/schema";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BookingTableProps {
  bookings: Booking[];
}

export function BookingTable({ bookings }: BookingTableProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PP");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "p");
    } catch {
      return '';
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No bookings found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="font-semibold">Booking ID</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Start Time</TableHead>
              <TableHead className="font-semibold">End Time</TableHead>
              <TableHead className="font-semibold text-right">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking, index) => (
              <TableRow 
                key={booking.id} 
                className="hover-elevate"
                data-testid={`row-booking-${index}`}
              >
                <TableCell className="font-mono font-medium" data-testid={`text-booking-id-${index}`}>
                  {booking.booking_id}
                </TableCell>
                <TableCell data-testid={`text-customer-name-${index}`}>
                  {booking.user_full_name || 'N/A'}
                </TableCell>
                <TableCell className="font-mono text-sm" data-testid={`text-customer-phone-${index}`}>
                  {booking.user_phone || 'N/A'}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" data-testid={`text-location-${index}`}>
                  {booking.storage_booked_location || 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="text-sm">{formatDate(booking.booking_created_time)}</div>
                    <div className="text-xs text-muted-foreground">{formatTime(booking.booking_created_time)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <div className="text-sm">{formatDate(booking.booking_end_time)}</div>
                    <div className="text-xs text-muted-foreground">{formatTime(booking.booking_end_time)}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-semibold" data-testid={`text-booking-amount-${index}`}>
                  ₹{booking.amount}
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell>
                  {booking.payment_status ? (
                    <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {booking.payment_status}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
