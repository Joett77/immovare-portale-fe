// import-ads.component.ts
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlay,
  faSpinner,
  faCheck,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { environment_dev } from '../../../environments/env.dev';

interface ImportResult {
  success: boolean;
  reason?: string;
  error?: string;
  originalId: string;
  id?: number;
  imagesUploaded?: number;
  title?: string;
}

interface ImportSummary {
  total: number;
  successful: number;
  failed: number;
  duplicates: number;
  errors: number;
  totalImagesUploaded: number;
}

interface ImportResponse {
  summary: ImportSummary;
  results?: ImportResult[];
}

const apiUrl = environment_dev.apiUrl;
const apiToken = environment_dev.strapiToken;

@Component({
  selector: 'app-import-ads',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Importa Annunci</h1>
        <p class="text-gray-600">Importa proprietà dal file JSON locale nel progetto Strapi</p>
      </div>

      <!-- Import Button -->
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <div class="mb-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p class="text-blue-800">
              Il sistema leggerà il file
              <code class="bg-blue-100 px-2 py-1 rounded text-sm">import-ads.json</code>
              dalla cartella <code class="bg-blue-100 px-2 py-1 rounded text-sm">/data</code> del
              progetto Strapi.
            </p>
          </div>

          <button
            (click)="startImport()"
            [disabled]="isImporting()"
            class="inline-flex items-center px-6 py-3 bg-secondary text-black font-bold hover:bg-secondary-dark border-[1px] border-black justify-center"
          >
            <fa-icon
              [icon]="isImporting() ? faSpinner : faPlay"
              [class.animate-spin]="isImporting()"
              class="mr-2"
            >
            </fa-icon>
            {{ isImporting() ? 'Importazione in corso...' : 'Avvia Importazione' }}
          </button>
        </div>

        <!-- Progress -->
        <div
          *ngIf="isImporting()"
          class="mb-6"
        >
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              [style.width.%]="progress()"
            ></div>
          </div>
          <p class="text-sm text-gray-600 mt-2">{{ progress() }}%</p>
        </div>

        <!-- Results -->
        <div
          *ngIf="result()"
          class="mt-8"
        >
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div class="bg-blue-50 p-3 rounded-lg">
              <div class="text-lg font-bold text-blue-600">{{ result()!.summary.total }}</div>
              <div class="text-sm text-blue-800">Totale</div>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <div class="text-lg font-bold text-green-600">{{ result()!.summary.successful }}</div>
              <div class="text-sm text-green-800">Successo</div>
            </div>
            <div class="bg-red-50 p-3 rounded-lg">
              <div class="text-lg font-bold text-red-600">{{ result()!.summary.failed }}</div>
              <div class="text-sm text-red-800">Falliti</div>
            </div>
            <div class="bg-yellow-50 p-3 rounded-lg">
              <div class="text-lg font-bold text-yellow-600">{{
                result()!.summary.duplicates
              }}</div>
              <div class="text-sm text-yellow-800">Duplicati</div>
            </div>
            <div class="bg-purple-50 p-3 rounded-lg">
              <div class="text-lg font-bold text-purple-600">{{
                result()!.summary.totalImagesUploaded
              }}</div>
              <div class="text-sm text-purple-800">Immagini</div>
            </div>
          </div>

          <!-- Success Rate -->
          <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-600 mb-1">
              <span>Tasso di Successo</span>
              <span>{{ getSuccessRate() }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-500 h-2 rounded-full"
                [style.width.%]="getSuccessRate()"
              ></div>
            </div>
          </div>

          <!-- Message -->
          <div class="flex items-center justify-center space-x-2">
            <fa-icon
              [icon]="result()!.summary.successful > 0 ? faCheck : faExclamationTriangle"
              [class]="result()!.summary.successful > 0 ? 'text-green-500' : 'text-red-500'"
            >
            </fa-icon>
            <span [class]="result()!.summary.successful > 0 ? 'text-green-700' : 'text-red-700'">
              {{ getResultMessage() }}
            </span>
          </div>
        </div>

        <!-- Error Message -->
        <div
          *ngIf="errorMessage()"
          class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div class="flex items-center space-x-2">
            <fa-icon
              [icon]="faExclamationTriangle"
              class="text-red-500"
            ></fa-icon>
            <span class="text-red-700">{{ errorMessage() }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      code {
        font-family: 'Courier New', monospace;
      }
    `,
  ],
})
export class ImportAdsComponent {
  private http = inject(HttpClient);

  // Icons
  faPlay = faPlay;
  faSpinner = faSpinner;
  faCheck = faCheck;
  faExclamationTriangle = faExclamationTriangle;

  // State
  isImporting: WritableSignal<boolean> = signal(false);
  progress: WritableSignal<number> = signal(0);
  result: WritableSignal<ImportResponse | null> = signal(null);
  errorMessage: WritableSignal<string> = signal('');

  // Headers
  private headers = new HttpHeaders({
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  });

  async startImport(): Promise<void> {
    if (this.isImporting()) return;

    this.isImporting.set(true);
    this.progress.set(0);
    this.result.set(null);
    this.errorMessage.set('');

    try {
      console.log('Starting import...');

      // Simulate progress
      this.progress.set(10);

      const response = await this.http
        .post<ImportResponse>(
          `${apiUrl}/api/advertisements/import-ads`,
          { options: { status: 'draft', allowDuplicates: false, includeDetails: true } },
          { headers: this.headers }
        )
        .toPromise();

      this.progress.set(100);

      if (response) {
        this.result.set(response);
        console.log('Import completed:', response);
      }
    } catch (error: any) {
      console.error('Import failed:', error);
      this.errorMessage.set(
        error?.error?.message || error?.message || 'Import failed. Please try again.'
      );
    } finally {
      this.isImporting.set(false);
      setTimeout(() => this.progress.set(0), 2000);
    }
  }

  getSuccessRate(): number {
    const res = this.result();
    if (!res) return 0;
    return Math.round((res.summary.successful / res.summary.total) * 100);
  }

  getResultMessage(): string {
    const res = this.result();
    if (!res) return '';

    if (res.summary.successful === res.summary.total) {
      return `Importazione completata con successo! Tutte le ${res.summary.total} proprietà sono state importate.`;
    } else if (res.summary.successful > 0) {
      return `Importazione parzialmente completata. ${res.summary.successful}/${res.summary.total} proprietà importate.`;
    } else {
      return `Importazione fallita. Nessuna proprietà è stata importata.`;
    }
  }
}
