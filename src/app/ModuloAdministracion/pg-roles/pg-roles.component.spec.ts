import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgRolesComponent } from './pg-roles.component';

describe('PgRolesComponent', () => {
  let component: PgRolesComponent;
  let fixture: ComponentFixture<PgRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgRolesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
