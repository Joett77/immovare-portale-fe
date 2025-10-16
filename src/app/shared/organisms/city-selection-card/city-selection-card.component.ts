import { Component, input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CityIconComponent } from '../../molecules/city-icon/city-icon.component';
import { DuomoIconComponent } from '../../atoms/icons/duomo-icon/duomo-icon.component';
import { CastelIconComponent } from '../../atoms/icons/castel-icon/castel-icon.component';
import { ChurchIconComponent } from '../../atoms/icons/church-icon/church-icon.component';
import { ColiseumIconComponent } from '../../atoms/icons/coliseum-icon/coliseum-icon.component';
import { GothicChurchIconComponent } from '../../atoms/icons/gothic-church-icon/gothic-church-icon.component';
import { PalaceIconComponent } from '../../atoms/icons/palace-icon/palace-icon.component';

interface City {
  id: number;
  label: string;
  icon: any;
  coordinates: {
    lat: number;
    lng: number;
  };
  zoom: number;
  searchQuery: string;
}

@Component({
  selector: 'app-city-selection-card',
  standalone: true,
  imports: [CityIconComponent],
  templateUrl: './city-selection-card.component.html',
})
export class CitySelectionCardComponent {
  private router = inject(Router);

  title = input<string>('Scegli dove realizzare');
  subtitle = input<string>('un sogno chiamato casa');

  cities: City[] = [
    {
      id: 1,
      label: 'Bari',
      icon: ChurchIconComponent,
      coordinates: {
        lat: 41.1171,
        lng: 16.8719,
      },
      zoom: 12,
      searchQuery: 'Bari, Italia',
    },
    {
      id: 2,
      label: 'Torino',
      icon: PalaceIconComponent,
      coordinates: {
        lat: 45.0703,
        lng: 7.6869,
      },
      zoom: 12,
      searchQuery: 'Torino, Italia',
    },
    {
      id: 3,
      label: 'Palermo',
      icon: GothicChurchIconComponent,
      coordinates: {
        lat: 38.1157,
        lng: 13.3613,
      },
      zoom: 12,
      searchQuery: 'Palermo, Italia',
    },
    {
      id: 4,
      label: 'Milano',
      icon: DuomoIconComponent,
      coordinates: {
        lat: 45.4642,
        lng: 9.19,
      },
      zoom: 12,
      searchQuery: 'Milano, Italia',
    },
    {
      id: 5,
      label: 'Roma',
      icon: ColiseumIconComponent,
      coordinates: {
        lat: 41.9028,
        lng: 12.4964,
      },
      zoom: 12,
      searchQuery: 'Roma, Italia',
    },
    {
      id: 6,
      label: 'Napoli',
      icon: CastelIconComponent,
      coordinates: {
        lat: 40.8518,
        lng: 14.2681,
      },
      zoom: 12,
      searchQuery: 'Napoli, Italia',
    },
    {
      id: 7,
      label: 'Genova',
      icon: PalaceIconComponent,
      coordinates: {
        lat: 44.4056,
        lng: 8.9463,
      },
      zoom: 12,
      searchQuery: 'Genova, Italia',
    },
  ];

  /**
   * Handle city selection and navigate to advertisements page
   * @param city Selected city object
   */
  onCityClick(city: City): void {
    const queryParams = {
      lat: city.coordinates.lat,
      lng: city.coordinates.lng,
      zoom: city.zoom,
      view: 'map',
      address: encodeURIComponent(city.searchQuery),
      formattedAddress: encodeURIComponent(city.searchQuery),
    };

    // Navigate to advertisements page with city parameters
    this.router.navigate(['/annunci-immobili'], {
      queryParams: queryParams,
    });
  }
}
