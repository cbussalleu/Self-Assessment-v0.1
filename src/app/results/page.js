'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setResults({
      score: 75,
      level: "Proficient",
      title: "Strong Foundation with Room to Grow",
      description: "Your organization has established good practices in service design.",
      recommendations: [
        "Strengthen existing assessment processes",
        "Implement more systematic evaluation methods",
        "Develop more comprehensive feedback loops"
      ],
      areas: [
        { name: "Organizational Alignment", score: 80 },
        { name: "Design Thinking", score: 70 },
        { name: "Communication", score: 75 },
        { name: "Leadership", score: 65 }
      ]
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading your results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">No results found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-westmount">
      {/* Hero Section */}
      <section className="bg-[#0026df] text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-8">Your Assessment Results</h1>
            <div className="text-8xl font-bold mb-4">{results.score}%</div>
            <p className="text-2xl">{results.level}</p>
          </div>
        </div>
      </section>

      {/* Results Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Overview Card */}
            <Card className="mb-12 bg-[#FFD642]">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-[#0026df] mb-4">{results.title}</h2>
                <p className="text-xl text-[#0026df]">{results.description}</p>
              </CardContent>
            </Card>

            {/* Areas Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {results.areas.map((area, index) => (
                <Card key={index} className="p-6 border-2 border-gray-100">
                  <CardContent>
                    <h3 className="text-xl font-semibold mb-4">{area.name}</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-[#0026df] h-4 rounded-full" 
                          style={{ width: `${area.score}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">{area.score}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendations */}
            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold mb-6">Key Recommendations</h2>
                <div className="space-y-4">
                  {results.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="rounded-full bg-[#0026df] w-8 h-8 flex items-center justify-center text-white">
                          {index + 1}
                        </div>
                      </div>
                      <p className="text-lg">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
