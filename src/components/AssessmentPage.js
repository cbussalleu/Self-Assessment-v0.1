'use client';

import React from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from 'lucide-react';

// Componente personalizado para el botón estilo Strategyzer
const StrategyzerButton = ({ children, onClick, className = "" }) => {
  return (
    <Button 
      className={`
        group relative
        bg-yellow-400 hover:bg-yellow-500 
        text-blue-900 
        px-8 py-6 
        text-lg 
        rounded-lg
        font-westmount font-semibold
        flex items-center gap-3
        transition-all
        ${className}
      `}
      onClick={onClick}
    >
      {children}
      <div className="
        w-10 h-10 
        rounded-full 
        bg-blue-900 
        flex items-center justify-center
        group-hover:bg-blue-800
      ">
        <ArrowRight className="w-5 h-5 text-yellow-400" />
      </div>
    </Button>
  );
};
const AssessmentPage = () => {
  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section - Strategyzer style blue background */}
      <section className="bg-blue-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-westmount font-bold mb-8 leading-tight">
              Take control of your self-assessment and drive real results
            </h1>
            <p className="text-xl mb-12 text-blue-100 leading-relaxed">
              An innovative assessment tool that helps you understand where you stand and guides you through the process of improvement, with outcome-oriented evaluation to produce quality insights.
            </p>
            <StrategyzerButton 
  onClick={() => window.location.href = '/assessment'}
>
  Start Assessment
</StrategyzerButton>
          </div>
        </div>
      </section>

      {/* What's in it for you Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-westmount font-bold text-gray-900 mb-12">
              What's in it for you
            </h2>
<div className="grid gap-8 md:grid-cols-2">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-yellow-400 w-12 h-12 flex items-center justify-center">
                    <span className="font-westmount text-blue-900 text-xl font-bold">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-westmount font-semibold mb-3">Comprehensive Assessment</h3>
                  <p className="text-gray-600">
                    Get a clear picture of your current state through our proven assessment methodology.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-yellow-400 w-12 h-12 flex items-center justify-center">
                    <span className="font-westmount text-blue-900 text-xl font-bold">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-westmount font-semibold mb-3">Data-Driven Insights</h3>
                  <p className="text-gray-600">
                    Receive detailed analytics and benchmarking against industry standards.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-yellow-400 w-12 h-12 flex items-center justify-center">
                    <span className="font-westmount text-blue-900 text-xl font-bold">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-westmount font-semibold mb-3">Actionable Recommendations</h3>
                  <p className="text-gray-600">
                    Get personalized improvement suggestions based on your assessment results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
{/* Assessment Process Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-westmount font-bold text-gray-900 mb-12 text-center">
              Our Assessment Process
            </h2>
            
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="p-6 border-2 border-gray-100 hover:border-yellow-400 transition-colors">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-yellow-400 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="font-westmount text-blue-900 text-xl font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-westmount font-semibold mb-4">Self-Assessment</h3>
                  <p className="text-gray-600">
                    Complete our comprehensive questionnaire designed to evaluate key aspects of your organization.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 border-2 border-gray-100 hover:border-yellow-400 transition-colors">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-yellow-400 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="font-westmount text-blue-900 text-xl font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-westmount font-semibold mb-4">Analysis</h3>
                  <p className="text-gray-600">
                    Our system analyzes your responses using advanced algorithms and industry benchmarks.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 border-2 border-gray-100 hover:border-yellow-400 transition-colors">
                <CardContent className="pt-6">
                  <div className="rounded-full bg-yellow-400 w-12 h-12 flex items-center justify-center mb-4">
                    <span className="font-westmount text-blue-900 text-xl font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-westmount font-semibold mb-4">Results & Roadmap</h3>
                  <p className="text-gray-600">
                    Receive a detailed report with actionable insights and a clear improvement roadmap.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
 {/* CTA Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-westmount font-bold mb-6">
              Ready to improve?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Start your assessment today and get actionable insights within minutes.
            </p>
            <StrategyzerButton 
  onClick={() => window.location.href = '/assessment'}
>
  Start Assessment
</StrategyzerButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AssessmentPage;
