import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
const serviceAccount = process.env.FIREBASE_ADMIN_SDK_KEY
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY)
  : null

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    if (!admin.apps.length) {
      return null
    }
    const decodedToken = await admin.auth().verifyIdToken(token)
    return decodedToken.uid
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function revokeToken(uid: string) {
  try {
    if (!admin.apps.length) {
      return false
    }
    await admin.auth().revokeRefreshTokens(uid)
    return true
  } catch (error) {
    console.error('Token revocation error:', error)
    return false
  }
}
