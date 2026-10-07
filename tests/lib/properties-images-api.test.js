import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/client', () => ({
  apiFormData: vi.fn(),
  apiFetch: vi.fn(),
  parseResponse: vi.fn(),
}));

import { apiFormData, apiFetch, parseResponse } from '@/lib/api/client';
import {
  uploadPropertyImage,
  deletePropertyImage,
} from '@/lib/api/properties';

describe('property image API helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploadPropertyImage posts the blob as multipart and returns the URL', async () => {
    apiFormData.mockResolvedValue({ status: 201, ok: true });
    parseResponse.mockResolvedValue({
      success: true,
      image: { url: 'https://pub-x.r2.dev/p/1.webp', key: 'p/1.webp' },
    });

    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/webp' });
    const url = await uploadPropertyImage('prop-1', blob, 'foto.webp');

    expect(url).toBe('https://pub-x.r2.dev/p/1.webp');
    const [path, form] = apiFormData.mock.calls[0];
    expect(path).toBe('/properties/prop-1/images');
    expect(form.get('file')).toBeInstanceOf(Blob);
  });

  it('deletePropertyImage sends a DELETE with the url in the body', async () => {
    apiFetch.mockResolvedValue({ status: 200, ok: true });
    parseResponse.mockResolvedValue({ success: true });

    await deletePropertyImage('prop-1', 'https://pub-x.r2.dev/p/1.webp');

    expect(apiFetch).toHaveBeenCalledWith('/properties/prop-1/images', {
      method: 'DELETE',
      body: { url: 'https://pub-x.r2.dev/p/1.webp' },
    });
  });
});
