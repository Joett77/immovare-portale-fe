import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ModalType = 'login' | 'register' | 'verification' | 'resetPassword' | null;

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  private modalStateSubject = new BehaviorSubject<ModalType>(null);
  modalState$ = this.modalStateSubject.asObservable();

  openModal(type: ModalType) {
    this.modalStateSubject.next(type);
  }

  closeModal() {
    this.modalStateSubject.next(null);
  }
}
