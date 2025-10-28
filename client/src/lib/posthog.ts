import posthog from 'posthog-js';

// PostHog 초기화
export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    if (apiKey) {
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
      });
    } else {
      console.warn('PostHog API key not found. Analytics disabled.');
    }
  }
};

export { posthog };
