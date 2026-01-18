/** @type {import('semantic-release').GlobalConfig} */
export default {
	branches: [
		'main',
		{
			name: 'beta',
			prerelease: true,
		},
		{
			name: 'alpha',
			prerelease: true,
		},
	],
	tagFormat: `v\${version}`,
	plugins: [
		[
			'@semantic-release/commit-analyzer',
			{
				preset: 'conventionalcommits',
				releaseRules: [
					{ type: 'feat', release: 'minor' },
					{ type: 'fix', release: 'patch' },
					{ type: 'perf', release: 'patch' },
					{ type: 'revert', release: 'patch' },
					{ type: 'docs', release: false },
					{ type: 'style', release: false },
					{ type: 'chore', release: false },
					{ type: 'refactor', release: 'patch' },
					{ type: 'test', release: false },
					{ type: 'build', release: false },
					{ type: 'ci', release: false },
					{ breaking: true, release: 'major' },
					{ scope: 'no-release', release: false },
				],
				parserOpts: {
					noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
				},
			},
		],
		[
			'@semantic-release/release-notes-generator',
			{
				preset: 'conventionalcommits',
				presetConfig: {
					types: [
						{ type: 'feat', section: '🚀 Features' },
						{ type: 'fix', section: '🐛 Bug Fixes' },
						{ type: 'perf', section: '⚡ Performance Improvements' },
						{ type: 'revert', section: '🔄 Reverts' },
						{ type: 'refactor', section: '📦 Code Refactoring' },
						{ type: 'docs', section: '📚 Documentation', hidden: false },
						{ type: 'style', section: '💎 Styles', hidden: true },
						{ type: 'chore', section: '🧹 Miscellaneous Chores', hidden: true },
						{ type: 'test', section: '🧪 Tests', hidden: true },
						{ type: 'build', section: '🏗️ Build System', hidden: true },
						{ type: 'ci', section: '👷 CI/CD', hidden: true },
					],
				},
				writerOpts: {
					commitsSort: ['subject', 'scope'],
					noteGroupsSort: 'title',
					notesSort: 'text',
					groupBy: 'type',
					commitGroupsSort: (a, b) => {
						const order = [
							'🚀 Features',
							'🐛 Bug Fixes',
							'⚡ Performance Improvements',
							'🔄 Reverts',
							'📦 Code Refactoring',
							'📚 Documentation',
							'💎 Styles',
							'🧪 Tests',
							'🏗️ Build System',
							'👷 CI/CD',
							'🧹 Miscellaneous Chores',
						]
						return order.indexOf(a.title) - order.indexOf(b.title)
					},
					transform: (commit, context) => {
						if (commit.type === 'feat') {
							commit.type = '🚀 Features'
						} else if (commit.type === 'fix') {
							commit.type = '🐛 Bug Fixes'
						} else if (commit.type === 'perf') {
							commit.type = '⚡ Performance Improvements'
						} else if (commit.type === 'revert') {
							commit.type = '🔄 Reverts'
						} else if (commit.type === 'refactor') {
							commit.type = '📦 Code Refactoring'
						} else if (commit.type === 'docs') {
							commit.type = '📚 Documentation'
						} else if (commit.type === 'style') {
							commit.type = '💎 Styles'
						} else if (commit.type === 'test') {
							commit.type = '🧪 Tests'
						} else if (commit.type === 'build') {
							commit.type = '🏗️ Build System'
						} else if (commit.type === 'ci') {
							commit.type = '👷 CI/CD'
						} else if (commit.type === 'chore') {
							commit.type = '🧹 Miscellaneous Chores'
						}

						if (commit.scope === '*') {
							commit.scope = ''
						}

						if (typeof commit.hash === 'string') {
							commit.shortHash = commit.hash.substring(0, 7)
						}

						if (typeof commit.subject === 'string') {
							let url = context.repository ? `${context.host}/${context.owner}/${context.repository}` : context.repoUrl
							if (url) {
								url = `${url}/issues/`
								// Issue URLs.
								commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
									return `[#${issue}](${url}${issue})`
								})
							}
							if (context.host) {
								// User URLs.
								commit.subject = commit.subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) => {
									if (username.includes('/')) {
										return `@${username}`
									}
									return `[@${username}](${context.host}/${username})`
								})
							}
						}

						// remove references that already appear in the subject
						commit.references = commit.references.filter((reference) => {
							if (reference.issue && commit.subject && commit.subject.includes(`#${reference.issue}`)) {
								return false
							}
							return true
						})

						return commit
					},
				},
			},
		],
		[
			'@semantic-release/changelog',
			{
				changelogFile: 'CHANGELOG.md',
				changelogTitle:
					'# Changelog\n\nAll notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.',
			},
		],
		[
			'@semantic-release/github',
			{
				successComment: `🎉 This \${issue.pull_request ? "PR is included" : "issue has been resolved"} in version \${nextRelease.version} :tada:\n\nThe release is available on [GitHub release](\${releases.filter(release => release.name === "GitHub release")[0].url})`,
				failComment: false,
				failTitle: false,
				labels: ['released'],
				releasedLabels: ['released'],
				addReleases: 'bottom',
				assets: [
					{ path: 'CHANGELOG.md', label: 'Changelog' },
					{ path: 'package.json', label: 'Package manifest' },
				],
			},
		],
		[
			'@semantic-release/git',
			{
				assets: ['CHANGELOG.md', 'package.json'],
				message: `chore(release): \${nextRelease.version} [skip ci]\n\n\${nextRelease.notes}`,
			},
		],
	],
	npmPublish: false,
}
