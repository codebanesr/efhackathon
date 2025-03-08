# EFHack Project Guidelines

## Build & Development Commands
- `pnpm dev` - Run development server
- `pnpm build` - Build for production
- `pnpm check` - Type check and lint codebase
- `pnpm lint` - Run ESLint only
- `pnpm check:code` - Run TypeScript check and ESLint
- `pnpm database:sync:dev` - Update database with schema changes
- `pnpm database:reset` - Reset database and seed with mock data

## Code Style Guidelines
- **Imports**: Use named exports over default exports except in Remix pages
- **TypeScript**: Use optional chaining for arrays (`items?.map`), explicit typing with Prisma relations using `Prisma.[Model]GetPayload<>`
- **Naming**: Use PascalCase for components, camelCase for variables/functions
- **Components**: Place in `/app/designSystem/ui/[ComponentName]/index.tsx`
- **Data Access**: Use auto-generated tRPC endpoints with `Api` from `@/core/trpc`
- **Hooks**: Declare all React Query/tRPC hooks at the top level of components
- **Models**: Define in `models/models.zmodel` (not `.prisma`), new fields must be optional or have defaults
- **Error Handling**: Use optional chaining and nullish coalescing operators consistently

## Project Structure
- Routes in `/app/routes/` - Use `_logged.` prefix for authenticated routes
- Core utilities in `/app/core/` - Authentication, configuration, database, tRPC
- UI components in `/app/designSystem/` - Layouts, themes, components
- Model definitions in `/models/models.zmodel`