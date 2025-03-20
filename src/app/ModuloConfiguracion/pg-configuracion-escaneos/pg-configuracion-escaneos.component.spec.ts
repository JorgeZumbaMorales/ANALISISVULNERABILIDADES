import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgConfiguracionEscaneosComponent } from './pg-configuracion-escaneos.component';

describe('PgConfiguracionEscaneosComponent', () => {
  let component: PgConfiguracionEscaneosComponent;
  let fixture: ComponentFixture<PgConfiguracionEscaneosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgConfiguracionEscaneosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgConfiguracionEscaneosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
