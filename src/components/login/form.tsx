"use client";

import { LoginResponse } from "@/app/api/login/route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";
import { LoaderCircle, Ticket, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useRef, useState } from "react";

export function LoginForm() {
  // Router for page redirection
  const router = useRouter();

  // References for the inputs
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Function that performs login when the form is submitted
  const handleLoginSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      // Prevents the form from being submitted by the browser
      event.preventDefault();
      // Resets form states
      setFormError("");
      setFormLoading(true);

      // Checks if inputs exist on the page
      if (emailInputRef.current && passwordInputRef.current) {
        // Gets the values filled in the inputs
        const email = emailInputRef.current.value;
        const pass1 = passwordInputRef.current.value;

        try {
          // Try to login
          const response = await axios.post<LoginResponse>("/api/login", {
            email,
            password: pass1,
          });

          // If it got here, login was successful
          router.push("/");

          setFormLoading(false);
          setFormSuccess(true);
        } catch (error) {
          // Change the state generically, without informing the error
          setFormError("Invalid email or password. Please try again.");
          setFormLoading(false);
          setFormSuccess(false);
        }
      }
    },
    [router]
  );

  return (
    <div className="h-screen flex">
      <div className="flex w-1/2 bg-gradient-to-r from-blue-600 to-indigo-800 justify-around items-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Ticket className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-white font-bold text-4xl font-sans">Voucher Portal</h1>
          <p className="text-white mt-1">Access your voucher management dashboard</p>
          <div className="mt-8 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-white font-semibold text-lg mb-2">What You Can Do</h3>
            <ul className="text-white text-left">
              <li className="mb-2">• View active vouchers</li>
              <li className="mb-2">• Process redemptions</li>
              <li className="mb-2">• Generate reports</li>
              <li className="mb-2">• Manage campaigns</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex w-1/2 justify-center items-center bg-gray-50">
        <Card className="w-3/4 shadow-lg border-0">
          <CardHeader className="space-y-1">
            <div className="flex justify-center text-blue-600 mb-2">
              <Ticket className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the voucher system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => handleLoginSubmit(event)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      ref={emailInputRef}
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="remember" className="rounded border-gray-300" />
                    <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </Link>
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                    <p className="text-sm">{formError}</p>
                  </div>
                )}
                {formSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded">
                    <p className="text-sm font-semibold">
                      Login successful, redirecting to dashboard
                    </p>
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Signing in
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create account
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}