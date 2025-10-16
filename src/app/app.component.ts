import { Platform } from '@angular/cdk/platform';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { environment_dev } from './environments/env.dev';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  platform = inject(Platform);
  title = 'immovare';
  ngOnInit() {
    if (environment_dev.gtmCode && this.platform.isBrowser) {
      // Carica GTM
      const script = document.createElement('script');
      script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer', '${environment_dev.gtmCode}');
    `;
      document.head.appendChild(script);
    }
  }
}
