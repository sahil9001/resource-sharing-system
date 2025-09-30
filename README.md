# Resource Sharing System

A comprehensive resource sharing system with access control that allows resources to be shared with individual users, groups of users, or everyone in the system. Built with Express.js, Serverless Framework, DynamoDB, and ElectroDB.

## Features

- **User Management**: Create, read, update, and delete users
- **Group Management**: Create groups and manage user memberships
- **Resource Management**: Create and manage resources with ownership
- **Access Control**: Share resources with users, groups, or globally
- **Efficient Queries**: Optimized access checks with proper overlap handling
- **Reporting**: Aggregation endpoints for analytics
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Serverless Ready**: Deploy to AWS Lambda with Serverless Framework

## Architecture

### Database Schema

The system uses DynamoDB with ElectroDB ORM and includes the following entities:

- **Users**: User accounts with email and name
- **Groups**: Collections of users with many-to-many relationships
- **Resources**: Shareable items with ownership and global sharing flags
- **Resource Sharing**: Access control rules for users, groups, and global access

### Key Design Features

- **Global Sharing Logic**: Avoids double-counting users who have access through multiple paths
- **Efficient Access Queries**: Optimized for performance in common access-check scenarios
- **Overlap Handling**: Properly handles users with both direct and group-based access
- **Scalable Architecture**: Serverless design for automatic scaling

## API Endpoints

### Core Requirements

- `GET /resource/:id/access-list` - Get all users who have access to a resource
- `GET /user/:id/resources` - Get all resources a user has access to

### Additional Endpoints

- `GET /resources/with-user-count` - Get resources with user counts (reporting)
- `GET /users/with-resource-count` - Get users with resource counts (reporting)
- `POST /resource/:id/share` - Share a resource with users/groups/globally
- `DELETE /resource/:id/unshare` - Remove sharing access

### Management Endpoints

- User CRUD operations (`/users`)
- Group CRUD operations (`/groups`)
- Resource CRUD operations (`/resources`)
- User-group membership management

## Quick Start

### Prerequisites

- Node.js 18+
- AWS CLI configured (for deployment)
- DynamoDB access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resource-sharing-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your AWS credentials and configuration
```

### Local Development

1. Start the development server:
```bash
npm run dev
```

2. Access the API documentation:
```
http://localhost:3000/api-docs
```

3. Set up sample data:
```bash
node -e "require('./src/utils/setup').setupSampleData()"
```

4. Test the endpoints:
```bash
node -e "require('./src/utils/testEndpoints').testEndpoints()"
```

### Serverless Deployment

1. Deploy to AWS:
```bash
npm run deploy
```

2. Run offline for testing:
```bash
npm run offline
```

## Testing

The system includes comprehensive test scenarios:

### Sample Data
- 5 users (Alice, Bob, Charlie, Diana, Eve)
- 4 groups (Developers, Designers, Managers, QA)
- 5 resources (1 global, 4 specific)
- Multiple sharing rules demonstrating different access patterns

### Test Scenarios
1. **Direct User Access**: Resources shared directly with specific users
2. **Group Access**: Resources shared with groups, accessible to all group members
3. **Global Access**: Resources shared with everyone in the system
4. **Overlapping Access**: Users with access through multiple paths (direct + group)
5. **Reporting**: Aggregation queries for analytics

### Running Tests

```bash
# Test all endpoints
node -e "require('./src/utils/testEndpoints').testEndpoints()"

# Test access control scenarios
node -e "require('./src/utils/testEndpoints').testAccessControlScenarios()"
```

## API Documentation

The complete API documentation is available at `/api-docs` when running the server. It includes:

- Interactive Swagger UI
- Request/response schemas
- Example payloads
- Error handling documentation

## Key Implementation Details

### Access Control Logic

1. **Global Resources**: If a resource is marked as global (`isGlobal: true`), all users have access
2. **Direct Shares**: Resources shared directly with specific users
3. **Group Shares**: Resources shared with groups, accessible to all group members
4. **Overlap Handling**: Users are not double-counted when they have access through multiple paths

### Efficient Queries

- Uses ElectroDB's query capabilities for optimal DynamoDB access patterns
- Implements proper indexing for common access patterns
- Handles large datasets efficiently with pagination support

### Error Handling

- Comprehensive error handling with meaningful error messages
- Proper HTTP status codes
- Validation for all input parameters

## Future Improvements

If given more time, the following improvements would be implemented:

1. **Authentication & Authorization**: JWT-based authentication and role-based access control
2. **Audit Logging**: Track all access and sharing activities
3. **Caching**: Redis caching for frequently accessed data
4. **Rate Limiting**: API rate limiting and throttling
5. **Advanced Permissions**: Granular permissions (read, write, admin)
6. **Bulk Operations**: Bulk sharing and unsharing operations
7. **Search & Filtering**: Advanced search capabilities for resources and users
8. **Notifications**: Email/SMS notifications for sharing activities
9. **Data Validation**: Enhanced input validation and sanitization
10. **Performance Monitoring**: CloudWatch metrics and performance monitoring

## Project Structure

```
src/
├── models/           # ElectroDB models and database configuration
├── routes/           # Express.js route handlers
├── services/         # Business logic and access control
├── utils/            # Utility functions and setup scripts
├── middleware/       # Express middleware
├── app.js           # Express application setup
├── handler.js       # Serverless handler
└── index.js         # Local development server
```

## License

MIT License - see LICENSE file for details.
