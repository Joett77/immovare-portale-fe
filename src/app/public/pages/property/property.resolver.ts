import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

import { environment_dev } from '../../../environments/env.dev';

@Injectable({ providedIn: 'root' })
export class PropertyResolver implements Resolve<any> {
  constructor(private http: HttpClient) {}

  resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    return this.http.get(`${environment_dev.apiUrl}/api/advertisements/${id}`);
  }
}
