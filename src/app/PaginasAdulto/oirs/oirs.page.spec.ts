import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OirsPage } from './oirs.page';

describe('OirsPage', () => {
  let component: OirsPage;
  let fixture: ComponentFixture<OirsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OirsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
