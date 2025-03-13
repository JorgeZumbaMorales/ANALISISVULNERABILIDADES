import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgHistorialDispositivosComponent } from './pg-historial-dispositivos.component';

describe('PgHistorialDispositivosComponent', () => {
  let component: PgHistorialDispositivosComponent;
  let fixture: ComponentFixture<PgHistorialDispositivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgHistorialDispositivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgHistorialDispositivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
