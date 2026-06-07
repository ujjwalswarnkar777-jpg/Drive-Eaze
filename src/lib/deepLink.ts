/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Mobile-first Deep Linking Engine for Drive-Eaze
 * Redirects links to native Android/iOS apps first, and gracefully falls back to web versions.
 */

/**
 * Helper to detect if user is on Android
 */
export function isAndroidUser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Helper to detect if user is on iOS
 */
export function isIOSUser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Helper to detect any mobile user agent
 */
export function isMobileUser(): boolean {
  return isAndroidUser() || isIOSUser();
}

/**
 * Wraps local routing links to refer to the native companion Android/iOS app first via Universal Intents.
 * If the native app is installed (e.g., com.driveeaze.app), Android/iOS intercepts and opens the app screen.
 * Otherwise, it falls back seamlessly to the standard responsive web page in their mobile browser.
 */
export function getAppLink(path: string): string {
  if (typeof window === 'undefined') return path;
  
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const webFallbackUrl = `${window.location.origin}/${cleanPath}`;

  if (isAndroidUser()) {
    // Official Android Chrome Intent schema. Bypasses browser to launch installed App directly.
    return `intent://driveeaze.in/${cleanPath}#Intent;scheme=https;package=com.driveeaze.app;S.browser_fallback_url=${encodeURIComponent(webFallbackUrl)};end`;
  }
  
  if (isIOSUser()) {
    // Standard Universal iOS app custom scheme prefix
    return `driveeaze://${cleanPath}`;
  }

  return path;
}

/**
 * Generates direct native WhatsApp app chat trigger targeting the user's pre-installed application screen,
 * bypassing intermediate browser redirect screens.
 */
export function getWhatsAppLink(phone: string, text = ''): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const encodedText = text ? encodeURIComponent(text) : '';
  
  if (isAndroidUser()) {
    // Official Android Chrome Intent schema to launch the official WhatsApp Android app directly.
    // This completely bypasses intermediate wa.me web redirect loops in secure/sandboxed environments.
    return `intent://send/?phone=${cleanPhone}${encodedText ? `&text=${encodedText}` : ''}#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(`https://wa.me/${cleanPhone}${encodedText ? `?text=${encodedText}` : ''}`)};end`;
  }
  
  if (isIOSUser()) {
    // Direct custom URI scheme for iOS to trigger native WhatsApp app directly
    return `whatsapp://send?phone=${cleanPhone}${encodedText ? `&text=${encodedText}` : ''}`;
  }

  if (isMobileUser()) {
    // Catch-all fallback for other touchscreen/mobile browsers
    return `whatsapp://send?phone=${cleanPhone}${encodedText ? `&text=${encodedText}` : ''}`;
  }
  
  // Standard web interface backup for desktop users
  return `https://web.whatsapp.com/send?phone=${cleanPhone}${encodedText ? `&text=${encodedText}` : ''}`;
}

/**
 * Generates direct Google Maps native app launcher for modern Android/iOS.
 */
export function getGoogleMapsLink(webUrl = 'https://maps.app.goo.gl/ZbuLB43ozXLPUu5X7'): string {
  if (isAndroidUser()) {
    // Chrome Intent pointing directly to Google Maps app native controller
    return `intent://maps.app.goo.gl/ZbuLB43ozXLPUu5X7#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
  }
  
  if (isIOSUser()) {
    // Launch directly in Apple Maps or Google Maps native application
    return `maps://?q=Shop+K+02,+Kisan+Bazar,+Vibhuti+Khand,+Gomti+Nagar,+Lucknow`;
  }
  
  return webUrl;
}

/**
 * Launches native dialer app instantly.
 */
export function getPhoneLink(phone: string): string {
  const cleanPhone = phone.replace(/[^\s-()]/g, '');
  return `tel:${cleanPhone}`;
}
