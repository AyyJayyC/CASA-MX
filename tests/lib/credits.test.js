import { vi } from 'vitest';
import * as client from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

import * as credits from '@/lib/api/credits';

describe('credits API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getBalance returns response', async () => {
    client.apiGet.mockResolvedValue({ balance: 100 });
    const result = await credits.getBalance();
    expect(client.apiGet).toHaveBeenCalledWith('/credits/balance');
    expect(result.balance).toBe(100);
  });

  it('getTransactions returns response', async () => {
    client.apiGet.mockResolvedValue({ data: [] });
    const result = await credits.getTransactions();
    expect(client.apiGet).toHaveBeenCalledWith('/credits/transactions');
  });

  it('getPackages returns response', async () => {
    client.apiGet.mockResolvedValue({ data: [] });
    const result = await credits.getPackages();
    expect(client.apiGet).toHaveBeenCalledWith('/credits/packages');
  });

  it('spendCredit calls POST with leadId and leadType', async () => {
    client.apiPost.mockResolvedValue({ success: true, newBalance: 5 });
    await credits.spendCredit('lead1', 'contact');
    expect(client.apiPost).toHaveBeenCalledWith('/credits/spend', { leadId: 'lead1', leadType: 'contact' });
  });

  it('createPaymentIntent calls POST with packageId', async () => {
    client.apiPost.mockResolvedValue({ clientSecret: 'cs_123' });
    await credits.createPaymentIntent('pkg1');
    expect(client.apiPost).toHaveBeenCalledWith('/credits/payment-intent', { packageId: 'pkg1' });
  });

  it('fulfillPayment calls POST with ids', async () => {
    client.apiPost.mockResolvedValue({ success: true });
    await credits.fulfillPayment('pkg1', 'pi_123');
    expect(client.apiPost).toHaveBeenCalledWith('/credits/fulfill', { packageId: 'pkg1', paymentIntentId: 'pi_123' });
  });

  it('adminSyncPackages calls POST', async () => {
    client.apiPost.mockResolvedValue({ success: true });
    await credits.adminSyncPackages();
    expect(client.apiPost).toHaveBeenCalledWith('/credits/admin/sync-packages');
  });

  it('getInvoice returns GET response', async () => {
    client.apiGet.mockResolvedValue({ invoice_url: 'http://...' });
    await credits.getInvoice('txn1');
    expect(client.apiGet).toHaveBeenCalledWith('/credits/invoice/txn1');
  });
});
