import './polyfills';

import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Error handling for bootstrap
function handleBootstrapError(err: any) {
  console.error('Angular bootstrap error:', err);
  
  // Show user-friendly error message
  const appRoot = document.querySelector('app-root');
  if (appRoot) {
    appRoot.innerHTML = `
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1 style="color: #dc3545;">Application Failed to Start</h1>
        <p>There was an error loading the application.</p>
        <details style="margin: 20px 0; text-align: left; max-width: 600px; margin: 20px auto;">
          <summary style="cursor: pointer; font-weight: bold;">Show Error Details</summary>
          <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow: auto; margin-top: 10px;">${err.message || 'Unknown error'}</pre>
        </details>
        <button onclick="location.reload()" 
                style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
}

// Check for browser compatibility
function checkBrowserCompatibility() {
  const isIE = /*@cc_on!@*/false || !!document.documentMode;
  const isEdgeLegacy = !isIE && !!window.StyleMedia;
  
  if (isIE) {
    console.warn('Internet Explorer detected - limited compatibility');
  }
  
  if (isEdgeLegacy) {
    console.warn('Legacy Edge detected - some features may not work');
  }
  
  // Check for required features
  const requiredFeatures = [
    'Promise',
    'fetch',
    'Map',
    'Set',
    'Symbol'
  ];
  
  const missingFeatures = requiredFeatures.filter(feature => !(feature in window));
  
  if (missingFeatures.length > 0) {
    console.warn('Missing browser features:', missingFeatures);
  }
  
  return missingFeatures.length === 0;
}

// Bootstrap the application
if (checkBrowserCompatibility()) {
  bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot(routes, {
          // Enable router compatibility for older browsers
          useHash: false,
          enableTracing: false
        })
      )
    ]
  }).catch(handleBootstrapError);
} else {
  console.error('Browser compatibility check failed');
  handleBootstrapError(new Error('Browser not compatible - missing required features'));
}