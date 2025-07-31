import { Injectable } from '@angular/core';
import {
  CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

export interface CanComponentDeactivate {
  canDeactivate(): boolean | Observable<boolean>;
  cancelPendingOperation?(): boolean | Promise<boolean> | Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDeactivateGuard
  implements CanDeactivate<CanComponentDeactivate> {

  constructor(private confirmation: ConfirmationService) {}

  canDeactivate(
    component: CanComponentDeactivate,
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean> | Promise<boolean> {
    const ok = component.canDeactivate();

    if (typeof ok === 'boolean' && !ok) {
      
      return new Promise<boolean>(resolve => {
        this.confirmation.confirm({
          header: 'Cancelar operación',
          message: 'Tienes una operación en curso. Si sales ahora, se cancelará. ¿Continuar?',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Sí, continuar',
          rejectLabel: 'No, quedarme',
          accept: () => {
            if (component.cancelPendingOperation) {
              Promise.resolve(component.cancelPendingOperation()).then(() => {
                resolve(true);
              });
            } else {
              resolve(true);
            }
          },
          reject: () => {
            resolve(false);
          }
        });
      });
    }

    
    return ok;
  }
}