import { getCsrfToken } from '../../lib/api/csrf';

const setCookie = (str) => Object.defineProperty(document, 'cookie', {
  value: str, writable: true, configurable: true,
});

describe('getCsrfToken', () => {
  it('returns token when _csrf cookie exists', () => {
    setCookie('other=value; _csrf=abc123def; lang=es');
    expect(getCsrfToken()).toBe('abc123def');
  });

  it('returns token when _csrf is the only cookie', () => {
    setCookie('_csrf=xyz789');
    expect(getCsrfToken()).toBe('xyz789');
  });

  it('returns token when _csrf is first cookie', () => {
    setCookie('_csrf=first-token; other=val');
    expect(getCsrfToken()).toBe('first-token');
  });

  it('returns empty string when _csrf cookie is missing', () => {
    setCookie('other=value; lang=es');
    expect(getCsrfToken()).toBe('');
  });

  it('returns empty string when no cookies exist', () => {
    setCookie('');
    expect(getCsrfToken()).toBe('');
  });

  it('URL-decodes the token value', () => {
    setCookie('_csrf=hello%20world%2Ftest');
    expect(getCsrfToken()).toBe('hello world/test');
  });
});
