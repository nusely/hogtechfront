export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = async (err: Error, request: { url: string; method: string; headers: Headers }) => {
  await import('@sentry/nextjs').then(({ captureException }) => {
    captureException(err);
  });
};

