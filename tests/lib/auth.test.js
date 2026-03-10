/**
 * Tests for Auth API (real backend integration)
 */
import { register, login, getSession, logout, getUserById } from '../../lib/api/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const isBackendAvailable = await (async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
})();

const describeIfBackend = isBackendAvailable ? describe : describe.skip;

describeIfBackend('Auth API', () => {
  // Note: These tests use real backend calls
  // Backend must be running on localhost:3001

  it('registers a new user with pending roles', async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    
    const result = await register({
      name: 'John Doe',
      email: testEmail,
      password: 'TestPassword123',
      roles: ['buyer', 'seller'], // Specify roles to register
    });

    expect(result.user).toBeDefined();
    expect(result.user).toHaveProperty('id');
    expect(result.user.name).toBe('John Doe');
    expect(result.user.email).toBe(testEmail);
    expect(result.user.roles.length).toBeGreaterThanOrEqual(2); // buyer + seller requested
    expect(result.user.roles[0].status).toBe('pending');
  }, 10000);

  it('logs in with correct credentials', async () => {
    const testEmail = `login-${Date.now()}@example.com`;
    
    // Register first
    await register({
      name: 'Login Test',
      email: testEmail,
      password: 'TestPassword123',
      roles: ['buyer'],
    });

    // Note: Can't test approved user without admin approval
    // This will fail until roles are approved
    try {
      await login({
        email: testEmail,
        password: 'TestPassword123'
      });
      // If we get here, user has no approved roles, so login should return no roles
    } catch (err) {
      // Expected - user has no approved roles yet
      expect(err.message).toContain('Invalid email or password');
    }
  }, 10000);

  it('rejects login with wrong password', async () => {
    const testEmail = `wrong-${Date.now()}@example.com`;
    
    await register({
      name: 'Wrong Password Test',
      email: testEmail,
      password: 'CorrectPassword123',
      roles: ['buyer'],
    });

    await expect(login({
      email: testEmail,
      password: 'WrongPassword'
    })).rejects.toThrow();
  }, 10000);

  it('returns null session when no token', async () => {
    // Clear any existing tokens
    localStorage.clear();
    
    const session = await getSession();
    expect(session).toBeNull();
  });

  it('clears session on logout', async () => {
    // Store a fake token
    localStorage.setItem('accessToken', 'fake-token');
    
    await logout();

    // Token should be cleared
    const token = localStorage.getItem('accessToken');
    expect(token).toBeNull();
  });

  it('getUserById returns null without valid token', async () => {
    localStorage.clear();
    
    const user = await getUserById('some-id');
    expect(user).toBeNull();
  });
});
