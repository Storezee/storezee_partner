import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { createBookingSchema, type CreateBookingInput } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { useEffect } from "react";
import { time } from "console";


export default function CreateBooking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [luggageFiles, setLuggageFiles] = useState<File[]>([]);

  const { data: storageUnits, isLoading: isLoadingUnits } = useQuery({
    queryKey: ['/api/storage-units'],
    queryFn: () => api.getStorageUnits(),
  });

  const { data: storageaddons, isLoading: isLoadingAddons } = useQuery({
    queryKey: ['/api/addons/'],
    queryFn: () => api.getAddons(),
  });

  useEffect(() => {
  // Generate local datetime (NOT UTC)
  const now = new Date();
  const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16); // YYYY-MM-DDTHH:mm

  console.log("🕒 Auto Booking Time:", localISO);

  form.setValue("booking_created_time", localISO);
}, []);

  useEffect(() => {
  console.log("📌 GPS Auto-Fill: Requesting location...");
    
  if (!navigator.geolocation) {
    console.warn("❌ Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log("📍 GPS Coordinates Found:", latitude, longitude);

        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
      },
      (error) => {
        console.error("❌ GPS Error:", error);
      }
    );
  }, []);


  const ADDONS = [
    { id: "6ba3a764-5194-4b3f-a409-f9c4b516afac", name: "Earphones/Headphones", price: 20 },
    { id: "811dfa01-c445-4cfa-8ae1-87f85f8ed037", name: "Helmets", price: 15 },
    { id: "67f56785-cbb9-417e-8ea3-33a28ca8ba2a", name: "Luggage/Bagpack", price: 50 },
    { id: "0d651b29-1691-4382-b2de-aa517df2ebe9", name: "Camera/Electronic Item", price: 30 },
    { id: "0a2ea28c-12dd-4554-b2eb-0877537325d3", name: "Earphones/Headphones", price: 10 },
  ];
  


  const form = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      storage_unit_id: "",
      booking_created_time: new Date().toISOString().slice(0, 16),
      storage_booked_location: "",
      latitude: 0,
      longitude: 0,
      user_remark: "",
      luggage_time: 6,
      addons: "",
      identification_number: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: CreateBookingInput) => {

      const selectedAddon = ADDONS.find(a => a.id === data.addons);
      const addonPrice = selectedAddon ? selectedAddon.price : 0;

      // 2. Calculate total amount
      const finalAmount = addonPrice * data.luggage_time;
      const formData = new FormData();
      
      formData.append('full_name', data.full_name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('storage_unit_id', data.storage_unit_id);
      formData.append('booking_created_time', data.booking_created_time);
      formData.append('storage_booked_location', data.storage_booked_location);
      formData.append('latitude', data.latitude.toString());
      formData.append('longitude', data.longitude.toString());
      formData.append('user_remark', data.user_remark || '');
      formData.append('luggage_time', data.luggage_time.toString());
      formData.append('addons', data.addons || '');
      formData.append('identification_number', data.identification_number || '');
      formData.append('amount', finalAmount.toString());

      if (documentFile) {
        formData.append('file', documentFile);
      }

      luggageFiles.forEach((file) => {
        formData.append('luggage_pic', file);
      });

      return api.createBooking(formData);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Booking Created Successfully",
          description: `Booking ID: ${data.data?.booking_id}`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/storage-bookings'] });
        setLocation('/dashboard');
      } else {
        toast({
          title: "Error Creating Booking",
          description: data.error || "An error occurred",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error Creating Booking",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateBookingInput) => {
    if (!documentFile) {
      toast({
        title: "Document Required",
        description: "Please upload a document",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate(data);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setDocumentFile(files[0]);
    }
  };

  const handleLuggageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setLuggageFiles(Array.from(files));
    }
  };

  const removeLuggageFile = (index: number) => {
    setLuggageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/dashboard')}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Create New Booking</h1>
              <p className="text-xs text-muted-foreground">Register new user and create booking</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>
              Fill in all the required information to create a new booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} data-testid="input-full-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="1234567890" 
                            className="font-mono"
                            maxLength={10}   
                            {...field} 
                            data-testid="input-phone" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="identification_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identification Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ID Number" 
                            className="font-mono"
                            {...field} 
                            data-testid="input-id-number" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="storage_unit_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Unit *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-storage">
                            <SelectValue placeholder="Select a storage unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingUnits ? (
                            <SelectItem value="loading" disabled>Loading...</SelectItem>
                          ) : (
                            storageUnits?.data.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.title}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="booking_created_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Start Time *</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field} 
                            data-testid="input-booking-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control}
                    name="luggage_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (hours) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            max="720"
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            data-testid="input-duration"
                          />
                        </FormControl>
                        <FormDescription>Duration in hours (max 720)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="storage_booked_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City, State" {...field} data-testid="input-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            className="font-mono"
                            {...field}
                            value={field.value || ""}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-latitude"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            className="font-mono"
                            {...field}
                            value={field.value || ""}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-longitude"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>


                <FormField
                  control={form.control}
                  name="addons"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Addons</FormLabel>

                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-addons">
                            <SelectValue placeholder="Select Addon" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {ADDONS.map((addon) => (
                            <SelectItem key={addon.id} value={addon.id}>
                              {addon.name} — ₹{addon.price}/- per hours
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />



                <FormField
                  control={form.control}
                  name="user_remark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional notes..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          data-testid="input-remarks"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="document">Document Upload *</Label>
                    <div className="mt-2">
                      <label
                        htmlFor="document"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover-elevate"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            {documentFile ? (
                              <span className="font-medium">{documentFile.name}</span>
                            ) : (
                              <>
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">PDF, DOC, or Image</p>
                        </div>
                        <input
                          id="document"
                          type="file"
                          className="hidden"
                          onChange={handleDocumentChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          data-testid="input-document"
                        />
                      </label>
                    </div>
                  </div> 

                  <div>
                    <Label htmlFor="luggage">Luggage Pictures</Label>
                    <div className="mt-2">
                      <label
                        htmlFor="luggage"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover-elevate"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            {luggageFiles.length > 0 ? (
                              <span className="font-medium">{luggageFiles.length} file(s) selected</span>
                            ) : (
                              <>
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">Multiple images allowed</p>
                        </div>
                        <input
                          id="luggage"
                          type="file"
                          className="hidden"
                          onChange={handleLuggageChange}
                          accept="image/*"
                          multiple
                          data-testid="input-luggage"
                        />
                      </label>
                    </div>

                    {luggageFiles.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {luggageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-xs p-2 text-center overflow-hidden">
                              {file.name}
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeLuggageFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/dashboard')}
                    disabled={createBookingMutation.isPending}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBookingMutation.isPending}
                    data-testid="button-submit"
                    className="flex-1"
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Booking...
                      </>
                    ) : (
                      'Create Booking'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
