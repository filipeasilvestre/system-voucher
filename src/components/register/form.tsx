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
  const router = useRouter();

  // References for the inputs
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const password2InputRef = useRef<HTMLInputElement>(null);
  const contactInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const postalCodeInputRef = useRef<HTMLInputElement>(null);
  const stateInputRef = useRef<HTMLInputElement>(null);
  const fatNumberInputRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleRegisterSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError("");
      setFormLoading(true);

      const emailReg = new RegExp(
        "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
      );

      if (
        emailInputRef.current &&
        nameInputRef.current &&
        companyInputRef.current &&
        password2InputRef.current &&
        passwordInputRef.current &&
        contactInputRef.current &&
        addressInputRef.current &&
        postalCodeInputRef.current &&
        stateInputRef.current &&
        fatNumberInputRef.current &&
        companyLogoInputRef.current
      ) {
        const email = emailInputRef.current.value;
        const name = nameInputRef.current.value;
        const company = companyInputRef.current.value;
        const pass1 = passwordInputRef.current.value;
        const pass2 = password2InputRef.current.value;
        const contact = contactInputRef.current.value;
        const address = addressInputRef.current.value;
        const postalCode = postalCodeInputRef.current.value;
        const state = stateInputRef.current.value;
        const fatNumber = fatNumberInputRef.current.value;
        const companyLogo = companyLogoInputRef.current.value;

        let shouldReturnError = false;

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
          const response = await axios.post<RegisterResponse>("/api/register", {
            email,
            name,
            company,
            password: pass1,
            password2: pass2,
            contact,
            address,
            postalCode,
            state,
            fatNumber,
            companyLogo,
          });

          router.push("/");

          setFormLoading(false);
          setFormSuccess(true);
        } catch (error) {
          if (error instanceof AxiosError) {
            const { error: errorMessage } = error.response
              ?.data as RegisterResponse;

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
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="flex flex-col md:w-1/2 bg-gradient-to-r from-blue-600 to-indigo-800 justify-center items-center p-6">
        <div className="text-center max-w-md py-8 md:py-0">
          <div className="flex justify-center mb-4">
            <Ticket className="h-12 w-12 md:h-16 md:w-16 text-white" />
          </div>
          <h1 className="text-white font-bold text-3xl md:text-4xl font-sans">Voucher Portal</h1>
          <p className="text-white mt-1">Manage and redeem your vouchers with ease</p>
        </div>
      </div>
      <div className="flex flex-1 md:w-1/2 justify-center items-center bg-gray-50 p-4 md:p-6">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="space-y-1">
            <div className="flex justify-center text-blue-600 mb-2">
              <Ticket className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <CardTitle className="text-xl md:text-2xl text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to register for the voucher management system
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-screen overflow-y-auto">
            <form onSubmit={(event) => handleRegisterSubmit(event)}>
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
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
                      type="text"
                      placeholder="Your Name"
                      required
                    />
                  </div>
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
                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="fatNumber">Tax Number</Label>
                    <Input
                      ref={fatNumberInputRef}
                      id="fatNumber"
                      type="text"
                      placeholder="Your tax number"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    ref={addressInputRef}
                    id="address"
                    type="text"
                    placeholder="Your street address"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      ref={postalCodeInputRef}
                      id="postalCode"
                      type="text"
                      placeholder="Your postal code"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">State/District</Label>
                    <Input
                      ref={stateInputRef}
                      id="state"
                      type="text"
                      placeholder="Your district"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyLogo">Company Logo URL</Label>
                  <Input
                    ref={companyLogoInputRef}
                    id="companyLogo"
                    type="text"
                    placeholder="URL of your company logo"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
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