'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from 'next/navigation';

function ResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const responseId = searchParams.get('responseId');
        
        if (!responseId) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/results/${responseId}`);
        if (!response.ok) {
          throw new Error('Error fetching results');
        }

        const data = await response.json();
        
        // Transformar los datos de la base de datos al formato que espera la UI
        setResults({
          totalScore: data.total_score,
          masteryLevel: JSON.parse(data.mastery_level),
          dimensionScores: JSON.parse(data.dimension_scores),
          recommendations: JSON.parse(data.recommendations)
        });
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Cargando resultados...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">No se encontraron resultados</div>
      </div>
    );
  }

  const dimensionNames = [
    'Capacidades Organizacionales',
    'Capacidades Interpersonales', 
    'Capacidades Cognitivas',
    'Capacidades Técnicas', 
    'Capacidades Emocionales',
    'Capacidades de Liderazgo'
  ];

  return (
    <div className="min-h-screen font-westmount bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#0026df] text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-8">Resultados de tu Autoevaluación</h1>
            <div className="text-8xl font-bold mb-4">{results.totalScore.toFixed(1)}%</div>
            <p className="text-2xl">{results.masteryLevel.description}</p>
          </div>
        </div>
      </section>

      {/* Dimensiones */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Detalle por Dimensiones</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dimensionNames.map((dimension, index) => (
              <Card key={dimension} className="p-6">
                <CardContent>
                  <h3 className="text-xl font-semibold mb-4">{dimension}</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-[#0026df] h-4 rounded-full" 
                        style={{ width: `${results.dimensionScores[index]}%` }}
                      ></div>
                    </div>
                    <span className="font-bold">{results.dimensionScores[index].toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recomendaciones */}
      <section className="bg-[#FFD642] py-20">
        <div className="container mx-auto px-4">
          <Card className="p-8">
            <CardContent>
              <h2 className="text-3xl font-bold mb-6 text-[#0026df]">{results.recommendations.title}</h2>
              <p className="text-xl mb-8 text-[#0026df]">{results.recommendations.description}</p>
              <div className="space-y-4">
                {results.recommendations.generalRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="rounded-full bg-[#0026df] w-8 h-8 flex items-center justify-center text-white">
                        {index + 1}
                      </div>
                    </div>
                    <p className="text-lg">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function ResultsPageWrapper() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResultsPage />
    </Suspense>
  );
}
