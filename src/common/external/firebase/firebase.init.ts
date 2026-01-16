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
    logger.error(`Failed to initialize Firebase Admin SDK: ${error.message}`, error.stack);
    const errorDetails = `Firebase initialization error. Please verify:
      1. Project ID '${FIREBASE_ADMIN_CONFIG.project_id}' exists in your Firebase Console
      2. Service account '${FIREBASE_ADMIN_CONFIG.client_email}' has 'Editor' or 'Firebase Admin' role
      3. Private key is valid and not revoked
      4. Database URL 'https://${FIREBASE_ADMIN_CONFIG.project_id}.firebaseio.com' is correct
      5. Network allows outbound connections to Firebase services`;
    logger.error(errorDetails);
    throw new Error(errorDetails);
  }
}

export function getFirebaseClientConfig() {
  return FIREBASE_CLIENT_CONFIG;
}

export async function verifyFirebaseConnection(adminApp: admin.app.App): Promise<boolean> {
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
    logger.error(`Failed to verify Firebase Admin SDK connection: ${error.message}`, error.stack);
    const errorDetails = `Firebase connection verification failed. Possible causes:
      1. Invalid or revoked service account credentials
      2. Project '${FIREBASE_ADMIN_CONFIG.project_id}' does not exist or is misconfigured
      3. Network connectivity issues to Firebase services
      4. Insufficient permissions for service account '${FIREBASE_ADMIN_CONFIG.client_email}'`;
    logger.error(errorDetails);
    return false;
  }
}
