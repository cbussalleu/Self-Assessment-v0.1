'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En un escenario real, harías una llamada a tu API para obtener los resultados
    const fetchResults = async () => {
      try {
        // Simular la obtención de resultados
        setResults({
          totalScore: 65,
          masteryLevel: {
            level: 4,
            description: "Avanzado",
            recommendations: "Alto desempeño, perfeccionar especialidades"
          },
          dimensionScores: [
            75, // Capacidades Organizacionales
            60, // Capacidades Interpersonales
            70, // Capacidades Cognitivas
            65, // Capacidades Técnicas
            55, // Capacidades Emocionales
            80  // Capacidades de Liderazgo
          ],
          recommendations: {
            title: "Alto Desempeño",
            description: "Estás muy cerca de la maestría. Enfócate en la innovación y el liderazgo.",
            generalRecommendations: [
              "Lidera proyectos complejos",
              "Comparte conocimiento con otros profesionales",
              "Explora metodologías de vanguardia",
              "Desarrolla pensamiento estratégico"
            ]
          }
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

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
