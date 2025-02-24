'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from 'next/navigation';

function Results() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        console.log('Current URL Parameters:', searchParams.toString());
        const response_id = searchParams.get('response_id');
        
        if (!response_id) {
          console.log('No response ID found in URL');
          setError('No se encontró el identificador de resultados');
          setLoading(false);
          return;
        }

        console.log('Response ID:', response_id);
        
        const response = await fetch(`/api/results/${response_id}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching results:', errorData);
          setError(errorData.error || 'No se pudieron cargar los resultados');
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Results data from API:', data);
        
        // Formatear los datos de manera más robusta
        const processedResults = {
          totalScore: Number(data.totalScore || data.total_score || 0).toFixed(1),
          masteryLevel: data.masteryLevel || 
            (typeof data.mastery_level === 'string' 
              ? JSON.parse(data.mastery_level) 
              : { description: 'No disponible', level: 0 }),
          dimensionScores: Array.isArray(data.dimensionScores) 
            ? data.dimensionScores 
            : (data.dimension_scores 
              ? JSON.parse(data.dimension_scores) 
              : [0, 0, 0, 0, 0, 0]),
          recommendations: data.recommendations || 
            (typeof data.recommendations === 'string' 
              ? JSON.parse(data.recommendations) 
              : {
                  title: 'Recomendaciones',
                  description: 'No hay recomendaciones disponibles',
                  generalRecommendations: []
                })
        };

        setResults(processedResults);
      } catch (error) {
        console.error('Unexpected error:', error);
        setError('Ocurrió un error inesperado al cargar los resultados');
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">{error}</div>
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
      <section className="bg-[#0026df] text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-8">Resultados de tu Autoevaluación</h1>
            <div className="text-8xl font-bold mb-4">{results.totalScore}%</div>
            <p className="text-2xl">{results.masteryLevel.description}</p>
          </div>
        </div>
      </section>

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

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Cargando...</div>
      </div>
    }>
      <Results />
    </Suspense>
  );
}
