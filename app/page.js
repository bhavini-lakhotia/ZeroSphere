import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  featuresData,
  howItWorksData,
  statsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Hero Section */}
      <HeroSection />

      {/* How It Works Section */}
      <section className="py-20 bg-blue-50 dark:bg-black/40 transition-colors duration-500">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-500">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
       {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finances.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card className="p-6" key={index}>
                <CardContent className="space-y-4 pt-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

<section className="py-20 bg-blue-50 dark:bg-black/40 transition-colors duration-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-purple-300 mb-2 transition-colors duration-500">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 transition-colors duration-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
       <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-500 to-pink-400 dark:from-black dark:via-purple-900 dark:to-blue-900 transition-colors duration-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-blue-100 dark:text-purple-200 mb-8 max-w-2xl mx-auto transition-colors duration-500">
            Join thousands of users who are already managing their finances
            smarter with ZeroSphere.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-500 dark:text-white dark:hover:bg-purple-600 transition-colors duration-300 animate-bounce"
            >
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
