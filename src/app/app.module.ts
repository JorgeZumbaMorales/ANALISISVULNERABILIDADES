import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MessageService } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { PgAdminInicioComponent } from './ModuloAdministracion/pg-admin-inicio/pg-admin-inicio.component';
import { PgRolesComponent } from './ModuloAdministracion/pg-roles/pg-roles.component';
import { PgUsuariosComponent } from './ModuloAdministracion/pg-usuarios/pg-usuarios.component';
import { PgPrincipalAdministracionComponent } from './ModuloAdministracion/pg-principal-administracion/pg-principal-administracion.component';
import { PgLoginComponent } from './ModuloPublico/pg-login/pg-login.component';
import { PgLoginPublicoComponent } from './ModuloPublico/pg-login-publico/pg-login-publico.component';
import { PgInicioPortadaComponent } from './Template/pg-inicio-portada/pg-inicio-portada.component';
import { PgDashboardAdministracionComponent } from './Template/templateAdministracion/pg-dashboard-administracion/pg-dashboard-administracion.component';
import { PgFooterAdministracionComponent } from './Template/templateAdministracion/pg-footer-administracion/pg-footer-administracion.component';
import { PgHeaderAdministracionComponent } from './Template/templateAdministracion/pg-header-administracion/pg-header-administracion.component';
import { PgMenuAdministracionComponent } from './Template/templateAdministracion/pg-menu-administracion/pg-menu-administracion.component';
import { PgDashboardPublicoComponent } from './Template/templatePublico/pg-dashboard-publico/pg-dashboard-publico.component';
import { PgFooterPublicoComponent } from './Template/templatePublico/pg-footer-publico/pg-footer-publico.component';
import { PgHeaderPublicoComponent } from './Template/templatePublico/pg-header-publico/pg-header-publico.component';
import { PgPortadaInicialComponent } from './Template/templatePublico/pg-portada-inicial/pg-portada-inicial.component';
import { PgPrincipalGestionDispositivosComponent } from './ModuloGestionDispositivos/pg-principal-gestion-dispositivos/pg-principal-gestion-dispositivos.component';
import { PgDispositivosComponent } from './ModuloGestionDispositivos/pg-dispositivos/pg-dispositivos.component';
import { PgPrincipalVulnerabilidadesComponent } from './ModuloVulnerabilidades/pg-principal-vulnerabilidades/pg-principal-vulnerabilidades.component';
import { PgDispositivosVulnerablesComponent } from './ModuloVulnerabilidades/pg-dispositivos-vulnerables/pg-dispositivos-vulnerables.component';
import { PgTraficoComponent } from './ModuloVulnerabilidades/pg-trafico/pg-trafico.component';
// Módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'primeng/toast';
import { Ripple } from 'primeng/ripple';
import { CardModule } from 'primeng/card'; 
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TabsModule } from 'primeng/tabs';
import { PanelMenuModule } from 'primeng/panelmenu';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SelectModule } from 'primeng/select';
import { CarouselModule } from 'primeng/carousel';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { InputOtp } from 'primeng/inputotp';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PgHistorialDispositivosComponent } from './ModuloGestionDispositivos/pg-historial-dispositivos/pg-historial-dispositivos.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ChipModule } from 'primeng/chip';
import { SplitButtonModule } from 'primeng/splitbutton';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AccordionModule } from 'primeng/accordion';
import { DataViewModule } from 'primeng/dataview';
import { PanelModule } from 'primeng/panel';
import { MultiSelectModule } from 'primeng/multiselect';
import { PgPrincipalConfiguracionComponent } from './ModuloConfiguracion/pg-principal-configuracion/pg-principal-configuracion.component';
import { PgConfiguracionEscaneosComponent } from './ModuloConfiguracion/pg-configuracion-escaneos/pg-configuracion-escaneos.component';
import { PgPrincipalReportesComponent } from './ModuloReportes/pg-principal-reportes/pg-principal-reportes.component';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PgDashboardVisualComponent } from './ModuloReportes/pg-dashboard-visual/pg-dashboard-visual.component';
import { PgReportesDocumentosComponent } from './ModuloReportes/pg-reportes-documentos/pg-reportes-documentos.component';
import { ChartModule } from 'primeng/chart';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ConfirmationService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { VulnerabilidadesCveComponent } from './ModuloVulnerabilidades/vulnerabilidades-cve/vulnerabilidades-cve.component';
import { SliderModule } from 'primeng/slider';
import { FieldsetModule } from 'primeng/fieldset';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import MyPreset from '../mypreset'; // Importa tu preset personalizado
import { TooltipModule } from 'primeng/tooltip';
import { TimelineModule } from 'primeng/timeline';

@NgModule({
  declarations: [
    AppComponent,
    PgAdminInicioComponent,
    PgPrincipalAdministracionComponent,
    PgLoginComponent,
    PgLoginPublicoComponent,
    PgInicioPortadaComponent,
    PgDashboardAdministracionComponent,
    PgFooterAdministracionComponent,
    PgHeaderAdministracionComponent,
    PgMenuAdministracionComponent,
    PgDashboardPublicoComponent,
    PgFooterPublicoComponent,
    PgHeaderPublicoComponent,
    PgPortadaInicialComponent,
    PgRolesComponent,
    PgUsuariosComponent,
    PgPrincipalGestionDispositivosComponent,
    PgDispositivosComponent,
    PgPrincipalVulnerabilidadesComponent,
    PgDispositivosVulnerablesComponent,
    PgTraficoComponent,
    PgHistorialDispositivosComponent,
    PgPrincipalConfiguracionComponent,
    PgConfiguracionEscaneosComponent,
    PgPrincipalReportesComponent,
    PgDashboardVisualComponent,
    PgReportesDocumentosComponent,
    VulnerabilidadesCveComponent
    
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ButtonModule,
    ToastModule,
    Ripple,
    TableModule,
    TagModule,
    TabViewModule,
    BrowserAnimationsModule,
    CardModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    PasswordModule,
    DividerModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    TabsModule,
    CommonModule,
    PanelMenuModule,
    IftaLabelModule,
    SelectModule,
    CarouselModule,
    MessageModule,
    InputOtp,
    ProgressSpinnerModule,
    IconFieldModule,
    InputIconModule,
    ChipModule,
    SplitButtonModule,
    BadgeModule,
    OverlayBadgeModule,
    AccordionModule,
    DataViewModule,
    PanelModule,
    MultiSelectModule,
    ToggleSwitchModule,
    InputNumberModule,
    ConfirmDialogModule,
    ChartModule,
    AutoCompleteModule,
    DatePickerModule,
    CheckboxModule,
    SliderModule,
    FieldsetModule,
    RadioButtonModule,
    SelectButtonModule,
    MenuModule,
    OverlayPanelModule,
    TooltipModule,
    TimelineModule
],
  providers: [
    provideAnimationsAsync(),
        providePrimeNG({
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: '.my-app-dark',
      cssLayer: {
        name: 'primeng',
        order: 'tailwind-base, primeng, tailwind-utilities'
      }
    }
  },
  translation: {
  today: 'Hoy',
  clear: 'Limpiar',
  weekHeader: 'Sem',

  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dateFormat: 'dd-mm-yy'
}

})
,
        MessageService,
        ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
