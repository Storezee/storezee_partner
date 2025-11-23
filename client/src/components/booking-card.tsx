import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./status-badge";
import type { Booking } from "@shared/schema";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Package } from "lucide-react";
import { useState } from "react";

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const documents = booking.user_document_url ? booking.user_document_url.split(',') : [];
  const luggageImages = booking.storage_image_url ? booking.storage_image_url.split(',') : [];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPp");
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-booking-${booking.booking_id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{booking.booking_id}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {booking.storage_title || "Storage Unit"}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground truncate">
                {booking.storage_booked_location || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium">Booking Time</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(booking.booking_created_time)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium">End Time</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(booking.booking_end_time)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium">Amount</p>
              <p
                className="text-sm font-mono font-semibold"
                data-testid={`text-amount-${booking.booking_id}`}
              >
                ₹{booking.amount}
              </p>
            </div>
          </div>
        </div>

        {booking.user_remark && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-1">Remark</p>
            <p className="text-sm text-muted-foreground">{booking.user_remark}</p>
          </div>
        )}

        {booking.payment_status && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Payment:</span>
            <Badge
              variant={booking.payment_status === "paid" ? "default" : "secondary"}
            >
              {booking.payment_status}
            </Badge>
          </div>
        )}

        {/* Documents */}
        {booking.user_document_url && booking.user_document_url.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Documents</p>
            <div className="flex gap-2 flex-wrap">
              {documents.map((doc, idx) => (
                <button
                  key={idx}
                  className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                  onClick={() => window.open(doc, "_blank")}
                >
                  Doc {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Luggage Images */}
        {booking.storage_image_url && booking.storage_image_url.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Luggage Images</p>
            <div className="flex gap-2 flex-wrap">
              {luggageImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Luggage ${idx + 1}`}
                  className="h-16 w-16 object-cover rounded border cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal for enlarged image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} className="max-h-[80vh] max-w-[80vw] rounded" />
        </div>
      )}
    </Card>
  );
}
