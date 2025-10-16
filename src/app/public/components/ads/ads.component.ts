import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HeaderComponent } from '../../../layout/header/header.component';
import { ActionsDropdownComponent } from '../../../shared/action/app-actions-dropdown/app-actions-dropdown.component';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { AtticIconComponent } from '../../../shared/atoms/icons/attic-icon/attic-icon.component';
import { BathIconComponent } from '../../../shared/atoms/icons/bath-icon/bath-icon.component';
import { CalendarIconComponent } from '../../../shared/atoms/icons/calendar-icon/calendar-icon.component';
import { CheckIconComponent } from '../../../shared/atoms/icons/check-icon/check-icon.component';
import { DirectingArrowIconComponent } from '../../../shared/atoms/icons/directing-arrow-icon/directing-arrow--icon.component';
import { DocumenIconComponent } from '../../../shared/atoms/icons/document-icon/document-icon--icon.component';
import { FloorIconComponent } from '../../../shared/atoms/icons/floor-icon/floor-icon.component';
import { FloorplanIconComponent } from '../../../shared/atoms/icons/floorplan-icon/floorplan-icon.component';
import { LocationDotIconComponent } from '../../../shared/atoms/icons/location-dot-icon/apartment-icon.component';
import { LoftIconComponent } from '../../../shared/atoms/icons/loft-icon/loft-icon.component';
import { MailIconComponent } from '../../../shared/atoms/icons/mail-icon/mail-icon.component';
import { MapIconComponent } from '../../../shared/atoms/icons/map-icon/map-icon.component';
import { MeasureIconComponent } from '../../../shared/atoms/icons/measure-icon/measure-icon.component';
import { SettingsIconComponent } from '../../../shared/atoms/icons/settings-icon/settings-icon.component';
import { TrashIconComponent } from '../../../shared/atoms/icons/trash-icon/trash-icon.component';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    ButtonComponent,
    MapIconComponent,
    FloorIconComponent,
    LocationDotIconComponent,
    TrashIconComponent,
    FloorplanIconComponent,
    AtticIconComponent,
    MeasureIconComponent,
    BathIconComponent,
    CalendarIconComponent,
    LoftIconComponent,
    MailIconComponent,
    CheckIconComponent,
    DirectingArrowIconComponent,
    SettingsIconComponent,
    DocumenIconComponent,
    ActionsDropdownComponent
],
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.scss']
})
export class AdsComponent {
  [x: string]: any;

  @Input() plan: 'exclusive' | 'free' | 'pro' = 'exclusive';

  annuncio = {
    image: 'assets/case.png',
    status: 'Pubblicato',
    number: '1/12',
    title: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    details: 'Marina di Pulsano TA, Puglia, Italia',
    visitors: 37,
    requests: 1,
    meeting: 1,
    renewalDate: '22/04/2025',
  };
}
