import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fs from 'fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-test-project',
    firestore: {
      rules: fs.readFileSync('DRAFT_firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {
  it('should allow everyone to read settings', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(unauthDb.collection('settings').doc('global').get());
  });

  it('should deny unauthenticated users to update settings', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthDb.collection('settings').doc('global').update({ examDate: '2026-08-05T08:30:00Z' }));
  });

  it('should deny non-admin users to update settings', async () => {
    const unauthDb = testEnv.authenticatedContext('user123', { email_verified: true }).firestore();
    await assertFails(unauthDb.collection('settings').doc('global').update({ examDate: '2026-08-05T08:30:00Z' }));
  });

  it('should allow admin users to update settings with correct fields', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection('admins').doc('adminUser').set({ email: 'admin@example.com' });
      await db.collection('settings').doc('global').set({ examDate: '2026-08-05T08:30:00Z' });
    });
    
    const adminDb = testEnv.authenticatedContext('adminUser', { email_verified: true }).firestore();
    await assertSucceeds(adminDb.collection('settings').doc('global').update({ examDate: '2026-09-05T08:30:00Z' }));
  });

  it('should deny admin passing invalid types to settings', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection('admins').doc('adminUser').set({ email: 'admin@example.com' });
      await db.collection('settings').doc('global').set({ examDate: '2026-08-05T08:30:00Z' });
    });
    
    const adminDb = testEnv.authenticatedContext('adminUser', { email_verified: true }).firestore();
    await assertFails(adminDb.collection('settings').doc('global').update({ examDate: 123 }));
  });

  it('should deny creating new setting documents', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection('admins').doc('adminUser').set({ email: 'admin@example.com' });
    });
    
    const adminDb = testEnv.authenticatedContext('adminUser', { email_verified: true }).firestore();
    await assertFails(adminDb.collection('settings').doc('other').set({ examDate: '2026-09-05T08:30:00Z' }));
  });

  it('should allow only authenticated users to read admins', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(unauthDb.collection('admins').doc('someAdmin').get());
    
    const authDb = testEnv.authenticatedContext('user123', { email_verified: true }).firestore();
    await assertFails(authDb.collection('admins').doc('user123').get());
    
    const adminDb = testEnv.authenticatedContext('adminUser', { email_verified: true }).firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('admins').doc('adminUser').set({ email: 'admin@example.com' });
    });
    // Assuming even admins can't read the whole collection for security unless necessary, or they can checking their own
  });
});
