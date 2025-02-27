import React from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BarChart, Users, Brain, Code, Heart, Target } from 'lucide-react';

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

// Componente para una dimensión de capacidad
const CapabilityDimension = ({ icon: Icon, title, description }) => {
  return (
    <Card className="border-2 border-gray-100 hover:border-yellow-400 transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-blue-900 p-4 mb-4">
            <Icon className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="text-xl font-westmount font-semibold mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para una característica con número
const NumberedFeature = ({ number, title, description }) => {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <div className="rounded-full bg-yellow-400 w-12 h-12 flex items-center justify-center">
          <span className="font-westmount text-blue-900 text-xl font-bold">{number}</span>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-westmount font-semibold mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

// Componente para paso del proceso
const ProcessStep = ({ number, title, description }) => {
  return (
    <Card className="p-6 border-2 border-gray-100 hover:border-yellow-400 transition-colors h-full">
      <CardContent className="pt-6">
        <div className="rounded-full bg-yellow-400 w-12 h-12 flex items-center justify-center mb-4">
          <span className="font-westmount text-blue-900 text-xl font-bold">{number}</span>
        </div>
        <h3 className="text-xl font-westmount font-semibold mb-4">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

// Card con stats/métricas de impacto
const ImpactCard = ({ title, stat, description }) => {
  return (
    <Card className="border-2 border-gray-100 hover:border-blue-900 transition-all hover:shadow-md">
      <CardContent className="p-6">
        <h3 className="text-xl font-westmount font-semibold mb-2 text-blue-900">{title}</h3>
        <p className="text-4xl font-bold text-yellow-500 mb-2">{stat}</p>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

const AssessmentPage = () => {
  const capabilities = [
    {
      icon: BarChart,
      title: "Capacidades Organizacionales",
      description: "Alineación con objetivos, comprensión de dinámicas organizacionales y gestión eficiente de recursos."
    },
    {
      icon: Users,
      title: "Capacidades Interpersonales",
      description: "Comunicación interdisciplinaria, facilitación de workshops y manejo efectivo de conflictos."
    },
    {
      icon: Brain,
      title: "Capacidades Cognitivas",
      description: "Comprensión de sistemas complejos, pensamiento abstracto y generación de soluciones innovadoras."
    },
    {
      icon: Code,
      title: "Capacidades Técnicas",
      description: "Dominio de metodologías UCD, prototipado efectivo y competencia en herramientas digitales."
    },
    {
      icon: Heart,
      title: "Capacidades Emocionales",
      description: "Empatía con usuarios y stakeholders, resiliencia profesional y gestión efectiva del estrés."
    },
    {
      icon: Target,
      title: "Capacidades de Liderazgo",
      description: "Inspiración y motivación de equipos, toma de decisiones estratégicas y desarrollo de talento."
    }
  ];

  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-westmount font-bold mb-8 leading-tight">
              Evalúa y potencia tus capacidades de Diseño de Servicios
            </h1>
            <p className="text-xl mb-12 text-blue-100 leading-relaxed">
              Una herramienta de auto-evaluación basada en investigación que ayuda a profesionales y organizaciones a identificar fortalezas y oportunidades en las capacidades críticas de diseño de servicios.
            </p>
            <StrategyzerButton onClick={() => window.location.href = '/assessment'}>
              Iniciar Evaluación
            </StrategyzerButton>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-westmount font-bold text-center text-gray-900 mb-12">
              Impacto demostrado de las capacidades efectivas
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <ImpactCard 
                title="Satisfacción del cliente" 
                stat="+23%" 
                description="Organizaciones con capacidades de diseño bien desarrolladas"
              />
              <ImpactCard 
                title="Retención de clientes" 
                stat="+18%" 
                description="Impacto en la fidelización mediante diseño centrado en usuario"
              />
              <ImpactCard 
                title="Velocidad de proyecto" 
                stat="+40%" 
                description="Equipos con altas capacidades de colaboración en diseño"
              />
              <ImpactCard 
                title="Engagement" 
                stat="+31%" 
                description="Aumento en equipos con liderazgo efectivo de servicios"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Dimensions Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-westmount font-bold text-gray-900 mb-4">
                Las 6 dimensiones de capacidades evaluadas
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Nuestro marco teórico, basado en investigación, evalúa capacidades profesionales críticas para el diseño de servicios efectivo.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((capability, index) => (
                <CapabilityDimension
                  key={index}
                  icon={capability.icon}
                  title={capability.title}
                  description={capability.description}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-westmount font-bold text-gray-900 mb-12">
              ¿Qué obtendrás con esta evaluación?
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              <NumberedFeature 
                number="1"
                title="Diagnóstico detallado" 
                description="Evaluación profunda de tus capacidades actuales basada en un marco teórico validado por investigación."
              />
              <NumberedFeature 
                number="2"
                title="Análisis dimensional" 
                description="Identificación de fortalezas y oportunidades en cada una de las 6 dimensiones clave."
              />
              <NumberedFeature 
                number="3"
                title="Recomendaciones personalizadas" 
                description="Sugerencias específicas sobre recursos y acciones para mejorar en cada área evaluada."
              />
              <NumberedFeature 
                number="4"
                title="Plan de desarrollo" 
                description="Priorización clara de áreas de enfoque para maximizar tu impacto profesional."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Process Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-westmount font-bold text-gray-900 mb-12 text-center">
              Proceso de Evaluación
            </h2>
            
            <div className="grid gap-8 md:grid-cols-3">
              <ProcessStep 
                number="1" 
                title="Auto-Evaluación"
                description="Completa nuestro cuestionario integral diseñado para evaluar las 24 capacidades clave en 6 dimensiones."
              />
              <ProcessStep 
                number="2" 
                title="Análisis"
                description="Nuestro sistema analiza tus respuestas utilizando algoritmos basados en investigación académica y benchmarks de la industria."
              />
              <ProcessStep 
                number="3" 
                title="Resultados & Recomendaciones"
                description="Recibe un informe detallado con insights accionables y una hoja de ruta clara para tu desarrollo profesional."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Research Base Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
              <h2 className="text-3xl font-westmount font-bold text-blue-900 mb-6">
                Respaldo teórico y empírico
              </h2>
              <p className="text-lg mb-6">
                Esta herramienta está basada en un análisis teórico comprehensivo que identifica las dimensiones clave de capacidades profesionales y condiciones organizacionales en diseño de servicios.
              </p>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Respaldado por investigación de:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                    <span>Karpen et al. (2017): "A multilevel consideration of service design conditions"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                    <span>Kleinsmann et al. (2012): "Development of design collaboration skills"</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                    <span>Zheng et al. (2020): "Service Leadership, Work Engagement, and Service Performance"</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-westmount font-bold mb-6">
              ¿Listo para potenciar tus capacidades?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Inicia tu evaluación hoy y recibe insights accionables en minutos para impulsar tu desarrollo profesional.
            </p>
            <StrategyzerButton onClick={() => window.location.href = '/assessment'}>
              Iniciar Evaluación
            </StrategyzerButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AssessmentPage;
