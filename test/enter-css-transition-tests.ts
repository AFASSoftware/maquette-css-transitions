import { createEnterCssTransition } from '../src/index';
import { expect } from './test-utilities';

describe('createEnterCssTransition', () => {
  it('returns a function', () => {
    let func = createEnterCssTransition('fade-in');
    expect(func).to.be.a('function');
  });
});
