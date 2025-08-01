import * as Sentry from "@sentry/cloudflare"

export const onRequest = [
    Sentry.sentryPagesPlugin((context) => ({
        dsn: context.env.SENTRY_DSN,
        // Set tracesSampleRate to 1.0 to capture 100% of spans for tracing.
        // Learn more at
        // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
        tracesSampleRate: 1.0,
        environment: context.env.VITE_ENVIRONMENT_TYPE
    }))
]