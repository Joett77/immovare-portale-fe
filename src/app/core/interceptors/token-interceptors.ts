import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export const TokenInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const keycloak = inject(KeycloakService);

  // Escludiamo eventuali endpoint che non richiedono autenticazione
  if (shouldSkip(request.url)) return next(request);
  // l'utente non e loggato
  if (!keycloak.isLoggedIn()) return next(request);

  return from(keycloak.getToken()).pipe(
    switchMap(token => {
      // Se non abbiamo un token, passiamo la richiesta senza modificarla
      if (!token) return next(request);

      // Se abbiamo un token, lo aggiungiamo all'intestazione Authorization della richiesta
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(authRequest);
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Reindirizza all'autenticazione Keycloak
        keycloak.login();
      }
      return throwError(() => error);
    })
  );
};

// Funzione per escludere determinate URL dall'interceptor - migliorata per ridurre falsi positivi
function shouldSkip(url: string): boolean {
  // Aggiungi qui gli URL che non richiedono autenticazione
  const excludedUrls = [
    '/assets/',
    '/public-api',
    // Aggiungi altri URL se necessario
  ];

  // Controllo più preciso per evitare falsi positivi
  const shouldExclude = excludedUrls.some(excludedUrl => {
    // Controlla se l'URL inizia con il prefisso escluso o contiene segmenti di path esatti
    const isExact = url.includes(`/${excludedUrl}`) || url.startsWith(excludedUrl);

    return isExact;
  });

  return shouldExclude;
}
