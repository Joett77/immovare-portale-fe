import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, ResolveFn } from '@angular/router';
import { environment_dev } from '../../environments/env.dev';
import { AuthService } from '../services/auth.service';

@Inject({providedIn: 'root'})
export class SavedSearchesResolver implements Resolve<any>{
  private http = inject<HttpClient>(HttpClient);
  private authService = inject(AuthService);
  private userToken = this.authService.getToken();

  resolve(route: ActivatedRouteSnapshot){
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.userToken}`
    })
    return this.http.get(`${environment_dev.apiUrl}/api/customers/saved-searches/get-all`, {headers})
  }
};
