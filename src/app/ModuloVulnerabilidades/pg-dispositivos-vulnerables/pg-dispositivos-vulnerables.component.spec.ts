import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgDispositivosVulnerablesComponent } from './pg-dispositivos-vulnerables.component';

describe('PgDispositivosVulnerablesComponent', () => {
  let component: PgDispositivosVulnerablesComponent;
  let fixture: ComponentFixture<PgDispositivosVulnerablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgDispositivosVulnerablesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgDispositivosVulnerablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
