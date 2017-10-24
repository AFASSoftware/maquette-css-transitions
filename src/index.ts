let browserSpecificTransitionEndEventName: 'webkitTransitionEnd' | 'transitionend';
let browserSpecificAnimationEndEventName: 'webkitAnimationEnd' | 'animationend';

let determineBrowserSpecificStyleNames = (element: HTMLElement) => {
  if ('WebkitTransition' in element.style) {
    browserSpecificTransitionEndEventName = 'webkitTransitionEnd';
    browserSpecificAnimationEndEventName = 'webkitAnimationEnd';
  } else if ('transition' in element.style || 'MozTransition' in element.style) {
    browserSpecificTransitionEndEventName = 'transitionend';
    browserSpecificAnimationEndEventName = 'animationend';
  } else {
    throw new Error('Your browser is not supported!');
  }
};

let init = (testElement: Element) => {
  if (!browserSpecificTransitionEndEventName) {
    determineBrowserSpecificStyleNames(testElement as HTMLElement);
  }
};

export let createEnterCssTransition = (cssClassBase: string): (element: Element) => void => {
  return (element) => {
    init(element);
    let finished = false;
    let transitionEnd = (evt: TransitionEvent) => {
      if (!finished) {
        finished = true;
        element.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
        element.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
        element.classList.remove(cssClassBase);
        element.classList.remove(`${cssClassBase}-active`);
      }
    };
    element.classList.add(cssClassBase);
    element.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
    element.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    requestAnimationFrame(() => {
      element.classList.add(`${cssClassBase}-active`);
    });
  };
};

export let createExitCssTransition = (cssClassBase: string): (element: Element, removeElement: () => void) => void => {
  return (element, removeElement) => {
    init(element);
    let finished = false;
    let transitionEnd = (evt: TransitionEvent) => {
      if (!finished) {
        finished = true;
        element.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
        element.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
        removeElement();
      }
    };
    element.classList.add(cssClassBase);
    element.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
    element.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    requestAnimationFrame(() => {
      element.classList.add(`${cssClassBase}-active`);
    });
  };
};
