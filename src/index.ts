let browserSpecificTransitionEndEventName: 'webkitTransitionEnd' | 'transitionend';
let browserSpecificAnimationEndEventName: 'webkitAnimationEnd' | 'animationend';

let determineBrowserSpecificStyleNames = (element: HTMLElement) => {
  if ('WebkitTransition' in element.style) {
    browserSpecificTransitionEndEventName = 'webkitTransitionEnd';
    browserSpecificAnimationEndEventName = 'webkitAnimationEnd';
  } else if ('transition' in element.style) {
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

export let createEnterCssTransition = (cssClassBase: string, activeClass = `${cssClassBase}-active`): (element: Element) => void => {
  return (element) => {
    init(element);
    let finished = false;
    let transitionEnd = (evt: Event) => {
      if (!finished) {
        finished = true;
        element.removeEventListener(browserSpecificTransitionEndEventName, transitionEnd);
        element.removeEventListener(browserSpecificAnimationEndEventName, transitionEnd);
        element.classList.remove(cssClassBase);
        element.classList.remove(activeClass);
      }
    };
    element.classList.add(cssClassBase);
    element.addEventListener(browserSpecificTransitionEndEventName, transitionEnd);
    element.addEventListener(browserSpecificAnimationEndEventName, transitionEnd);
    requestAnimationFrame(() => {
      element.classList.add(activeClass);
    });
  };
};

export let createExitCssTransition = (cssClassBase: string, activeClass = `${cssClassBase}-active`): (element: Element, removeElement: () => void) => void => {
  return (element, removeElement) => {
    init(element);
    let finished = false;
    let transitionEnd = (evt: Event) => {
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
      element.classList.add(activeClass);
    });
  };
};
