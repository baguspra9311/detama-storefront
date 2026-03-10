import { IFRAME_BASE_URL } from '../constants';

export interface CheckoutURLParams {
  slug?: string;
  voucher?: string;
  theme: 'light' | 'dark';
  debug?: boolean;
  queryString: string;
}

export class URLParser {
  /**
   * Parse current page URL options
   */
  public static parse(): CheckoutURLParams {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    
    // Scalev exact slug if any
    const slug = params.get('slug') || undefined;
    
    // Discount code: Scalev standard uses `promo` as query param, but we also support `voucher`
    const voucher = params.get('promo') || params.get('voucher') || undefined;
    
    // Custom params
    const theme = (params.get('theme') as 'light' | 'dark') || 'light';
    const debug = params.get('debug') === 'true';

    // Remove our custom injected framework params so we forward pure Scalev options
    const forwardParams = new URLSearchParams(search);
    forwardParams.delete('theme');
    forwardParams.delete('debug');
    forwardParams.delete('slug'); // Slug is a path param, don't pass as query

    return {
      slug,
      voucher,
      theme,
      debug,
      queryString: forwardParams.toString(),
    };
  }

  /**
   * Build the target iframe src URL using the parsed params
   */
  public static buildIframeSrc(params: CheckoutURLParams): string {
    let baseUrl = IFRAME_BASE_URL;
    
    // If slug is provided, append it to the path
    if (params.slug) {
      if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
      }
      baseUrl += params.slug;
    }

    const url = new URL(baseUrl);
    
    // Forward all original query parameters (e.g. ?items=...&promo=...&utm_source=...)
    if (params.queryString) {
      url.search = params.queryString;
      // If debug is on, re-inject it so iframe knows
      if (params.debug) {
        url.searchParams.set('debug', 'true');
      }
    } else if (params.debug) {
      url.searchParams.set('debug', 'true');
    }

    return url.toString();
  }
}
