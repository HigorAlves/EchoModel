// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

type AppEnvironment = 'production' | 'staging' | 'development' | 'local' | 'test'

interface EnvironmentConfig {
	enabled: boolean
	tracesSampleRate: number
	debug: boolean
	sendDefaultPii: boolean
}

const ENVIRONMENT_CONFIGS: Record<AppEnvironment, EnvironmentConfig> = {
	production: { enabled: true, tracesSampleRate: 0.1, debug: false, sendDefaultPii: false },
	staging: { enabled: true, tracesSampleRate: 0.5, debug: true, sendDefaultPii: true },
	development: { enabled: true, tracesSampleRate: 1.0, debug: true, sendDefaultPii: true },
	local: { enabled: false, tracesSampleRate: 1.0, debug: true, sendDefaultPii: true },
	test: { enabled: false, tracesSampleRate: 0, debug: false, sendDefaultPii: false },
}

function getAppEnvironment(): AppEnvironment {
	const appEnv = process.env.APP_ENV
	if (appEnv && ['production', 'staging', 'development', 'local', 'test'].includes(appEnv)) {
		return appEnv as AppEnvironment
	}
	const nodeEnv = process.env.NODE_ENV
	if (nodeEnv === 'production') return 'production'
	if (nodeEnv === 'test') return 'test'
	return 'local'
}

function isSentryEnabled(): boolean {
	const sentryEnabled = process.env.SENTRY_ENABLED
	if (sentryEnabled === 'true') return true
	if (sentryEnabled === 'false') return false
	const dsn = process.env.SENTRY_DSN
	if (!dsn) return false
	return ENVIRONMENT_CONFIGS[getAppEnvironment()].enabled
}

const environment = getAppEnvironment()
const envConfig = ENVIRONMENT_CONFIGS[environment]
const enabled = isSentryEnabled()
const dsn = process.env.SENTRY_DSN

// Only import and initialize Sentry when enabled to avoid build-time issues
if (enabled && dsn) {
	import('@sentry/nextjs').then((Sentry) => {
		Sentry.init({
			dsn,
			environment,
			tracesSampleRate: envConfig.tracesSampleRate,
			debug: envConfig.debug,
			sendDefaultPii: envConfig.sendDefaultPii,
			enableLogs: true,
			initialScope: {
				tags: {
					app: 'dashboard',
				},
			},
		})
	})
}
