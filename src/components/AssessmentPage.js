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
