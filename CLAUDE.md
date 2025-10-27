# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Paired** - A NestJS-based relationship questions app for couples. The API allows couples to create relationships, receive daily questions, submit answers, and chat about their responses via WebSockets.

## Development Commands

### Setup & Installation
```bash
npm install
npx prisma generate           # Generate Prisma client after schema changes
npx prisma migrate dev        # Create and apply migrations in development
npx prisma migrate deploy     # Apply migrations in production
```

### Running the Application
```bash
npm run start:dev             # Development mode with watch
npm run start:debug           # Debug mode with watch
npm run start:prod            # Production mode
```

### Testing & Quality
```bash
npm run test                  # Run unit tests
npm run test:watch            # Run tests in watch mode
npm run test:cov              # Run tests with coverage
npm run test:e2e              # Run end-to-end tests
npm run lint                  # Lint and fix TypeScript files
npm run format                # Format code with Prettier
```

### Build & Database
```bash
npm run build                 # Build the project
npx prisma studio             # Open Prisma Studio GUI for database
```

## Architecture & Patterns

### Module Structure

The app follows NestJS modular architecture with 6 main feature modules:

1. **AuthModule** - JWT-based authentication (passport-jwt)
   - Uses JwtStrategy for token validation
   - Guards protect routes requiring authentication
   - Environment variables: `JWT_SECRET`, `JWT_EXPIRES_IN`

2. **UserModule** - User management
   - Handles user creation, profiles, avatars
   - Users can belong to one couple via `coupleId`

3. **CoupleModule** - Relationship management
   - Invite code system for pairing (6-char uppercase UUIDs)
   - Couples limited to 2 users
   - Manages relation metadata (start date, notification time, type)

4. **QuestionModule** - Question catalog and distribution
   - Daily question assignment per couple
   - Questions categorized (GENERAL, INTIMACY, COMMUNICATION, etc.)
   - Multiple answer types (TEXT, SCALE, CHOICE, YESNO)
   - `getTodayQuestion()` creates CoupleQuestion if none exists for today

5. **AnswerModule** - User responses to questions
   - Answers linked to CoupleQuestion (many couples can answer same Question)
   - One answer per user per CoupleQuestion
   - Different value fields based on answer type

6. **MessageModule** - Real-time chat via WebSocket
   - Gateway namespace: `/messages`
   - Messages associated with CoupleQuestions
   - Socket.io for bi-directional communication

### Database Schema (Prisma + PostgreSQL)

Key relationships:
- **User** → Couple (many-to-one via `coupleId`)
- **Couple** ↔ User (one-to-many, max 2 users)
- **Question** ← CoupleQuestion → Couple (junction table for question distribution)
- **CoupleQuestion** → Answer (one-to-many, max 2 answers per couple)
- **CoupleQuestion** → Message (one-to-many for discussion)

**Important**: CoupleQuestion is the pivot - it represents a specific question sent to a specific couple at a specific time. All answers and messages reference CoupleQuestion, not Question directly.

### API Structure

- Global prefix: `/api`
- Swagger docs at: `/api/docs`
- All routes use ValidationPipe for DTO validation
- JWT Bearer authentication via `@nestjs/passport`

### Authentication Flow

1. User registers/logs in via AuthController
2. JwtStrategy validates tokens using `JWT_SECRET`
3. Protected routes use `@UseGuards(JwtGuard)`
4. `@CurrentUser()` decorator extracts user from JWT payload

### Common Patterns

**Service Layer**: All business logic lives in services, injected with `PrismaService`
- Controllers are thin, delegating to services
- Services handle validation, database queries, and error throwing

**DTOs**: Input validation using class-validator decorators
- Create/Update DTOs per module
- Swagger decorators for API documentation

**Error Handling**: Services throw HTTP exceptions
- `NotFoundException` - Resource not found
- `ConflictException` - Business rule violations (e.g., user already in couple)

**Database Queries**: Always include relations needed for response
- Use Prisma `include` to fetch related data
- Use `select` to limit exposed user fields (never return passwords)

## Important Implementation Details

### Couple Creation & Joining

**Creating a couple**:
- Generates unique 6-character invite code
- User must not already be in a couple
- Automatically connects creating user to couple

**Joining a couple**:
- If user is in a single-user couple, delete it first
- If user is in a 2-person couple, reject with conflict error
- Couple must have fewer than 2 users

**Leaving a couple**:
- If last user in couple, delete the couple
- Otherwise, just disconnect user

### Daily Question Logic (QuestionService.getTodayQuestion)

1. Check if couple has a question for today (using date range)
2. If not, find next unused question (by ID order) where `isActive = true`
3. Create CoupleQuestion record
4. Return question with answer status flags

This ensures each couple gets one new question per day, cycling through available questions.

### WebSocket Implementation

MessageGateway uses Socket.io with `/messages` namespace:
- Clients connect to `ws://host/messages`
- Use `@SubscribeMessage('message')` for event handlers
- Emit events via `this.server.emit()` to broadcast

## Docker Deployment

Multi-stage build:
1. **Builder stage**: Install deps, build app, generate Prisma client
2. **Runtime stage**: Copy built artifacts, production deps only
3. Runs migrations on startup: `npx prisma migrate deploy && node dist/main`
4. Exposes port 3001

## Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWT tokens
- `JWT_EXPIRES_IN` - Token expiration (e.g., "7d", "24h")
- `PORT` - Optional, defaults to 3001

## Testing Conventions

- Unit tests use Jest with ts-jest
- Test files: `*.spec.ts` in `src/` directory
- E2E tests in `test/` directory
- Mock PrismaService for unit tests
