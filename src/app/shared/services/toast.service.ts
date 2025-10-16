// src/app/shared/services/toast.service.ts
import {
  Injectable,
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import { ToastComponent } from '../components/toast/toast.component';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private activeToasts: ComponentRef<ToastComponent>[] = [];

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  success(message: string, duration: number = 2500): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 2500): void {
    this.show(message, 'error', duration);
  }

  private show(message: string, type: 'success' | 'error', duration: number): void {
    // Create the component
    const toastComponentRef = createComponent(ToastComponent, {
      environmentInjector: this.injector,
    });

    // Set inputs
    const instance = toastComponentRef.instance;
    instance.message = message;
    instance.type = type;
    instance.duration = duration;

    // Track and attach to DOM
    this.activeToasts.push(toastComponentRef);
    document.body.appendChild(toastComponentRef.location.nativeElement);

    // Detect changes
    this.appRef.attachView(toastComponentRef.hostView);

    // Remove when animation is done (+ a bit of buffer)
    setTimeout(() => {
      const index = this.activeToasts.indexOf(toastComponentRef);
      if (index > -1) {
        this.activeToasts.splice(index, 1);
        this.appRef.detachView(toastComponentRef.hostView);
      }
    }, duration + 500);
  }

  // Call this to clear all active toasts if needed
  clearAll(): void {
    this.activeToasts.forEach(toastRef => {
      toastRef.location.nativeElement.remove();
      this.appRef.detachView(toastRef.hostView);
    });
    this.activeToasts = [];
  }
}
