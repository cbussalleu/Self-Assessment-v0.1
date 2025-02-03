import React from 'react';
import { Button } from "@/components/ui/button";
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
            <StrategyzerButton onClick={() => window.open('TU_ENLACE_TYPEFORM', '_blank')}>
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
