import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgMenuAdministracionComponent } from './pg-menu-administracion.component';

describe('PgMenuAdministracionComponent', () => {
  let component: PgMenuAdministracionComponent;
  let fixture: ComponentFixture<PgMenuAdministracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgMenuAdministracionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgMenuAdministracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
