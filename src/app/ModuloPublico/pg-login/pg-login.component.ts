import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SesionUsuarioService } from '../../Seguridad/sesion-usuario.service';
import { ServiciosAutenticacion } from '../../ModuloServiciosWeb/ServiciosAutenticacion.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Observable } from 'rxjs';
import { Toast } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TabView, TabPanel } from 'primeng/tabview';
import { NgIf } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { InputOtp } from 'primeng/inputotp';
import { Divider } from 'primeng/divider';

@Component({
  standalone: true,
    selector: 'app-pg-login',
    templateUrl: './pg-login.component.html',
    styleUrl: './pg-login.component.css',
    imports: [Toast, FormsModule, IftaLabel, InputText, Password, Button, Dialog, PrimeTemplate, TabView, TabPanel, NgIf, ProgressSpinner, InputOtp, Divider]
})
export class PgLoginComponent {
  usuario: string = '';
  contrasena: string = '';

  // Estado del modal de recuperación
  modalRecuperacion: boolean = false;
  modalCodigo: boolean = false;
  modalActualizarContrasena: boolean = false;
  usuarioIdRecuperacion: number = 0; // ID del usuario recuperado
  indiceRecuperacion: number = 0; // 0 = Usuario, 1 = Correo
  usuarioRecuperacion: string = '';
  correoRecuperacion: string = '';
  cargandoRecuperacion: boolean = false;
  codigoRecuperacion: string = ''; // Código OTP ingresado
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';

  constructor(private router: Router,
    private authService: ServiciosAutenticacion, 
    private sesionService: SesionUsuarioService, 
    private messageService: MessageService
  ) {}

  mostrarMensaje(severity: string, summary: string, detail: string) {
    this.messageService.add({ severity, summary, detail });
  }

  iniciarSesion() {
  if (!this.usuario.trim() || !this.contrasena.trim()) {
    this.mostrarMensaje('warn', 'Campos Vacíos', 'Por favor, ingrese su usuario y contraseña');
    return;
  }

  const credenciales = { nombre_usuario: this.usuario, contrasena: this.contrasena };

  this.authService.iniciarSesion(credenciales).subscribe({
    next: (respuesta) => {
      if (respuesta?.access_token) {
        // ✅ Guardar token
        this.sesionService.guardarSesion(respuesta.access_token);

        // ✅ Obtener perfil completo del usuario
        this.authService.obtenerMiPerfil().subscribe({
          next: (perfil) => {
            this.sesionService.guardarPerfil(perfil); // ✅ Guardar perfil
            this.router.navigate(['/admin/inicio']);  // Redirigir
          },
          error: () => {
            this.mostrarMensaje('error', 'Error', 'No se pudo cargar el perfil del usuario.');
          }
        });

      } else {
        this.mostrarMensaje('error', 'Error', 'No se pudo iniciar sesión, intente nuevamente.');
      }
    },
    error: () => {
      this.mostrarMensaje('error', 'Error', 'Usuario o contraseña incorrectos');
    }
  });
}


  volverInicio() {
    this.router.navigate(['/public']);
  }

  // Abrir modal de recuperación
  abrirModalRecuperacion() {
    this.modalRecuperacion = true;
    this.indiceRecuperacion = 0;
    this.usuarioRecuperacion = '';
    this.correoRecuperacion = '';
  }

  cerrarModal(tipo: 'recuperacion' | 'codigo' | 'actualizarContrasena') {
    if (tipo === 'recuperacion') this.modalRecuperacion = false;
    if (tipo === 'codigo') this.modalCodigo = false;
    if (tipo === 'actualizarContrasena') this.modalActualizarContrasena = false;
  }

  enviarCodigoRecuperacion() {
    console.log("➡️ Iniciando recuperación de contraseña...");
    console.log("🔍 Tipo de búsqueda:", this.indiceRecuperacion === 0 ? "Por Usuario" : "Por Correo");
    this.cargandoRecuperacion = true; 
    if (this.indiceRecuperacion === 0 && !this.usuarioRecuperacion) {
        this.mostrarMensaje('warn', 'Campos Vacíos', 'Ingrese su nombre de usuario.');
        return;
    }
    if (this.indiceRecuperacion === 1 && !this.correoRecuperacion) {
        this.mostrarMensaje('warn', 'Campos Vacíos', 'Ingrese su correo electrónico.');
        return;
    }
    let consultaUsuario$: Observable<any>;
    if (this.indiceRecuperacion === 0) {
        console.log("🔍 Buscando usuario por nombre:", this.usuarioRecuperacion);
        consultaUsuario$ = this.authService.buscarUsuarioPorNombre(this.usuarioRecuperacion);
    } else {
        console.log("🔍 Buscando usuario por correo:", this.correoRecuperacion);
        consultaUsuario$ = this.authService.buscarUsuarioPorCorreo(this.correoRecuperacion);
    }
    consultaUsuario$.subscribe({
      next: (respuesta) => {
          console.log("✅ Respuesta recibida:", respuesta);
          if (!respuesta || !respuesta.datos || !respuesta.datos.usuario_id) {
              const mensajeError = this.indiceRecuperacion === 0 
                  ? "No se encontró el usuario ingresado." 
                  : "No se encontró el correo electrónico ingresado.";
              
              this.mostrarMensaje('error', 'Error de Recuperación', mensajeError);
              this.cargandoRecuperacion = false;
              return;
          }
          this.usuarioIdRecuperacion = respuesta.datos.usuario_id
          this.usuarioRecuperacion = respuesta.datos.nombre_usuario
          this.correoRecuperacion = respuesta.datos.email
          const data = {
            usuario_id: this.usuarioIdRecuperacion,
            usuario: this.usuarioRecuperacion,  // 🔹 Tomamos el nombre de usuario desde la respuesta
            correo: this.correoRecuperacion  // 🔹 Tomamos el correo desde la respuesta
        };
          console.log("📨 Enviando solicitud de recuperación:", data);
  
          this.authService.solicitarRecuperacion(data).subscribe({
              next: () => {
                  this.modalRecuperacion = false;
                  this.modalCodigo = true;
                  this.mostrarMensaje('success', 'Código Enviado', `Se envió un código de verificación al correo registrado.`);

              },
              error: (error) => {
                  console.error("❌ Error al enviar código:", error);
                  this.mostrarMensaje('error', 'Error', 'No se pudo enviar el código, intente nuevamente.');
              },
              complete: () => this.cargandoRecuperacion = false
          });
      },
      error: () => {
          const mensajeError = this.indiceRecuperacion === 0 
              ? "No se encontró el usuario ingresado." 
              : "No se encontró el correo electrónico ingresado.";
  
          this.mostrarMensaje('error', 'Error de Recuperación', mensajeError);
          this.cargandoRecuperacion = false;
      }
  });
}

  verificarCodigo() {
    if (this.codigoRecuperacion.length !== 6) {
      this.mostrarMensaje('warn', 'Código Incorrecto', 'Ingrese el código de 6 dígitos correctamente.');
      return;
    }

    this.authService.verificarCodigo(this.codigoRecuperacion, this.usuarioRecuperacion).subscribe({
      next: () => {
        this.modalCodigo = false;
        this.modalActualizarContrasena = true; // Abrir modal de nueva contraseña
        this.codigoRecuperacion = ''; // Limpiar campo de código
      },
      error: () => {
        this.mostrarMensaje('error', 'Código Incorrecto', 'Verifique su código e intente nuevamente.');
      }
    });
}


  actualizarContrasena() {
    if (this.nuevaContrasena.length < 8) {
      this.mostrarMensaje('warn', 'Contraseña Débil', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.mostrarMensaje('error', 'Contraseñas No Coinciden', 'Las contraseñas ingresadas no coinciden.');
      return;
    }
    this.authService.actualizarContrasena({ 
      usuario_id: this.usuarioIdRecuperacion, // ID del usuario recuperado
      nueva_contrasena: this.nuevaContrasena
    }).subscribe({
      next: () => {
        this.modalActualizarContrasena = false;
        this.mostrarMensaje('success', 'Contraseña Actualizada', 'Ahora puede iniciar sesión con su nueva contraseña.');
      },
      error: () => {
        this.mostrarMensaje('error', 'Error', 'No se pudo actualizar la contraseña.');
      }
    });
  }



  enmascararCorreo(email: string): string {
    const [usuario, dominio] = email.split("@");
    return usuario.substring(0, 2) + "****@" + dominio;
  }

}


