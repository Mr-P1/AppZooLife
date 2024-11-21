import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoPlantaPage } from './info-plantas.page';

describe('InfoPlantasPage', () => {
  let component: InfoPlantaPage;
  let fixture: ComponentFixture<InfoPlantaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoPlantaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
