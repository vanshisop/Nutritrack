"use client"
import { Suspense, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MountainIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function PasswordReset() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PasswordResetContent />
    </Suspense>
  );
}

function PasswordResetContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setError("No reset token provided. Please request a new password reset.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post(`https://express-vercel-nutritrack.vercel.app/resetPasswordPage`, {
          token
        });
        if (response.data.valid) {
          setIsValidToken(true);
        } else {
          setError("Invalid or expired token. Please request a new password reset.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while verifying the token. Please try again.");
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [searchParams]);

  const validatePassword = (value: string) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!validatePassword(password)) {
      setError("Password must contain at least 8 characters, one capital letter, one number, and one special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError("No reset token provided. Please request a new password reset.");
      return;
    }

    try {
      const response = await axios.post('https://express-vercel-nutritrack.vercel.app/resetPassword', {
        token,
        password
      });
      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        setError(response.data.message || "An error occurred. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again later.");
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-gray-800 shadow-md">
        <Link className="flex items-center justify-center" href="/">
          <MountainIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          <span className="ml-2 text-lg font-bold text-gray-700 dark:text-gray-200">NutriTrack</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-600 dark:text-green-400">Reset Password</CardTitle>
            <CardDescription className="text-center">Enter your new password</CardDescription>
          </CardHeader>
          <CardContent>
            {!isValidToken ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : !isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Reset Password
                </Button>
              </form>
            ) : (
              <Alert className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your password has been successfully reset.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/" className="text-sm text-green-600 hover:underline dark:text-green-400">
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-gray-800 shadow-md">
        <Link className="flex items-center justify-center" href="/">
          <MountainIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          <span className="ml-2 text-lg font-bold text-gray-700 dark:text-gray-200">NutriTrack</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Loading...</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Please wait while we verify your reset token.</p>
        </div>
      </main>
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 NutriTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}