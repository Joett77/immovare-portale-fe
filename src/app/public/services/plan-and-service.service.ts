import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { catchError, firstValueFrom, throwError } from 'rxjs';

import { environment_dev } from '../../environments/env.dev';
import { Plan } from '../interface/plan.interface';

@Injectable({
  providedIn: 'root',
})
export class PlanAndServiceService {
  private http = inject(HttpClient);
  private apiUrl = environment_dev.apiUrl;

  private plansList: WritableSignal<Plan[]> = signal([] as Plan[]);
  private serviceList: WritableSignal<Plan[]> = signal([] as Plan[]);
  private filterDataPlan: WritableSignal<undefined | any> = signal(undefined);
  private filterDataService: WritableSignal<undefined | any> = signal(undefined);
  plansList$ = this.plansList.asReadonly();
  serviceList$ = this.serviceList.asReadonly();

  filterEffect = effect(() => {
    console.log('[PlanService] Effetto di filtro attivato');
    console.log('[PlanService] Dati di filtro per piani:', this.filterDataPlan());
    if (this.filterDataPlan()) {
      this.getPlan(this.filterDataPlan());
    }
    if (this.filterDataService()) {
      this.getService(this.filterDataService());
    }
  });

  planDefault: Plan[] = [];

  constructor() {
    console.log('[PlanService] API URL configurato:', this.apiUrl);
  }

  async getPlan(filterData?: any) {
    let res: Plan[] = this.planDefault;
    try {
      const endpoint = `${this.apiUrl}/api/plans`;

      res = await firstValueFrom(
        this.http.get<Plan[]>(endpoint, { params: { ...filterData, isService: false } }).pipe(
          catchError(err => {
            console.error('[PlanService] Errore nella richiesta HTTP:', err);
            throw err;
          })
        )
      );
      console.log('[PlanService] Risposta ricevuta con successo:', res.length, 'elementi');
    } catch (error) {
      console.warn('[PlanService] Fallback ai dati di default:', error);
      // In caso di errore, utilizziamo i dati di default
    }
    this.plansList.set(res);
  }
  async getService(filterData?: any) {
    let res: Plan[] = this.planDefault;
    try {
      const endpoint = `${this.apiUrl}/api/plans`;

      res = await firstValueFrom(
        this.http.get<Plan[]>(endpoint, { params: { ...filterData, isService: true } }).pipe(
          catchError(err => {
            console.error('[PlanService] Errore nella richiesta HTTP:', err);
            throw err;
          })
        )
      );

      console.log('[PlanService] Risposta ricevuta con successo:', res.length, 'elementi');
    } catch (error) {
      console.warn('[PlanService] Fallback ai dati di default:', error);
      // In caso di errore, utilizziamo i dati di default
    }
    this.serviceList.set(res);
  }

  async deletePlanOrService(id: number) {
    const endpoint = `${this.apiUrl}/api/plans/${id}`;
    return await firstValueFrom(this.http.delete<Plan>(endpoint));
  }

  async deleteAndDeactivatePlanOrService(id: number) {
    const endpoint = `${this.apiUrl}/api/plans/${id}/delete-and-disable`;
    return await firstValueFrom(this.http.put<Plan>(endpoint, {}));
  }

  async updatePlanOrService(data: Plan) {
    const endpoint = `${this.apiUrl}/api/plans/${data.id}`;
    return await firstValueFrom(this.http.put<Plan>(endpoint, data));
  }

  async activatePlan(id: string) {
    const endpoint = `${this.apiUrl}/api/plans/${id}/activate`;
    return await firstValueFrom(this.http.put<Plan>(endpoint, {}));
  }

  async deactivatePlan(id: string) {
    const endpoint = `${this.apiUrl}/api/plans/${id}/deactivate`;
    return await firstValueFrom(this.http.put<Plan>(endpoint, {}));
  }

  async getById(id: string) {
    const endpoint = `${this.apiUrl}/api/plans/${id}`;
    return await firstValueFrom(this.http.get<Plan>(endpoint));
  }
  async add(plan: Plan) {
    const endpoint = `${this.apiUrl}/api/plans`;
    try {
      console.log('[PlanService] Inizio richiesta POST a:', endpoint, plan);

      const res = await firstValueFrom(
        this.http.post<Plan>(endpoint, plan).pipe(
          catchError(err => {
            console.error("[PlanService] Errore durante l'aggiunta del piano:", err);
            return throwError(() => err);
          })
        )
      );

      console.log('[PlanService] Piano aggiunto con successo:', res);
      return res;
    } catch (error) {
      console.error("[PlanService] Errore durante l'aggiunta del piano:", error);
      throw error;
    }
  }

  setFilterPlan(dati: any) {
    this.filterDataPlan.set(undefined);
  }
  setFilterService(dati: any) {
    this.filterDataService.set(undefined);
  }

  updateFilterPlan(dati: any) {
    this.filterDataPlan.update(() => {
      const newData: any = {};

      for (const key in dati) {
        const value = dati[key];
        if (value !== null && value !== undefined && value !== '') {
          newData[key] = value;
        }
      }

      return newData;
    });
  }
  updateFilterService(dati: any) {
    this.filterDataService.update(data => {
      const newData: any = {};

      for (const key in dati) {
        const value = dati[key];
        if (value !== null && value !== undefined && value !== '') {
          newData[key] = value;
        }
      }

      return newData;
    });
  }
}
