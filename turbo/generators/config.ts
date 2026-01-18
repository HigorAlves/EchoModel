/**
 * @fileoverview Turbo Generators Configuration
 *
 * Defines generators for creating new bounded contexts and adding components
 * to existing domains. Uses Plop.js under the hood.
 *
 * Available generators:
 * - lambda: Create a new Lambda API for a bounded context
 * - application: Add CQRS components to an existing bounded context
 * - domain: Add DDD components to an existing bounded context
 */

import type { PlopTypes } from '@turbo/gen'

// Helper to convert to PascalCase
function toPascalCase(str: string): string {
	return str
		.split(/[-_\s]+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join('')
}

// Helper to convert to camelCase
function toCamelCase(str: string): string {
	const pascal = toPascalCase(str)
	return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

// Helper to convert to kebab-case
function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase()
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
	// Register custom helpers
	plop.setHelper('pascalCase', (text: string) => toPascalCase(text))
	plop.setHelper('camelCase', (text: string) => toCamelCase(text))
	plop.setHelper('kebabCase', (text: string) => toKebabCase(text))
	plop.setHelper('upperCase', (text: string) => text.toUpperCase())
	plop.setHelper('lowerCase', (text: string) => text.toLowerCase())

	// Lambda Generator - Creates a new Lambda API bounded context
	plop.setGenerator('lambda', {
		description: 'Create a new Lambda API for a bounded context',
		prompts: [
			{
				type: 'input',
				name: 'name',
				message: 'Bounded context name (e.g., order, payment, inventory):',
				validate: (input: string) => {
					if (!input || input.trim().length === 0) {
						return 'Name is required'
					}
					if (!/^[a-z][a-z0-9-]*$/.test(input)) {
						return 'Name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens'
					}
					return true
				},
			},
			{
				type: 'input',
				name: 'port',
				message: 'Local development port (e.g., 3003):',
				default: '3003',
				validate: (input: string) => {
					const port = Number.parseInt(input, 10)
					if (Number.isNaN(port) || port < 1024 || port > 65535) {
						return 'Port must be a number between 1024 and 65535'
					}
					return true
				},
			},
		],
		actions: [
			// Package configuration files
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/package.json',
				templateFile: 'templates/lambda/package.json.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/tsconfig.json',
				templateFile: 'templates/lambda/tsconfig.json.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/tsdown.config.ts',
				templateFile: 'templates/lambda/tsdown.config.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/vitest.config.ts',
				templateFile: 'templates/lambda/vitest.config.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/vitest.e2e.config.ts',
				templateFile: 'templates/lambda/vitest.e2e.config.ts.hbs',
			},
			// Source files
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/index.ts',
				templateFile: 'templates/lambda/src/index.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/app.ts',
				templateFile: 'templates/lambda/src/app.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/local.ts',
				templateFile: 'templates/lambda/src/local.ts.hbs',
			},
			// DI files
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/di/index.ts',
				templateFile: 'templates/lambda/src/di/index.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/di/container.ts',
				templateFile: 'templates/lambda/src/di/container.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/di/tokens.ts',
				templateFile: 'templates/lambda/src/di/tokens.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/di/config.ts',
				templateFile: 'templates/lambda/src/di/config.ts.hbs',
			},
			// Handler files
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/handlers/index.ts',
				templateFile: 'templates/lambda/src/handlers/index.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/handlers/create{{pascalCase name}}.handler.ts',
				templateFile: 'templates/lambda/src/handlers/create.handler.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/handlers/get{{pascalCase name}}.handler.ts',
				templateFile: 'templates/lambda/src/handlers/get.handler.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/handlers/list{{pascalCase name}}s.handler.ts',
				templateFile: 'templates/lambda/src/handlers/list.handler.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/handlers/update{{pascalCase name}}.handler.ts',
				templateFile: 'templates/lambda/src/handlers/update.handler.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/handlers/delete{{pascalCase name}}.handler.ts',
				templateFile: 'templates/lambda/src/handlers/delete.handler.ts.hbs',
			},
			// Routes files
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/routes/index.ts',
				templateFile: 'templates/lambda/src/routes/index.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/routes/{{kebabCase name}}.routes.ts',
				templateFile: 'templates/lambda/src/routes/routes.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/routes/{{kebabCase name}}.openapi.ts',
				templateFile: 'templates/lambda/src/routes/openapi.ts.hbs',
			},
			// Testing files
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/testing/index.ts',
				templateFile: 'templates/lambda/src/testing/index.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/testing/setup.ts',
				templateFile: 'templates/lambda/src/testing/setup.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/testing/setup-e2e.ts',
				templateFile: 'templates/lambda/src/testing/setup-e2e.ts.hbs',
			},
			{
				type: 'add',
				path: 'apps/lambdas/{{kebabCase name}}/src/testing/helpers.ts',
				templateFile: 'templates/lambda/src/testing/helpers.ts.hbs',
			},
			// Post-generation message
			() => {
				return `
Lambda API created successfully!

Next steps:
1. Add domain and application layer components:
   yarn generate  # Select 'domain' and 'application'

2. Add CDK integration in infra/cdk/lib/utils/package-resolver.ts:
   - Add package constant
   - Add getter function

3. Update CDK stacks:
   - infra/cdk/lib/stacks/lambda-stack.ts
   - infra/cdk/lib/stacks/lambda-stack-local.ts
   - infra/cdk/lib/stacks/api-gateway-stack.ts
   - infra/cdk/lib/stacks/api-gateway-stack-local.ts

4. Build and test:
   yarn workspace @foundry/api-{{kebabCase name}} run build
   yarn workspace @foundry/api-{{kebabCase name}} run start:local
`
			},
		],
	})

	// Application Generator - Adds CQRS components to existing bounded context
	plop.setGenerator('application', {
		description: 'Add CQRS components to an existing bounded context',
		prompts: [
			{
				type: 'input',
				name: 'context',
				message: 'Bounded context name (PascalCase, e.g., Order, Payment):',
				validate: (input: string) => {
					if (!input || input.trim().length === 0) {
						return 'Context name is required'
					}
					if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
						return 'Context name must be PascalCase (e.g., Order, PaymentMethod)'
					}
					return true
				},
			},
			{
				type: 'checkbox',
				name: 'components',
				message: 'Select components to generate:',
				choices: [
					{ name: 'Commands (Create, Update, Delete)', value: 'commands', checked: true },
					{ name: 'Queries (GetById, List)', value: 'queries', checked: true },
					{ name: 'DTOs (Input/Output)', value: 'dtos', checked: true },
					{ name: 'Mappers', value: 'mappers', checked: true },
					{ name: 'Events', value: 'events', checked: false },
				],
				validate: (input: string[]) => {
					if (input.length === 0) {
						return 'Please select at least one component'
					}
					return true
				},
			},
		],
		actions: (data) => {
			const actions: PlopTypes.ActionType[] = []

			// Always create the index file
			actions.push({
				type: 'add',
				path: 'packages/application/src/{{pascalCase context}}/index.ts',
				templateFile: 'templates/application/index.ts.hbs',
				skipIfExists: true,
			})

			// Commands
			if (data?.components?.includes('commands')) {
				actions.push(
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/commands/index.ts',
						templateFile: 'templates/application/commands/index.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/commands/Create{{pascalCase context}}.command.ts',
						templateFile: 'templates/application/commands/Create.command.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/commands/Update{{pascalCase context}}.command.ts',
						templateFile: 'templates/application/commands/Update.command.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/commands/Delete{{pascalCase context}}.command.ts',
						templateFile: 'templates/application/commands/Delete.command.ts.hbs',
						skipIfExists: true,
					},
				)
			}

			// Queries
			if (data?.components?.includes('queries')) {
				actions.push(
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/queries/index.ts',
						templateFile: 'templates/application/queries/index.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/queries/Get{{pascalCase context}}ById.query.ts',
						templateFile: 'templates/application/queries/GetById.query.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/queries/List{{pascalCase context}}s.query.ts',
						templateFile: 'templates/application/queries/List.query.ts.hbs',
						skipIfExists: true,
					},
				)
			}

			// DTOs
			if (data?.components?.includes('dtos')) {
				actions.push(
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/dto/index.ts',
						templateFile: 'templates/application/dto/index.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/dto/input/index.ts',
						templateFile: 'templates/application/dto/input/index.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/dto/input/Create{{pascalCase context}}.input.ts',
						templateFile: 'templates/application/dto/input/Create.input.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/dto/input/Update{{pascalCase context}}.input.ts',
						templateFile: 'templates/application/dto/input/Update.input.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/dto/input/Get{{pascalCase context}}ById.input.ts',
						templateFile: 'templates/application/dto/input/GetById.input.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/dto/input/List{{pascalCase context}}s.input.ts',
						templateFile: 'templates/application/dto/input/List.input.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/dto/output/index.ts',
						templateFile: 'templates/application/dto/output/index.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/dto/output/{{pascalCase context}}.output.ts',
						templateFile: 'templates/application/dto/output/Entity.output.ts.hbs',
						skipIfExists: true,
					},
				)
			}

			// Mappers
			if (data?.components?.includes('mappers')) {
				actions.push(
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/mappers/index.ts',
						templateFile: 'templates/application/mappers/index.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/mappers/{{camelCase context}}.mapper.ts',
						templateFile: 'templates/application/mappers/entity.mapper.ts.hbs',
						skipIfExists: true,
					},
				)
			}

			// Events
			if (data?.components?.includes('events')) {
				actions.push(
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/events/index.ts',
						templateFile: 'templates/application/events/index.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/events/{{pascalCase context}}Created.event.ts',
						templateFile: 'templates/application/events/Created.event.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/events/{{pascalCase context}}Updated.event.ts',
						templateFile: 'templates/application/events/Updated.event.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/application/src/{{pascalCase context}}/events/{{pascalCase context}}Deleted.event.ts',
						templateFile: 'templates/application/events/Deleted.event.ts.hbs',
						skipIfExists: true,
					},
				)
			}

			// Post-generation message
			actions.push(() => {
				return `
Application layer components created for {{pascalCase context}}!

Next steps:
1. Update packages/application/src/index.ts to export the new bounded context
2. Implement the business logic in each command/query
3. Create corresponding domain entities if not already done
`
			})

			return actions
		},
	})

	// Domain Generator - Adds DDD components to existing bounded context
	plop.setGenerator('domain', {
		description: 'Add DDD components to an existing bounded context',
		prompts: [
			{
				type: 'input',
				name: 'context',
				message: 'Bounded context name (PascalCase, e.g., Order, Payment):',
				validate: (input: string) => {
					if (!input || input.trim().length === 0) {
						return 'Context name is required'
					}
					if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
						return 'Context name must be PascalCase (e.g., Order, PaymentMethod)'
					}
					return true
				},
			},
			{
				type: 'checkbox',
				name: 'components',
				message: 'Select components to generate:',
				choices: [
					{ name: 'Entity (Aggregate Root)', value: 'entity', checked: true },
					{ name: 'Value Objects (Id)', value: 'valueObjects', checked: true },
					{ name: 'Repository Interface', value: 'repository', checked: true },
					{ name: 'Enums (Status)', value: 'enums', checked: true },
					{ name: 'Errors', value: 'errors', checked: true },
					{ name: 'Events', value: 'events', checked: true },
					{ name: 'Mapper', value: 'mapper', checked: false },
					{ name: 'Domain Service', value: 'service', checked: false },
				],
				validate: (input: string[]) => {
					if (input.length === 0) {
						return 'Please select at least one component'
					}
					return true
				},
			},
		],
		actions: (data) => {
			const actions: PlopTypes.ActionType[] = []

			// Always create the index file
			actions.push({
				type: 'add',
				path: 'packages/domain/src/{{pascalCase context}}/index.ts',
				templateFile: 'templates/domain/index.ts.hbs',
				skipIfExists: true,
			})

			// Entity
			if (data?.components?.includes('entity')) {
				actions.push({
					type: 'add',
					path: 'packages/domain/src/{{pascalCase context}}/{{pascalCase context}}.entity.ts',
					templateFile: 'templates/domain/Entity.entity.ts.hbs',
					skipIfExists: true,
				})
			}

			// Value Objects
			if (data?.components?.includes('valueObjects')) {
				actions.push(
					{
						type: 'add',
						path: 'packages/domain/src/{{pascalCase context}}/value-objects/index.ts',
						templateFile: 'templates/domain/value-objects/index.ts.hbs',
						skipIfExists: true,
					},
					{
						type: 'add',
						path: 'packages/domain/src/{{pascalCase context}}/value-objects/{{pascalCase context}}Id.vo.ts',
						templateFile: 'templates/domain/value-objects/Id.vo.ts.hbs',
						skipIfExists: true,
					},
				)
			}

			// Repository
			if (data?.components?.includes('repository')) {
				actions.push({
					type: 'add',
					path: 'packages/domain/src/{{pascalCase context}}/{{camelCase context}}.repository.ts',
					templateFile: 'templates/domain/repository.ts.hbs',
					skipIfExists: true,
				})
			}

			// Enums
			if (data?.components?.includes('enums')) {
				actions.push({
					type: 'add',
					path: 'packages/domain/src/{{pascalCase context}}/{{camelCase context}}.enum.ts',
					templateFile: 'templates/domain/enum.ts.hbs',
					skipIfExists: true,
				})
			}

			// Errors
			if (data?.components?.includes('errors')) {
				actions.push({
					type: 'add',
					path: 'packages/domain/src/{{pascalCase context}}/{{camelCase context}}.error.ts',
					templateFile: 'templates/domain/error.ts.hbs',
					skipIfExists: true,
				})
			}

			// Events
			if (data?.components?.includes('events')) {
				actions.push({
					type: 'add',
					path: 'packages/domain/src/{{pascalCase context}}/{{camelCase context}}.event.ts',
					templateFile: 'templates/domain/event.ts.hbs',
					skipIfExists: true,
				})
			}

			// Mapper
			if (data?.components?.includes('mapper')) {
				actions.push({
					type: 'add',
					path: 'packages/domain/src/{{pascalCase context}}/{{camelCase context}}.mapper.ts',
					templateFile: 'templates/domain/mapper.ts.hbs',
					skipIfExists: true,
				})
			}

			// Service
			if (data?.components?.includes('service')) {
				actions.push({
					type: 'add',
					path: 'packages/domain/src/{{pascalCase context}}/{{camelCase context}}.service.ts',
					templateFile: 'templates/domain/service.ts.hbs',
					skipIfExists: true,
				})
			}

			// Post-generation message
			actions.push(() => {
				return `
Domain layer components created for {{pascalCase context}}!

Next steps:
1. Update packages/domain/src/index.ts to export the new bounded context
2. Implement the entity business logic and invariants
3. Create corresponding application layer if not already done
4. Add database entity and repository implementation in infra/database
`
			})

			return actions
		},
	})
}
