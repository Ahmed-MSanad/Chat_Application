import { CustomFirebaseDatePipe } from './custom-firebase-date.pipe';

describe('CustomFirebaseDatePipe', () => {
  it('create an instance', () => {
    const pipe = new CustomFirebaseDatePipe();
    expect(pipe).toBeTruthy();
  });
});
