import { vi } from 'vitest';

vi.mock('@/lib/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

import * as client from '@/lib/api/client';
import * as credits from '@/lib/api/credits';

describe('Credits API — Production Gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getBalance returns 0 for new users', async () => {
    client.apiGet.mockResolvedValue({ balance: 0 });
    const result = await credits.getBalance();
    expect(result.balance).toBe(0);
  });

  it('getBalance returns actual balance', async () => {
    client.apiGet.mockResolvedValue({ balance: 150 });
    const result = await credits.getBalance();
    expect(result.balance).toBe(150);
  });

  it('spendCredit sends correct leadId and leadType', async () => {
    client.apiPost.mockResolvedValue({ success: true, newBalance: 5 });
    await credits.spendCredit('lead-abc-123', 'contact');
    expect(client.apiPost).toHaveBeenCalledWith('/credits/spend', {
      leadId: 'lead-abc-123',
      leadType: 'contact',
    });
  });

  it('spendCredit returns new balance after deduction', async () => {
    client.apiPost.mockResolvedValue({ success: true, newBalance: 8 });
    const result = await credits.spendCredit('lead-1', 'contact');
    expect(result.newBalance).toBe(8);
  });

  it('createPaymentIntent sends packageId', async () => {
    client.apiPost.mockResolvedValue({ clientSecret: 'pi_secret_123' });
    const result = await credits.createPaymentIntent('pkg-basic');
    expect(client.apiPost).toHaveBeenCalledWith('/credits/payment-intent', { packageId: 'pkg-basic' });
    expect(result.clientSecret).toBeTruthy();
  });

  it('fulfillPayment sends both IDs', async () => {
    client.apiPost.mockResolvedValue({ success: true, balance: 50 });
    await credits.fulfillPayment('pkg-basic', 'pi_12345');
    expect(client.apiPost).toHaveBeenCalledWith('/credits/fulfill', {
      packageId: 'pkg-basic',
      paymentIntentId: 'pi_12345',
    });
  });

  it('getTransactions returns empty array for new users', async () => {
    client.apiGet.mockResolvedValue({ data: [], total: 0 });
    const result = await credits.getTransactions();
    expect(result.data).toEqual([]);
  });

  it('getTransactions returns paginated transactions', async () => {
    client.apiGet.mockResolvedValue({
      data: [
        { id: 't1', amount: 10, type: 'purchase', createdAt: '2024-01-01' },
        { id: 't2', amount: -1, type: 'spend', createdAt: '2024-01-02' },
      ],
      total: 2,
    });
    const result = await credits.getTransactions();
    expect(result.data).toHaveLength(2);
    expect(result.data[0].type).toBe('purchase');
    expect(result.data[1].type).toBe('spend');
  });

  it('getPackages returns available credit packages', async () => {
    client.apiGet.mockResolvedValue({
      data: [
        { id: 'pkg-1', name: 'Basic', credits: 10, price: 99 },
        { id: 'pkg-2', name: 'Pro', credits: 50, price: 399 },
      ],
    });
    const result = await credits.getPackages();
    expect(result.data).toHaveLength(2);
  });

  it('getInvoice returns invoice data', async () => {
    client.apiGet.mockResolvedValue({ invoiceUrl: 'https://stripe.com/invoice/123', number: 'INV-001' });
    const result = await credits.getInvoice('txn-1');
    expect(result.number).toBe('INV-001');
  });
});
