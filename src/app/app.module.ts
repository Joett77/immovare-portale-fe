import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // Importa il CommonModule
import { provideHttpClient } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps';
import { PublicComponent } from './public/public.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    GoogleMapsModule,
    ReactiveFormsModule,
    PublicComponent,
    BrowserAnimationsModule,
  ],
  providers: [provideHttpClient()],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
