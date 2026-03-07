import { IFRAME_BASE_URL } from '../constants';

export interface CheckoutURLParams {
  slug: string;
  voucher?: string;
  vouchers?: string[];
  theme: 'light' | 'dark';
  utmSource?: string;
  debug?: boolean;
}

export class URLParser {
  /**
   * Parse current page URL options
   */
  public static parse(): CheckoutURLParams {
    const params = new URLSearchParams(window.location.search);
    
    // Scalev params
    const slug = params.get('slug') || '';
    const voucher = params.get('voucher') || undefined;
    const vouchers = params.getAll('vouchers[]');
    
    // Custom params
    const theme = (params.get('theme') as 'light' | 'dark') || 'light';
    const utmSource = params.get('utm_source') || undefined;
    const debug = params.get('debug') === 'true';

    return {
      slug,
      voucher,
      vouchers: vouchers.length > 0 ? vouchers : undefined,
      theme,
      utmSource,
      debug,
    };
  }

  /**
   * Build the target iframe src URL using the parsed params
   */
  public static buildIframeSrc(params: CheckoutURLParams): string {
    if (!params.slug) {
      console.error('[URLParser] Missing required parameter: slug');
      return '';
    }

    const url = new URL(`${IFRAME_BASE_URL}/${params.slug}`);
    
    // We only pass Scalev-compatible params to the iframe
    if (params.voucher) {
      url.searchParams.set('voucher', params.voucher);
    }
    
    if (params.vouchers) {
      params.vouchers.forEach(v => url.searchParams.append('vouchers[]', v));
    }
    
    if (params.utmSource) {
      url.searchParams.set('utm_source', params.utmSource);
    }
    
    // Debug flag controls console logs, we can pass it to iframe as well if useful
    if (params.debug) {
      url.searchParams.set('debug', 'true');
    }

    return url.toString();
  }
}
