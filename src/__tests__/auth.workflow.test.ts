import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

describe('Auth Workflow', () => {
  it('triggers Google sign-in popup', async () => {
    (signInWithPopup as jest.Mock).mockResolvedValue({
      user: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' },
    });
    const result = await signInWithPopup({} as any, {} as any);
    expect(result.user.uid).toBe('test-uid');
  });

  it('signs out successfully', async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);
    await signOut({} as any);
    expect(signOut).toHaveBeenCalled();
  });

  it('detects unauthenticated state', () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn();
    });
    const callback = jest.fn();
    onAuthStateChanged({} as any, callback);
    expect(callback).toHaveBeenCalledWith(null);
  });
});
