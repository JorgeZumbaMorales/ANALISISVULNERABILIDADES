import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgDashboardPublicoComponent } from './pg-dashboard-publico.component';

describe('PgDashboardPublicoComponent', () => {
  let component: PgDashboardPublicoComponent;
  let fixture: ComponentFixture<PgDashboardPublicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgDashboardPublicoComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgDashboardPublicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
