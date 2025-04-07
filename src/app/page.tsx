"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Ticket, Crown } from "lucide-react";
import Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { useRouter } from "next/navigation";

function SubscriptionPlans() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelection = (plan: string) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      router.push(`/payment?plan=${selectedPlan}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-800 py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-4">
              <Ticket className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-white font-bold text-3xl text-center">Voucher Portal</h1>
            <p className="text-white text-center mt-2">Choose your subscription plan</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800">Select Your Plan</h2>
              <p className="text-gray-600 mt-3">
                Choose the plan that best fits your voucher management needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Basic Plan */}
              <Card
                className={`border-2 ${
                  selectedPlan === "basic"
                    ? "border-blue-500 shadow-lg shadow-blue-100 scale-105"
                    : "border-gray-200"
                } transition-all duration-300 hover:shadow-md cursor-pointer`}
                onClick={() => handlePlanSelection("basic")}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-800">Basic Plan</CardTitle>
                      <CardDescription className="text-gray-600">
                        For small businesses and startups
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-gray-800">
                      €19<span className="text-gray-500 text-lg font-normal">/month</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Billed monthly or €190/year</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Up to 500 vouchers per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Basic analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Email support</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Advanced Plan */}
              <Card
                className={`border-2 ${
                  selectedPlan === "advanced"
                    ? "border-blue-500 shadow-lg shadow-blue-100 scale-105"
                    : "border-gray-200"
                } transition-all duration-300 hover:shadow-md cursor-pointer`}
                onClick={() => handlePlanSelection("advanced")}
              >
                <CardHeader className="pb-2">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    RECOMMENDED
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl font-bold text-gray-800">Advanced Plan</CardTitle>
                        <Crown className="h-5 w-5 text-amber-500" />
                      </div>
                      <CardDescription className="text-gray-600">
                        For growing businesses
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-gray-800">
                      €49<span className="text-gray-500 text-lg font-normal">/month</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Billed monthly or €490/year</p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Unlimited vouchers</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Advanced analytics and reporting</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Continue Button */}
            <div className="text-center mt-8">
              <Button
                className={`px-6 py-3 text-white font-bold rounded-lg ${
                  selectedPlan
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={handleContinue}
                disabled={!selectedPlan}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default SubscriptionPlans;