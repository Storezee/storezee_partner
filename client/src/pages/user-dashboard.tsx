import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BookingCard } from "@/components/booking-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Package, User } from "lucide-react";

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<{ phone: string; name?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    const phone = localStorage.getItem('phone');
    const storedUserData = localStorage.getItem('user_data');
    
    if (!phone) {
      setLocation('/');
      return;
    }

    if (storedUserData) {
      const parsed = JSON.parse(storedUserData);
      if (parsed.role && parsed.role !== 'user') {
        setLocation('/partner');
        return;
      }
      setUserData(parsed);
    } else {
      setUserData({ phone });
    }
  }, [setLocation]);

  const { data, isLoading } = useQuery({
    queryKey: ['/api/user-bookings', userData?.phone],
    enabled: !!userData?.phone,
    queryFn: () => api.getUserBookings(userData!.phone),
  });

  const handleLogout = () => {
    localStorage.removeItem('phone');
    localStorage.removeItem('user_data');
    setLocation('/');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Booking Management</h1>
                <p className="text-xs text-muted-foreground">My Bookings</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {userData && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium">{userData.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground font-mono">{userData.phone}</p>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">My Bookings</h2>
          <p className="text-muted-foreground">
            View and manage all your storage bookings
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.success && data.data.length > 0 ? (
          <>
            <div className="mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Bookings
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-bookings">
                    {data.count}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.data.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground">
              You don't have any bookings yet
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
