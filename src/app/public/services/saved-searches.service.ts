import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Property, SavedSearches } from '../models';
import { environment_dev } from '../../environments/env.dev';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

const apiUrl = environment_dev.apiUrl;
const apiToken = environment_dev.strapiToken;

@Injectable({
  providedIn: 'root',
})
export class SavedSearchesService {
  private http = inject<HttpClient>(HttpClient);
  private authService = inject(AuthService);
  private token = this.authService.getToken();
  private headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });
  private postReqApiUrl = `${apiUrl}/api/customers/saved-searches/add`;
  savedSearchList: WritableSignal<Property[]> = signal<Property[]>([]);
  favoritePropertiesList: WritableSignal<Property[]> = signal<Property[]>([]);
  activeTab: WritableSignal<string> = signal<string>('');
}
