'use client';

import React from 'react';
import { Widget } from '@typeform/embed-react';

export default function AssessmentForm() {
  return (
    <div className="min-h-screen">
      <div className="h-screen">
        <Widget 
          id="iYIBGmUK" // ID actualizado del Typeform
          style={{ width: '100%', height: '100%' }} 
          className="my-form"
          onSubmit={(event) => {
            const responseId = event.responseId;
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
