import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgPortadaInicialComponent } from './pg-portada-inicial.component';

describe('PgPortadaInicialComponent', () => {
  let component: PgPortadaInicialComponent;
  let fixture: ComponentFixture<PgPortadaInicialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgPortadaInicialComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgPortadaInicialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
