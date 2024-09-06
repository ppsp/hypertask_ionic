// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// ****************************************************************
// *** During deployment script this file gets overwritten by : ***
// *** src/environments/environment.source.prod.ts              ***
// ****************************************************************

export const environment = {
  production: true,
  firebase: {
    apiKey: '{your-api-key}',
    authDomain: '{your-project-id}.firebaseapp.com',
    databaseURL: 'https://{your-project-id}.firebaseio.com',
    projectId: '{your-project-id}',
    storageBucket: '{your-project-id}.appspot.com',
    messagingSenderId: '{your-message-sender-id}',
    appId: '{your-app-id}',
    measurementId: '{your-measurementId}',
  },
  apiUrl: 'https://{your-project-name}.azurewebsites.net/',
  apiUpdateXmlUrl: 'https://{your-project-name}.azurewebsites.net/staticfiles/hypertask-update.xml',
  instrumentationKey: '{your-instrumentation-key}',
};


