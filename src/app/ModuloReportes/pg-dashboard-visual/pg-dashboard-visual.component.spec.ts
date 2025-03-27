import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgDashboardVisualComponent } from './pg-dashboard-visual.component';

describe('PgDashboardVisualComponent', () => {
  let component: PgDashboardVisualComponent;
  let fixture: ComponentFixture<PgDashboardVisualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgDashboardVisualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgDashboardVisualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
