import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgReportesDocumentosComponent } from './pg-reportes-documentos.component';

describe('PgReportesDocumentosComponent', () => {
  let component: PgReportesDocumentosComponent;
  let fixture: ComponentFixture<PgReportesDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PgReportesDocumentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgReportesDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
