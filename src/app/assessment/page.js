'use client';

import React from 'react';
import { Widget } from '@typeform/embed-react';

export default function AssessmentForm() {
  return (
    <div className="min-h-screen">
      <div className="h-screen">
        <Widget 
          id="MB0YptnS"
          style={{ width: '100%', height: '100%' }} 
          className="my-form"
          onSubmit={(event) => {
            // Obtener el responseId del evento de submit
            const responseId = event.responseId; // Asegúrate de que el evento contiene el responseId
            
            // Redirigir a la página de resultados con el responseId
            if (responseId) {
              window.location.href = `/results?responseId=${responseId}`;
            } else {
              window.location.href = '/results';
            }
          }}
        />
      </div>
    </div>
  );
}
