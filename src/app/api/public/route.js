// src/app/api/public/route.js
export async function POST(request) {
  try {
    const data = await request.json();
    
    const formResponse = data.form_response;
    const responseId = formResponse.token;
    
    const processedResults = processAnswers(formResponse);
    const recommendations = getRecommendations(processedResults.score);
    
    const results = {
      responseId,
      timestamp: new Date().toISOString(),
      ...processedResults,
      recommendations
    };

    // En un caso real, aquí guardaríamos en una base de datos
    // Por ahora, podemos usar localStorage en el cliente

    return NextResponse.json({ 
      success: true,
      ...results
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Error processing webhook',
      details: error.message
    }, { status: 500 });
  }
}
