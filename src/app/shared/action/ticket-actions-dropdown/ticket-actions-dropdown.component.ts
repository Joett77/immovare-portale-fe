// src/app/shared/action/ticket-actions-dropdown/ticket-actions-dropdown.component.ts
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalSmallComponent } from '../../../public/components/modal-small/modal-small.component';

@Component({
  selector: 'app-ticket-actions-dropdown',
  standalone: true,
  imports: [CommonModule, ModalSmallComponent],
  template: `
    <div class="relative inline-block text-left">
      <button
        type="button"
        class="inline-flex justify-center w-full rounded-md  px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300"
        (click)="toggleDropdown()"
      >
        ⋯
      </button>

      @if (isOpen()) {
        <div
          class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        >
          <div class="py-1">
            <button
              (click)="onViewTicket()"
              class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <svg
                class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Visualizza
            </button>

            @if (ticketStatus !== 'CLOSED') {

              <button
                *ngIf="ticketStatus !== 'IN_PROGRESS'"
                (click)="onUpdateStatus('IN_PROGRESS')"
                class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <svg
                  class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Metti in corso
              </button>

              <button
                *ngIf="ticketStatus !== 'RESOLVED'"
                (click)="onUpdateStatus('RESOLVED')"
                class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <svg
                  class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Risolvi
              </button>

              <button
                (click)="onUpdateStatus('CLOSED')"
                class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <svg
                  class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Chiudi
              </button>
            }

            @if (ticketStatus === 'CLOSED') {
              <button
                (click)="onUpdateStatus('OPEN')"
                class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <svg
                  class="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
                Riapri
              </button>
            }

            <div class="border-t border-gray-100"></div>

            <button
              (click)="onDeleteTicket()"
              class="group flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
            >
              <svg
                class="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Elimina
            </button>
          </div>
        </div>
      }
    </div>

    @if (this.modalType) {
      <app-modal-small
        [modalType]="modalType"
        [loading]="false"
        [params]="{
          title: 'Sei sicuro di voler eliminare questo ticket?',
          subtitle: 'Il ticket sarà eliminato definitivamente'
        }"
        (onAction)="modalAction()"
        (onClose)="modalClosed()"
      ></app-modal-small>
    }
  `,
})
export class TicketActionsDropdownComponent {
  protected modalType: null | "delete-element" = null;

  @Input() ticketId!: number;
  @Input() ticketStatus!: string;

  @Output() viewTicket = new EventEmitter<number>();
  @Output() assignAgent = new EventEmitter<{ ticketId: number; agentId: string }>();
  @Output() updateStatus = new EventEmitter<{ ticketId: number; status: string }>();
  @Output() deleteTicket = new EventEmitter<number>();

  isOpen = signal(false);

  toggleDropdown() {
    this.isOpen.update(value => !value);
  }

  onViewTicket() {
    this.viewTicket.emit(this.ticketId);
    this.isOpen.set(false);
  }


  onUpdateStatus(status: string) {
    this.updateStatus.emit({ ticketId: this.ticketId, status });
    this.isOpen.set(false);
  }

  onDeleteTicket() {
    this.modalType = "delete-element";
    this.isOpen.set(false);

  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction() {
    if (this.modalType === "delete-element") {
      this.deleteTicket.emit(this.ticketId);
      this.isOpen.set(false);
    }
  }
}
