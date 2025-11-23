import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@shared/schema";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";


interface BookingTableProps {
  bookings: Booking[];
}

export function BookingTable({ bookings }: BookingTableProps) {
  // ✅ useState must be inside component
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const closeModal = () => setImageSrc(null);

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
    <div className="border rounded-lg relative">
      <ScrollArea className="h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Stored Item</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking, index) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.booking_id}</TableCell>
                <TableCell>{booking.user_full_name || 'N/A'}</TableCell>
                <TableCell>{booking.user_phone || 'N/A'}</TableCell>
                <TableCell>{booking.storage_booked_location || 'N/A'}</TableCell>
                <TableCell>{formatDate(booking.booking_created_time)}</TableCell>
                <TableCell>{formatDate(booking.booking_end_time)}</TableCell>
                <TableCell className="text-right">₹{booking.amount}</TableCell>
                <TableCell><StatusBadge status={booking.status} /></TableCell>
                <TableCell>
                  {booking.payment_status ? (
                    <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}>
                      {booking.payment_status}
                    </Badge>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {booking.user_document_url ? (
                    <button onClick={() => setImageSrc(booking.user_document_url!)} aria-label="View Document">
                      <Eye className="w-5 h-5" />
                    </button>
                  ) : (
                    "-"
                  )}
                </TableCell>
                  <TableCell>
                  {booking.storage_image_url ? (
                    <button onClick={() => setImageSrc(booking.storage_image_url!)} aria-label="View Item">
                      <Eye className="w-5 h-5" />
                    </button>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Modal */}
       {imageSrc && (
        <Dialog open={!!imageSrc} onOpenChange={closeModal}>
          <DialogContent>
            <DialogClose />
            <img src={imageSrc} alt="Document" className="max-w-full max-h-[80vh]" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
