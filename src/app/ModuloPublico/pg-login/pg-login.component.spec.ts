import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgLoginComponent } from './pg-login.component';

describe('PgLoginComponent', () => {
  let component: PgLoginComponent;
  let fixture: ComponentFixture<PgLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [PgLoginComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(PgLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
