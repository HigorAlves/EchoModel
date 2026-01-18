
# Foundry
![Node.js >= 22](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)
![Yarn 4](https://img.shields.io/badge/yarn-4.9-2C8EBB?logo=yarn)
![TypeScript Strict](https://img.shields.io/badge/typescript-strict-007ACC?logo=typescript)
![Turborepo](https://img.shields.io/badge/monorepo-turborepo-5F45FF?logo=vercel)
![Tests](https://img.shields.io/badge/tests-vitest%20%7C%20cypress-4B32C3?logo=vitest&logoColor=white)

Foundry is a monorepo template for building scalable and maintainable serverless applications on AWS using TypeScript and Domain-Driven Design.

## Why Foundry?

Building robust serverless applications requires a solid architectural foundation. Without it, projects can become difficult to maintain, test, and scale. Foundry provides a production-ready starting point, encapsulating best practices for structure, testing, and deployment.

It solves the "blank slate" problem by providing a clear, layered architecture and pre-configured tooling, allowing developers to focus on business logic instead of boilerplate. The design is heavily influenced by Domain-Driven Design (DDD) to promote separation of concerns and long-term project health.

## Core Features

- **Monorepo Ready:** Organized with Yarn Workspaces and accelerated with Turborepo.
- **Domain-Driven Design:** A clear, layered architecture (`domain`, `application`, `infrastructure`).
- **Serverless First:** Designed for building and deploying AWS Lambda functions.
- **Infrastructure as Code:** AWS CDK for defining and deploying cloud resources.
- **Local Development:** Integrated with LocalStack for a high-fidelity local AWS environment.
- **Core Kernels:** Reusable packages for cross-cutting concerns like authorization, error handling, and logging.
- **Integrated Tooling:** Comes with Vitest for testing, Biome for linting/formatting, and automated releases with Semantic Release.

## Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/foundry.git
    cd foundry
    ```

2.  Install dependencies:
    ```sh
    yarn install
    ```

## Quick Start

This example starts the local development environment, deploys the stack to LocalStack, and runs the unit tests.

1.  **Start the local system (Docker & LocalStack):**
    ```sh
    yarn system:up
    ```

2.  **Deploy the application to LocalStack:**
    ```sh
    yarn cdk:local:deploy
    ```
    This will provision AWS resources (like Lambda and API Gateway) on your local machine.

3.  **Run tests to verify the setup:**
    ```sh
    yarn test
    ```

## Usage

### Basic Usage

-   **Run all apps in development mode:**
    ```sh
    yarn dev
    ```

-   **Build all packages and apps:**
    ```sh
    yarn build
    ```

-   **Run all unit tests:**
    ```sh
    yarn test:unit
    ```

### Generating Code

Foundry includes generators to scaffold new components quickly.

-   **Generate a new Lambda function:**
    ```sh
    yarn gen:lambda
    ```
    This will create a new, fully-configured Lambda package in the `apps/lambdas` directory.

-   **Generate a new Application or Domain package:**
    ```sh
    yarn gen:application
    yarn gen:domain
    ```

### Real-World Scenarios

**Developing a New Feature**

1.  Define new domain entities and logic in a `packages/domain` module.
2.  Implement application-specific logic (e.g., use cases, commands) in a `packages/application` module.
3.  Create a new Lambda function (`yarn gen:lambda`) in the `apps/` directory to expose the feature via an API endpoint.
4.  Define the necessary infrastructure (e.g., API Gateway routes, IAM roles) in the `@foundry/cdk` package.
5.  Deploy to a development or local environment (`yarn cdk:local:deploy`).

**Managing the Database**

The project uses TypeORM for database interactions. Migrations are managed via a CLI script.

-   **Generate a new database migration:**
    ```sh
    yarn db:generate src/migrations/MyNewMigration
    ```

-   **Run all pending migrations:**
    ```sh
    yarn db:migrate
    ```

## How It Works (Mental Model)

The project is structured as a monorepo with a clear separation of concerns, enabling independent development and deployment of components.

-   **`apps/`**: Contains concrete implementations like Lambda functions. These are the entry points to your system and compose functionality from `packages` and `kernel`.
-   **`packages/`**: Contains the core business logic, divided according to DDD layers.
    -   `packages/domain`: Business entities, value objects, and domain-specific logic. Has no external dependencies.
    -   `packages/application`: Use cases and application-level logic that orchestrates domain objects.
-   **`kernel/`**: Provides foundational, cross-cutting concerns (e.g., `authorization`, `logger`, `error`). These are framework-agnostic and can be used by any `app` or `package`.
-   **`infra/`**: Contains all infrastructure definitions.
    -   `infra/cdk`: The AWS CDK application that defines all cloud resources. It consumes the built artifacts from `apps/` to configure Lambda functions.
    -   `infra/database`: Database schemas and migration scripts.
-   **`config/`**: Shared configurations for tools like TypeScript and Vitest.

During a build (`yarn build`), `turbo` compiles all packages and apps. During a deployment (`yarn cdk:deploy`), the CDK application in `infra/cdk` references these compiled artifacts to provision the final infrastructure.

## Non-goals

-   **Frontend Development:** This is a backend-focused template. While it can serve a frontend, it provides no tooling or structure for it.
-   **Multi-Cloud Support:** The infrastructure is tightly coupled with AWS services and the AWS CDK.
-   **A General-Purpose Framework:** This is a template, not a library. It is meant to be modified and adapted to specific project needs.

## Contributing

Contributions are welcome. Please open an issue to discuss your ideas or submit a pull request with your changes. Ensure that all contributions are tested and follow the existing code style.

1.  Fork the repository.
2.  Create a new feature branch.
3.  Make your changes.
4.  Run `yarn verify` to ensure tests and linting pass.
5.  Submit a pull request.

## License

This project is licensed under the ISC License.