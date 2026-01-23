"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Activity, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();


  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/api/admin/login", { email, password });

      // Make sure the response shape is as expected
      if (
        res.data &&
        (res.data.success === true || res.status === 200) &&
        res.data?.data?.admin
      ) {
        const admin = res.data.data.admin;
        console.log("addd", admin)
        // Store to localStorage
        localStorage.setItem("adminName", admin.name || "");
        localStorage.setItem("adminRole", admin.systemrole || "");

      
          login(admin);
       

        toast.success("Logged in successfully");
        router.push("/");
      } else if (res.data && res.data.error) {
        setError(res.data.error);
        toast.error(res.data.error);
      } else {
        // Different error or missing admin property
        setError("Incorrect email or password. Please try again.");
        toast.error("Incorrect email or password. Please try again.");
      }
    } catch (err: unknown) {
      // If backend provides error message use that, else generic
      const errMsg =
        (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string } }; message?: string })?.message ||
        "Unable to login. Please try again later or contact support.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Healthcare Admin
          </h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold">
              Welcome back
            </CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  autoComplete="username"
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="admin@healthcare.com"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-11 text-white font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Footer Links */}
            <div className="flex items-center justify-between text-sm pt-2">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Forgot password?
              </button>
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 hover:underline"
              >
                Need help?
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Protected by enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}
