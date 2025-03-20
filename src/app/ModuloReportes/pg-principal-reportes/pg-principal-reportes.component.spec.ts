import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgPrincipalReportesComponent } from './pg-principal-reportes.component';

describe('PgPrincipalReportesComponent', () => {
  let component: PgPrincipalReportesComponent;
  let fixture: ComponentFixture<PgPrincipalReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgPrincipalReportesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgPrincipalReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
