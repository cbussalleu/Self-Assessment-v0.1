'use client';
import React from 'react';
import { Widget } from '@typeform/embed-react';

export default function AssessmentForm() {
  return (
    <div className="min-h-screen">
      <div className="h-screen">
        <Widget 
          id="iYIBGmUK"
          style={{ width: '100%', height: '100%' }} 
          className="my-form"
          onSubmit={(event) => {
            console.log('Typeform submission event:', event);
            
            // Usar token o response_id, con múltiples fallbacks
            const responseId = 
              event.response_id || 
              event.token || 
              event.responseId;

            if (responseId) {
              console.log('Redirecting with response ID:', responseId);
              window.location.href = `/results?response_id=${responseId}`;
            } else {
              console.warn('No response ID found in submission event');
              window.location.href = '/results';
            }
          }}
        />
      </div>
    </div>
  );
}
