import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialOirsPage } from './historial-oirs.page';

describe('HistorialOirsPage', () => {
  let component: HistorialOirsPage;
  let fixture: ComponentFixture<HistorialOirsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialOirsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
