import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'hammerjs';

// import { defineCustomElements } from '@ionic/pwa-elements/loader';
declare var $: any;

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// Call the element loader after the platform has been bootstrapped
// defineCustomElements(window);

// Prevent keyboard push up webview
$('input').on('focus', function(e) {
  e.preventDefault(); e.stopPropagation();
  window.scrollTo(0,0); //the second 0 marks the Y scroll pos. Setting this to i.e. 100 will push the screen up by 100px. 
});