import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgTraficoComponent } from './pg-trafico.component';

describe('PgTraficoComponent', () => {
  let component: PgTraficoComponent;
  let fixture: ComponentFixture<PgTraficoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgTraficoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgTraficoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
