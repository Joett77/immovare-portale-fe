import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadIconComponent } from '../icons/upload-icon/upload-icon.component';
import { ResetIconComponent } from '../icons/reset-icon/reset-icon.component';
import { FloppyIconComponent } from '../icons/floppy-icon/floppy-icon.component';
import { BarsFilterIconComponent } from '../icons/bars-filter-icon/bars-filter-icon.component';
import { MapIconComponent } from '../icons/map-icon/map-icon.component';
import { ListIconComponent } from '../icons/list-icon/list-icon.component';
import { VillasIconComponent } from '../icons/villas-icon/villas-icon.component';
import { ShopIconComponent } from '../icons/shop-icon/shop-icon.component';
import { SettingsIconComponent } from '../icons/settings-icon/settings-icon.component';
import { DocumenIconComponent } from '../icons/document-icon/document-icon--icon.component';
import { SearchIconComponent } from '../icons/search-icon/search-icon.component';
import { CheckIconComponent } from '../icons/check-icon/check-icon.component';
import { TrashIconComponent } from '../icons/trash-icon/trash-icon.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';

type ButtonType = 'primary' | 'secondary' | 'withoutBorder' | 'withoutBackground' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'none' | 'nopadding';
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    CommonModule,
    UploadIconComponent,
    ResetIconComponent,
    FloppyIconComponent,
    BarsFilterIconComponent,
    MapIconComponent,
    ListIconComponent,
    VillasIconComponent,
    ShopIconComponent,
    SettingsIconComponent,
    DocumenIconComponent,
    SearchIconComponent,
    CheckIconComponent,
    TrashIconComponent,
    FaIconComponent,
  ],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() icon: boolean = false;
  @Input() iconType:
    | 'arrow-left'
    | 'arrow-right'
    | 'arrow-down'
    | 'arrow-up'
    | 'download'
    | 'upload'
    | 'bars-filter'
    | 'reset'
    | 'floppy'
    | 'map'
    | 'list'
    | 'villas'
    | 'shop'
    | 'search'
    | 'edit'
    | 'document'
    | 'settings'
    | 'check'
    | 'trash'
    | 'ban'
    | 'ok' = 'arrow-right';
  @Input() iconPosition: 'left' | 'right' = 'right';
  @Input() text: string | undefined = '';
  //primary, secondary, without border
  @Input() type: ButtonType = 'primary';
  @Input() isDisabled: boolean = false;
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() link: string = '';

  @Input() hasBorder: boolean = true;
  //size: small, medium, large
  @Input() size: ButtonSize = 'none';
  //add custom class
  @Input() fullWidth: boolean = false;

  @Output() buttonClick = new EventEmitter<void>();

  onClick(): void {
    this.buttonClick.emit();
  }

  protected readonly faBan = faBan;
}
