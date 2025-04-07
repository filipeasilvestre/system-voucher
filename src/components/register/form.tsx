"use client";

import { RegisterResponse } from "@/app/api/register/route";
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
import { LoaderCircle, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useRef, useState } from "react";

export function RegisterForm() {
  // Router for page redirection
  const router = useRouter();

  // References for the inputs
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const password2InputRef = useRef<HTMLInputElement>(null);
  const contactInputRef = useRef<HTMLInputElement>(null);
  const residenceInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Function that performs registration when the form is submitted
  const handleRegisterSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      // Prevents the form from being submitted by the browser
      event.preventDefault();
      // Resets form states
      setFormError("");
      setFormLoading(true);

      // Regex to verify email
      const emailReg = new RegExp(
        "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
      );

      // Checks if inputs exist on the page
      if (
        emailInputRef.current &&
        nameInputRef.current &&
        companyInputRef.current &&
        password2InputRef.current &&
        passwordInputRef.current &&
        contactInputRef.current &&
        residenceInputRef.current
      ) {
        // Gets the values filled in the inputs
        const email = emailInputRef.current.value;
        const name = nameInputRef.current.value;
        const company = companyInputRef.current.value;
        const pass1 = passwordInputRef.current.value;
        const pass2 = password2InputRef.current.value;
        const contact = contactInputRef.current.value;
        const residence = residenceInputRef.current.value;

        // Starts not needing to give any error
        let shouldReturnError = false;

        // If validation error is encountered,
        // change the error state
        if (!emailReg.test(email)) {
          setFormError("Please enter a valid email address.");
          shouldReturnError = true;
        }

        if (pass1.length < 8) {
          setFormError("Password must be at least 8 characters long.");
          shouldReturnError = true;
        }

        if (pass1 !== pass2) {
          setFormError("Passwords do not match.");
          shouldReturnError = true;
        }

        if (shouldReturnError) {
          setFormLoading(false);
          setFormSuccess(false);
          return;
        }

        try {
          // Try to register
          // If AXIOS returns an error, it will throw new AxiosError()
          // which will be verified in catch()
          const response = await axios.post<RegisterResponse>("/api/register", {
            email,
            name,
            company,
            password: pass1,
            password2: pass2,
            contact,
            residence,
          });

          // If it got here, registration was successful
          router.push("/");

          setFormLoading(false);
          setFormSuccess(true);
        } catch (error) {
          // If it got here, an error occurred when trying to register the user
          // We check if it is an instance of AxiosError just to type the error
          if (error instanceof AxiosError) {
            // The error comes inside response.data, as JSON, according to typing
            const { error: errorMessage } = error.response
              ?.data as RegisterResponse;

            // If the user already exists, suggest going to login
            if (errorMessage === "user already exists") {
              setFormError(
                "This email is already registered. Try going to login."
              );
            } else {
              setFormError(errorMessage || error.message);
            }
          }
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
          <p className="text-white mt-1">Manage and redeem your vouchers with ease</p>
          <div className="mt-8 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-white font-semibold text-lg mb-2">Why Register?</h3>
            <ul className="text-white text-left">
              <li className="mb-2">• Track your voucher balances</li>
              <li className="mb-2">• Redeem vouchers instantly</li>
              <li className="mb-2">• Create custom voucher campaigns</li>
              <li className="mb-2">• Get detailed analytics</li>
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
            <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to register for the voucher management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(event) => handleRegisterSubmit(event)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    ref={emailInputRef}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    ref={nameInputRef}
                    id="name"
                    type="name"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">Organization</Label>
                  <Input
                    ref={companyInputRef}
                    id="company"
                    type="text"
                    placeholder="Your organization name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    ref={contactInputRef}
                    id="contact"
                    type="text"
                    placeholder="Your contact number"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="residence">Residence</Label>
                  <Input
                    ref={residenceInputRef}
                    id="residence"
                    type="text"
                    placeholder="Your residence address"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password2">Confirm Password</Label>
                  <Input
                    ref={password2InputRef}
                    id="password2"
                    type="password"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                    <p className="text-sm font-semibold">Form Error</p>
                    <p className="text-sm">{formError}</p>
                  </div>
                )}
                {formSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded">
                    <p className="text-sm font-semibold">
                      Registration successful, redirecting to the app
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
                      Processing
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}