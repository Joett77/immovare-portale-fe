import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment_dev } from '../../../environments/env.dev';

@Injectable({ providedIn: 'root' })
export class PropertyAsyncResolver implements Resolve<any> {
  constructor(private http: HttpClient) {}

  async resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    return await firstValueFrom(
      this.http.get(`${environment_dev.apiUrl}/api/advertisements/${id}`)
    );
  }
}
