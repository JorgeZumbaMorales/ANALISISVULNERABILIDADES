import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeng/themes/lara';
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
    PgUsuariosComponent
    
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
    ReactiveFormsModule
],
  providers: [
    provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Lara,
                options: {
                  darkModeSelector: '.my-app-dark',
                  cssLayer: {
                    name: 'primeng',
                    order: 'tailwind-base, primeng, tailwind-utilities'
                }
              }
              
            }
        }),
        MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
