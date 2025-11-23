import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Package, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import StorezeeLogo from '../../../client/public/storezee_logo.png';

export default function Login() {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNoDataMessage, setShowNoDataMessage] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number (at least 10 digits)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setShowNoDataMessage(false);

    try {
      const roleResponse = await api.getUserRole(phone);
      
      if (roleResponse.success && roleResponse.data) {
        const userData = roleResponse.data;
        
        localStorage.setItem('phone', phone);
        localStorage.setItem('user_data', JSON.stringify({
          phone,
          name: userData.full_name,
          email: userData.email,
          role: userData.role,
          id: userData.id,
        }));

        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.full_name}!`,
        });

        if (userData.role === 'user') {
          setLocation('/dashboard');
        } else if (userData.role === 'partner' || userData.role === 'saathi') {
          setLocation('/partner');
        } else {
          setLocation('/dashboard');
        }
      } else {
        setShowNoDataMessage(true);
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center rounded-lg">
            <img
              src={StorezeeLogo}
              alt="Storezee Logo"
              className="h-12 w-12"
            />
          </div>
          <CardTitle className="text-2xl font-semibold">Storezee Booking Portal</CardTitle>
          <CardDescription>
            Enter your mobile number to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showNoDataMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Data Found</AlertTitle>
              <AlertDescription>
                Looks like no data is created for this phone number. Please contact support to get registered.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                data-testid="input-phone"
                className="font-mono"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
