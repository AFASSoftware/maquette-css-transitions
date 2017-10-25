/* tslint:disable no-null-keyword */
import { createEnterCssTransition, createExitCssTransition } from '../src/index';
import { expect, sinon } from './test-utilities';
import Global = NodeJS.Global;
import { SinonStub } from 'sinon';
import * as path from 'path';

describe('cssTransitions', () => {
  interface RequestAnimationsApi {
    requestAnimationFrame?: SinonStub;
    cancelAnimationFrame?: SinonStub;
  }

  let globalScope: Global & RequestAnimationsApi = global;

  beforeEach(() => {
    globalScope.requestAnimationFrame = sinon.stub();
  });

  afterEach(() => {
    delete globalScope.requestAnimationFrame;
  });

  let activeModifier = '-active';

  let createFakeElement = () => {
    return {
      addEventListener: sinon.stub(),
      removeEventListener: sinon.stub(),
      classList: {
        add: sinon.stub(),
        remove: sinon.stub()
      },
      style: {
        transition: null as string | null
      }
    };
  };

  describe('enterCssTransition', () => {
    it('adds the animationClass and later the animationClass + "-active" to the element', () => {
      let element = createFakeElement();
      let animationClass = 'fade-in';

      let animationFunction = createEnterCssTransition(animationClass);
      animationFunction(element as any);

      expect(element.classList.add).to.be.calledOnce;
      expect(element.classList.add.lastCall.args[0]).to.equal(animationClass);

      let transitionEnd = element.addEventListener.getCall(0).args[1];

      expect(transitionEnd).to.be.a('function');

      expect(element.addEventListener).to.have.been.calledTwice;
      expect(element.addEventListener).calledWith('transitionend', transitionEnd);
      expect(element.addEventListener).calledWith('animationend', transitionEnd);

      let addModifier = globalScope.requestAnimationFrame.lastCall.args[0];

      element.classList.add.reset();
      addModifier();

      expect(element.classList.add).to.be.calledOnce;
      expect(element.classList.add).calledWith(animationClass + activeModifier);

      transitionEnd.apply(element);
      transitionEnd.apply(element);

      expect(element.removeEventListener).to.have.been.calledTwice;
      expect(element.removeEventListener).calledWith('transitionend', transitionEnd);
      expect(element.removeEventListener).calledWith('animationend', transitionEnd);

      expect(element.classList.remove).to.be.calledTwice;
      expect(element.classList.remove).calledWith(animationClass);
      expect(element.classList.remove).calledWith(animationClass + activeModifier);
    });
  });

  describe('exitCssTransition', () => {
    it('adds the animationClass and later the animationClass + "-active" to the element and finally removes the element', () => {
      let element = createFakeElement();
      let animationClass = 'fade-out';
      let removeElement = sinon.stub();

      let animationFunction = createExitCssTransition(animationClass);
      animationFunction(element as any, removeElement);

      expect(element.classList.add).to.be.calledOnce;
      expect(element.classList.add.lastCall.args[0]).to.equal(animationClass);

      let transitionEnd = element.addEventListener.getCall(0).args[1];

      expect(transitionEnd).to.be.a('function');

      expect(element.addEventListener).to.have.been.calledTwice;
      expect(element.addEventListener).calledWith('transitionend', transitionEnd);
      expect(element.addEventListener).calledWith('animationend', transitionEnd);

      let addModifier = globalScope.requestAnimationFrame.lastCall.args[0];

      element.classList.add.reset();
      addModifier();

      expect(element.classList.add).to.be.calledOnce;
      expect(element.classList.add).calledWith(animationClass + activeModifier);

      expect(removeElement).to.not.have.been.called;

      transitionEnd.apply(element);
      transitionEnd.apply(element);

      expect(element.removeEventListener).to.have.been.calledTwice;
      expect(element.removeEventListener).calledWith('transitionend', transitionEnd);
      expect(element.removeEventListener).calledWith('animationend', transitionEnd);

      expect(removeElement).to.have.been.called;
    });

  });

  describe('other browsers', () => {
    // For this to work, we need to reload the source file to clear the cached prefixes
    let clearCachedRequires = () => {
      let indexFilePath = path.normalize(path.join(__dirname, '../src/index.ts'));
      delete require.cache[indexFilePath];
    };

    beforeEach(clearCachedRequires);

    afterEach(clearCachedRequires);

    it('uses the webkit-prefixed names for safari on old versions in iOS ', () => {
      let element = {
        style: {
          WebkitTransition: null as string | null
        },
        classList: {
          add: sinon.stub()
        },
        addEventListener: sinon.stub()
      };
      let animationFunction = require('../src/index.ts').createEnterCssTransition('fade-in');
      animationFunction(element as any);

      let transitionEnd = element.addEventListener.getCall(0).args[1];
      expect(element.addEventListener).to.have.been.calledTwice;
      expect(element.addEventListener).calledWith('webkitTransitionEnd', transitionEnd);
      expect(element.addEventListener).calledWith('webkitAnimationEnd', transitionEnd);
    });

    it('throws an error if the browser does not have transitions', () => {
      let element = {
        style: {
        }
      };
      let animationFunction = require('../src/index.ts').createEnterCssTransition('fade-in');
      expect(() => {
        animationFunction(element as any);
      }).to.throw();
    });
  });

});
