import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';

import { RouterOutlet } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [ RouterOutlet]
})
export class AppComponent {
  title = 'RedSegura';
  constructor(private messageService: MessageService) {}

  show() {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3000 });
  }
  showContrast() {
    this.messageService.add({ severity: 'contrast', summary: 'Error', detail: 'Message Content' });
}
}
