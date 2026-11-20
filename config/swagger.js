const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'APISmog Express API',
      version: '1.0.0',
      description: 'API documentation for APISmog project with Try it Out capability.',
    },
    servers: [
      {
        url: '/',
        description: 'Current Server (auto-match browser URL)',
      },
      ...(process.env.API_URL
        ? [{ url: process.env.API_URL, description: 'Production / Configured API Server' }]
        : []),
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server (npm start / dev)',
      },
      {
        url: 'http://localhost:3006',
        description: 'Local Docker Server (docker-compose)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
