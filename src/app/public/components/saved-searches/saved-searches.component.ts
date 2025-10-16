import { Component, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { TrashIconComponent } from '../../../shared/atoms/icons/trash-icon/trash-icon.component';
import { SavedSearchCardComponent } from "../../../shared/organisms/saved-search-card/saved-search-card.component";
import { FavoritePropertyCardComponent } from "../../../shared/organisms/favorite-property-card/favorite-property-card.component";
import { SavedSearchesService } from '../../../public/services/saved-searches.service';
import { Property } from '../../../public/models';

@Component({
  selector: 'app-saved-searches',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TrashIconComponent,
    SavedSearchCardComponent,
    FavoritePropertyCardComponent
],
  templateUrl: './saved-searches.component.html',
})
export class SavedSearchesComponent {
  savedSearchesService = inject(SavedSearchesService);
  savedSearchesList: WritableSignal<Property[]> = this.savedSearchesService.savedSearchList;
  favoritePropertiesList: WritableSignal<Property[]> = this.savedSearchesService.favoritePropertiesList;
  activeTab: WritableSignal<string> = this.savedSearchesService.activeTab;
  [x: string]: any;
  currentPage: number = 1;

  switchTab(tab: string) {
    this.activeTab.set(tab);
  }

  deleteAll() {
    if (this.activeTab() === 'saved') {
      this.savedSearchesList.set([]);
    } else if (this.activeTab() === 'favorite-realestate') {
      this.favoritePropertiesList.set([]);
    }
  }

  showDeleteAll() {
    return this.activeTab() === 'saved' ? this.savedSearchesList().length > 0 : this.favoritePropertiesList().length > 0;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    this.currentPage++;
  }
}
