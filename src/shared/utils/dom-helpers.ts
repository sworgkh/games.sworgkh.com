/**
 * DOM Helper Utilities
 * Common functions for DOM manipulation across the application
 */

export function createElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  className?: string,
  textContent?: string
): HTMLElementTagNameMap[T] {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}

export function selectElement<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: Document | HTMLElement = document
): T | null {
  return parent.querySelector<T>(selector);
}

export function selectAllElements<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: Document | HTMLElement = document
): NodeListOf<T> {
  return parent.querySelectorAll<T>(selector);
}

export function addClass(element: HTMLElement, ...classNames: string[]): void {
  element.classList.add(...classNames);
}

export function removeClass(element: HTMLElement, ...classNames: string[]): void {
  element.classList.remove(...classNames);
}

export function toggleClass(element: HTMLElement, className: string): void {
  element.classList.toggle(className);
}

export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

export function setAttribute(element: HTMLElement, name: string, value: string): void {
  element.setAttribute(name, value);
}

export function getAttribute(element: HTMLElement, name: string): string | null {
  return element.getAttribute(name);
}

export function addEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  element.addEventListener(type, listener, options);
}

export function removeEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | EventListenerOptions
): void {
  element.removeEventListener(type, listener, options);
}

export function setStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles);
}

export function appendChildren(parent: HTMLElement, ...children: HTMLElement[]): void {
  children.forEach(child => parent.appendChild(child));
}

export function clearElement(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function isElementVisible(element: HTMLElement): boolean {
  return element.offsetWidth > 0 && element.offsetHeight > 0;
}

export function getElementPosition(element: HTMLElement): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX
  };
}

export function waitForElement(selector: string, timeout = 5000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const element = selectElement(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = selectElement(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
} 