import type { AutofillData } from '@shared/types/messages';
import { SELECTORS } from '../constants';

export class FormScraper {
  /**
   * Safe getter for potentially missing input elements 
   */
  private getInput(selectorObj: { primary: string; fallback: string }): HTMLInputElement | HTMLTextAreaElement | null {
    let el = document.querySelector(selectorObj.primary) as HTMLInputElement | HTMLTextAreaElement | null;
    if (el) return el;
    return document.querySelector(selectorObj.fallback) as HTMLInputElement | HTMLTextAreaElement | null;
  }

  public getInputs() {
    return {
      name: this.getInput(SELECTORS.FORM_NAME) as HTMLInputElement | null,
      email: this.getInput(SELECTORS.FORM_EMAIL) as HTMLInputElement | null,
      phone: this.getInput(SELECTORS.FORM_PHONE) as HTMLInputElement | null,
      address: this.getInput(SELECTORS.FORM_ADDRESS) as HTMLTextAreaElement | null,
      discount: this.getInput(SELECTORS.DISCOUNT_INPUT) as HTMLInputElement | null,
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
      // Note: we can expand AutofillData to include address later if needed
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
  private setInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
    // Some Vue inputs track the _value property on the element
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(element),
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
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Attaches blur event listeners to specific fields. 
   * Useful for triggering validation logic (e.g., email/WA APIs).
   */
  public attachBlurListeners(
    onEmailBlur: (val: string) => void, 
    onPhoneBlur: (val: string) => void
  ): void {
    const inputs = this.getInputs();

    if (inputs.email) {
      inputs.email.addEventListener('blur', (e) => onEmailBlur((e.target as HTMLInputElement).value));
    }

    if (inputs.phone) {
      inputs.phone.addEventListener('blur', (e) => onPhoneBlur((e.target as HTMLInputElement).value));
    }
  }
}
