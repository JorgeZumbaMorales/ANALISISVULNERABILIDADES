import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgInicioPortadaComponent } from './pg-inicio-portada.component';

describe('PgInicioPortadaComponent', () => {
  let component: PgInicioPortadaComponent;
  let fixture: ComponentFixture<PgInicioPortadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgInicioPortadaComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgInicioPortadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
