import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'scope-enum': [2, 'always', ['ui', 'lambdas', 'web', 'infra', 'domain', 'shared', 'cli', 'config']],
		'type-enum': [
			2,
			'always',
			['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'revert'],
		],
		'body-max-line-length': [0],
	},
}

export default config
