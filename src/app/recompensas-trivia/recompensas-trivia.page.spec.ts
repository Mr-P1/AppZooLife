import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecompensasTriviaPage } from './recompensas-trivia.page';

describe('RecompensasTriviaPage', () => {
  let component: RecompensasTriviaPage;
  let fixture: ComponentFixture<RecompensasTriviaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecompensasTriviaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
