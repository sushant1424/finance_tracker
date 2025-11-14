"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Star } from "lucide-react";
import Link from "next/link";

const features = [
  {
    name: "Transaction Tracking",
    free: true,
    paid: true,
  },
  {
    name: "Account Management",
    free: true,
    paid: true,
  },
  {
    name: "Basic Reports",
    free: true,
    paid: true,
  },
  {
    name: "Category Management",
    free: true,
    paid: true,
  },
  {
    name: "Advanced Analytics",
    free: false,
    paid: true,
  },
  {
    name: "Budget Planning",
    free: false,
    paid: true,
  },
  {
    name: "Investment Tracking",
    free: false,
    paid: true,
  },
  {
    name: "Export to Excel/PDF",
    free: false,
    paid: true,
  },
  {
    name: "Priority Support",
    free: false,
    paid: true,
  },
  {
    name: "Custom Categories",
    free: false,
    paid: true,
  },
];

export default function PricingCards() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free and upgrade when you need more advanced features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Free Plan
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <p className="text-gray-600 mt-2">
                Perfect for getting started with personal finance tracking
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {feature.free ? (
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                    )}
                    <span className={feature.free ? "text-gray-900" : "text-gray-400"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  className="w-full py-3 text-lg font-semibold border-2 hover:bg-gray-50"
                >
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-blue-500 hover:border-blue-600 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Most Popular
              </div>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Pro Plan
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-blue-600">$9.99</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
              <p className="text-gray-600 mt-2">
                Advanced features for serious financial management
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-900">{feature.name}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard">
                <Button 
                  className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  Start Pro Trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            All plans include 30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}
