# Second Brain Backend

A scalable, production-ready backend API for the Second Brain knowledge management system.

## Features

- 🚀 **Express.js** with TypeScript for type safety
- 🗄️ **MySQL** database with connection pooling
- 🔄 **Redis** for caching and session management
- 🔐 **JWT-based authentication** with refresh tokens
- 🐙 **GitHub OAuth integration**
- 📝 **Comprehensive logging** with Winston
- 🛡️ **Security middleware** (Helmet, CORS, Rate Limiting)
- ✅ **Input validation** with Joi
- 🔄 **Database migrations** system
- 📊 **Analytics tracking**
- 🏗️ **Database abstraction layer** for future DB switching

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd second-brain-backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=second_brain
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### Project Structure

```
src/
├── index.ts                 # Application entry point
├── config/                  # Configuration files
├── database/               # Database layer
│   ├── DatabaseConnection.ts
│   ├── RedisConnection.ts
│   └── migrations/         # Database migrations
├── middleware/            # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── notFoundHandler.ts
├── routes/                # API routes
│   ├── auth.ts
│   ├── user.ts
│   ├── github.ts
│   ├── notes.ts
│   ├── projects.ts
│   ├── tags.ts
│   └── analytics.ts
├── services/              # Business logic
│   └── AuthService.ts
├── utils/                 # Utility functions
│   └── logger.ts
└── types/                 # TypeScript type definitions
```

## Database Schema

The application uses a comprehensive database schema with the following main tables:

- `users` - User accounts and profiles
- `user_sessions` - Authentication sessions
- `projects` - User projects
- `github_repositories` - Connected GitHub repositories
- `notes` - Knowledge notes and documents
- `tags` - Note tags
- `github_commits` - Repository commits
- `analytics_events` - Usage analytics

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Helmet middleware

## GitHub Integration

The backend supports GitHub OAuth integration allowing users to:

- Connect their GitHub accounts
- Import repositories
- Link notes to specific commits
- Track code changes and documentation

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | `second_brain` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | - |

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm start
```

### Database Operations
```bash
# Run migrations
npm run db:migrate

# Seed database (if available)
npm run db:seed
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database and Redis
3. Set strong JWT secrets
4. Configure HTTPS
5. Set up proper logging and monitoring
6. Use a process manager like PM2

## Database Abstraction

The application uses a database abstraction layer that makes it easy to switch between different database systems in the future. The `DatabaseInterface` defines standard methods that can be implemented for different databases (PostgreSQL, MongoDB, etc.).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
