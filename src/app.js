const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Import routes
const resourceRoutes = require('./routes/resources');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const resourceManagementRoutes = require('./routes/resources-management');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Resource Sharing System API',
      version: '1.0.0',
      description: 'A resource sharing system with access control for users, groups, and global sharing',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.STAGE === 'prod' 
          ? 'https://your-api-gateway-url.amazonaws.com/prod'
          : 'http://localhost:3000',
        description: process.env.STAGE === 'prod' ? 'Production server' : 'Development server'
      }
    ],
    tags: [
      {
        name: 'Users',
        description: 'User management operations'
      },
      {
        name: 'Groups',
        description: 'Group management operations'
      },
      {
        name: 'Resources',
        description: 'Resource sharing and access operations'
      },
      {
        name: 'Reporting',
        description: 'Reporting and analytics operations'
      }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Resource Sharing System API'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'resource-sharing-system'
  });
});

// API routes
app.use('/resource', resourceRoutes);
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/resources', resourceManagementRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Resource Sharing System API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;
