import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  constructor(private messageService: MessageService) {}

  success(mensaje: string, detalle: string = '') {
    this.messageService.add({ severity: 'success', summary: mensaje, detail: detalle });
  }

  error(mensaje: string, detalle: string = '') {
    this.messageService.add({ severity: 'error', summary: mensaje, detail: detalle });
  }

  warning(mensaje: string, detalle: string = '') {
    this.messageService.add({ severity: 'warn', summary: mensaje, detail: detalle });
  }

  info(mensaje: string, detalle: string = '') {
    this.messageService.add({ severity: 'info', summary: mensaje, detail: detalle });
  }
}

