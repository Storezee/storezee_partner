import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SummaryCard } from "@/components/summary-card";
import { BookingTable } from "@/components/booking-table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { LogOut, Package, DollarSign, CreditCard, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function PartnerDashboard() {
  const [, setLocation] = useLocation();
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [userData, setUserData] = useState<{ phone: string; name?: string; role?: string } | null>(null);

  useEffect(() => {
    const phone = localStorage.getItem('phone');
    const storedUserData = localStorage.getItem('user_data');
    
    if (!phone) {
      setLocation('/');
      return;
    }

    if (storedUserData) {
      const parsed = JSON.parse(storedUserData);
      if (parsed.role === 'user') {
        setLocation('/dashboard');
        return;
      }
      setUserData(parsed);
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const { data: storageUnits, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['/api/storage-units'],
    queryFn: () => api.getStorageUnits(),
  });

  useEffect(() => {
    if (storageUnits?.success && storageUnits.data.length > 0 && !selectedStorage) {
      setSelectedStorage(storageUnits.data[0].id);
    }
  }, [storageUnits, selectedStorage]);

  const { data: bookingsData, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/storage-bookings', selectedStorage],
    enabled: !!selectedStorage,
    queryFn: () => api.getStorageBookings(selectedStorage),
  });

  const handleLogout = () => {
    localStorage.removeItem('phone');
    localStorage.removeItem('user_data');
    setLocation('/');
  };

  const handleCreateBooking = () => {
    setLocation('/create-booking');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isSaathi = userData?.role === 'saathi';

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (!userData || (userData.role !== 'partner' && userData.role !== 'saathi')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unauthorized access. Please login with appropriate credentials.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar 
          role={userData?.role || 'partner'}
          onCreateBooking={handleCreateBooking}
        />
        
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between gap-4 border-b bg-card p-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-lg font-semibold">
                  {isSaathi ? 'Saathi' : 'Partner'} Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">Manage storage bookings</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {userData && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium">{userData.name || (isSaathi ? 'Saathi' : 'Partner')}</p>
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
          </header>

          <main className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Bookings Overview</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage all bookings for selected storage
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isLoadingUnits ? (
                  <Skeleton className="h-10 w-64" />
                ) : (
                  <Select value={selectedStorage} onValueChange={setSelectedStorage}>
                    <SelectTrigger className="w-64" data-testid="select-storage-unit">
                      <SelectValue placeholder="Select storage unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageUnits?.data.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {isSaathi && (
                  <Button onClick={handleCreateBooking} data-testid="button-create-booking">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Booking
                  </Button>
                )}
              </div>
            </div>

            {isLoadingBookings ? (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-6">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </Card>
                  ))}
                </div>
                <Skeleton className="h-96 w-full" />
              </div>
            ) : bookingsData?.success ? (
              <>
                <div className="grid gap-6 md:grid-cols-3">
                  <SummaryCard
                    title="Total Bookings"
                    value={bookingsData.summary.total_bookings || 0}
                    icon={Package}
                  />
                  <SummaryCard
                    title="Total Amount"
                    value={`₹${bookingsData.summary.total_amount || 0}`}
                    icon={DollarSign}
                  />
                  <SummaryCard
                    title="Total Paid Amount"
                    value={`₹${bookingsData.summary.total_paid_amount || 0}`}
                    icon={CreditCard}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">All Bookings</h3>
                  <BookingTable bookings={bookingsData.data} />
                </div>
              </>
            ) : (
              <Card className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
                <p className="text-muted-foreground">
                  No bookings available for this storage unit
                </p>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
