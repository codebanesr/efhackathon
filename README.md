# DevOps Assistant - Cursor for DevOps Engineers

A modern web application that streamlines DevOps workflow management through automated repository cloning, container management, and system observability.

## Features

### Repository Management & Deployment
This page features:
- GitHub repository search and cloning interface with automated deployment workflow
- Real-time chat widget with DevOps assistance for troubleshooting and best practices
- Automated workflow visualization showing cloning, dependency installation, Dockerfile generation, image building, and deployment
- Container management dashboard for monitoring active containers

### Observability Dashboard
This page provides:
- Real-time log visualization for backend services, databases, and frontend applications
- Performance metrics with interactive charts showing resource utilization, response times, and error rates
- Intelligent alert system that detects anomalies, generates notifications, and suggests remediation steps
- System health monitoring with key service status indicators

## Technical Implementation

- **Frontend**: React with Remix, TypeScript, and Ant Design
- **Visualization**: Recharts for performance metrics and log analytics
- **Mock Data**: Simulated repository data, container statuses, and system logs for demonstration purposes
- **Responsive Design**: Fully responsive layouts that work on desktop and mobile devices

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Navigate to `http://localhost:3000` to access the application.
Login with any credentials (mock authentication for demo purposes).

## For Development

This project uses the following technologies:
- Remix for server-side rendering and routing
- TypeScript for type safety
- Ant Design for UI components
- Recharts for data visualization

The codebase follows a standard Remix project structure with routes defined in the `app/routes` directory.

### Main Routes
- `/devops/repositories` - Repository management and container deployment
- `/devops/observability` - System monitoring and log visualization