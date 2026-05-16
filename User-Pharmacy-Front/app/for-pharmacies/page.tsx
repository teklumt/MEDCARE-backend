'use client';

import { useEffect } from 'react';

/**
 * Legacy URL: bookmarks or shared links to /for-pharmacies land here,
 * then jump to home anchor (hash cannot be set via HTTP redirect).
 */
export default function ForPharmaciesLegacyRedirect() {
  useEffect(() => {
    window.location.replace(`${window.location.origin}/#for-pharmacies`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-accent-50 text-gray-600 text-sm">
      Taking you to pharmacy partners…
    </div>
  );
}
