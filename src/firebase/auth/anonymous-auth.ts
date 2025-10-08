'use client';
import { Auth, signInAnonymously } from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch(error => {
    console.error("Anonymous sign-in failed:", error);
    // Optionally, you could emit a global error here if you have a system for it
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
