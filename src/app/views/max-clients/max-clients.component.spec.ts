import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaxClientsComponent } from './max-clients.component';

describe('MaxClientsComponent', () => {
  let component: MaxClientsComponent;
  let fixture: ComponentFixture<MaxClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaxClientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaxClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
