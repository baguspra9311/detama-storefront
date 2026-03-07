import type { AutofillData } from '@shared/types/messages';
import { SELECTORS } from '../constants';

export class FormScraper {
  /**
   * Safe getter for potentially missing input elements 
   */
  private getInput(selectorObj: { primary: string; fallback: string }): HTMLInputElement | null {
    const el = document.querySelector(selectorObj.primary) as HTMLInputElement;
    if (el) return el;
    return document.querySelector(selectorObj.fallback) as HTMLInputElement | null;
  }

  public getInputs() {
    return {
      name: this.getInput(SELECTORS.FORM_NAME),
      email: this.getInput(SELECTORS.FORM_EMAIL),
      phone: this.getInput(SELECTORS.FORM_PHONE),
      discount: this.getInput(SELECTORS.DISCOUNT_INPUT),
    };
  }

  /**
   * Scrapes the currently filled form data.
   */
  public getFormData(): AutofillData {
    const inputs = this.getInputs();
    return {
      name: inputs.name?.value || '',
      email: inputs.email?.value || '',
      phone: inputs.phone?.value || '',
    };
  }

  /**
   * Programmatically fills the form inputs.
   * To ensure Vue reactivity in the Scalev DOM, we must dispatch an InputEvent.
   */
  public fillAutofill(data: AutofillData): void {
    const inputs = this.getInputs();

    if (data.name && inputs.name) {
      this.setInputValue(inputs.name, data.name);
    }
    
    if (data.email && inputs.email) {
      this.setInputValue(inputs.email, data.email);
    }
    
    if (data.phone && inputs.phone) {
      this.setInputValue(inputs.phone, data.phone);
    }
  }

  /**
   * Helper to set a value robustly matching Vue's reactivity requirements.
   */
  private setInputValue(element: HTMLInputElement, value: string) {
    // Some Vue inputs track the _value property on the element
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    
    // Set value natively bypassing Vue's proxy if it exists
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
    } else {
      element.value = value;
    }

    // Dispatch a standard input event so Vue's v-model catches the change
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
