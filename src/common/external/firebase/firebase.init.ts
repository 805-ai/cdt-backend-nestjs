import * as admin from 'firebase-admin';
import { Logger } from '@nestjs/common';
import { FIREBASE_ADMIN_CONFIG, FIREBASE_CLIENT_CONFIG } from 'src/common/config/secrets';

const logger = new Logger('FirebaseInit');

export function initializeFirebaseAdmin(): admin.app.App {
  // Check if the app is already initialized to avoid duplicate initialization
  if (admin.apps.length > 0) {
    logger.log('Firebase Admin SDK already initialized');
    return admin.apps[0]!;
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(FIREBASE_ADMIN_CONFIG as admin.ServiceAccount),
      databaseURL: `https://${FIREBASE_ADMIN_CONFIG.project_id}.firebaseio.com`,
    });
    logger.log('Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    logger.warn(`Firebase Admin SDK initialization failed: ${error.message}`);
    return null;
  }
}

export function getFirebaseClientConfig() {
  return FIREBASE_CLIENT_CONFIG;
}

export async function verifyFirebaseConnection(adminApp: admin.app.App | null): Promise<boolean> {
  if (!adminApp) {
    logger.warn('No Firebase app to verify');
    return false;
  }
  try {
    await adminApp
      .auth()
      .getUserByEmail('nonexistent@example.com')
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          return;
        }
        throw error;
      });
    logger.log('Firebase Admin SDK connection verified successfully');
    return true;
  } catch (error) {
    logger.warn(`Firebase verification failed: ${error.message}`);
    return false;
  }
}
