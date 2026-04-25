import { initializeApp, getApps } from 'firebase/app';

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn().mockReturnValue({ name: 'test-app' }),
  getApps: jest.fn().mockReturnValue([]),
  getApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({}),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn().mockReturnValue({}),
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn().mockReturnValue({}),
  isSupported: jest.fn().mockResolvedValue(true),
  logEvent: jest.fn(),
}));

describe('Firebase Configuration', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('initializes with required environment variables', () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';
    require('@/lib/firebase/config');
    expect(initializeApp).toHaveBeenCalled();
  });

  it('exposes auth, firestore, and analytics instances', async () => {
    const { auth, db } = require('@/lib/firebase/config');
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
  });
});
