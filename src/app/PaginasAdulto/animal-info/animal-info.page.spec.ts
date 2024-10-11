import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimalInfoPage } from './animal-info.page';

describe('AnimalInfoPage', () => {
  let component: AnimalInfoPage;
  let fixture: ComponentFixture<AnimalInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
