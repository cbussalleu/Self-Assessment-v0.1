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
          onSubmit={() => {
            // Redirigir a la página de resultados
            window.location.href = '/results';
          }}
        />
      </div>
    </div>
  );
}
