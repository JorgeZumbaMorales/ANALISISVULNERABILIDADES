import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AnalisisVulnerabilidades';
  constructor(private messageService: MessageService) {}

  show() {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Message Content', life: 3000 });
  }
  showContrast() {
    this.messageService.add({ severity: 'contrast', summary: 'Error', detail: 'Message Content' });
}
}
