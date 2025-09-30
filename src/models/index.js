const AWS = require('aws-sdk');
const { Entity } = require('electrodb');

// Initialize DynamoDB client
const client = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT, // For local development
});

// Users Entity
const User = new Entity({
  model: {
    entity: 'user',
    version: '1',
    service: 'resource-sharing',
  },
  attributes: {
    userId: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    createdAt: {
      type: 'string',
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: 'string',
      default: () => new Date().toISOString(),
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['userId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    byEmail: {
      index: 'gsi1',
      pk: {
        field: 'gsi1pk',
        composite: ['email'],
      },
      sk: {
        field: 'gsi1sk',
        composite: [],
      },
    },
  },
}, { client, table: process.env.DYNAMODB_TABLE_PREFIX + '-users' });

// Groups Entity
const Group = new Entity({
  model: {
    entity: 'group',
    version: '1',
    service: 'resource-sharing',
  },
  attributes: {
    groupId: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: 'string',
      default: () => new Date().toISOString(),
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['groupId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
  },
}, { client, table: process.env.DYNAMODB_TABLE_PREFIX + '-groups' });

// User-Group Membership Entity
const UserGroup = new Entity({
  model: {
    entity: 'user-group',
    version: '1',
    service: 'resource-sharing',
  },
  attributes: {
    userId: {
      type: 'string',
      required: true,
    },
    groupId: {
      type: 'string',
      required: true,
    },
    joinedAt: {
      type: 'string',
      default: () => new Date().toISOString(),
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['userId'],
      },
      sk: {
        field: 'sk',
        composite: ['groupId'],
      },
    },
    byGroup: {
      index: 'gsi1',
      pk: {
        field: 'gsi1pk',
        composite: ['groupId'],
      },
      sk: {
        field: 'gsi1sk',
        composite: ['userId'],
      },
    },
  },
}, { client, table: process.env.DYNAMODB_TABLE_PREFIX + '-users' });

// Resources Entity
const Resource = new Entity({
  model: {
    entity: 'resource',
    version: '1',
    service: 'resource-sharing',
  },
  attributes: {
    resourceId: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
    },
    type: {
      type: 'string',
      required: true,
    },
    ownerId: {
      type: 'string',
      required: true,
    },
    isGlobal: {
      type: 'boolean',
      default: false,
    },
    createdAt: {
      type: 'string',
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: 'string',
      default: () => new Date().toISOString(),
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['resourceId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    byOwner: {
      index: 'gsi1',
      pk: {
        field: 'gsi1pk',
        composite: ['ownerId'],
      },
      sk: {
        field: 'gsi1sk',
        composite: ['createdAt'],
      },
    },
    globalResources: {
      index: 'gsi2',
      pk: {
        field: 'gsi2pk',
        composite: ['isGlobal'],
      },
      sk: {
        field: 'gsi2sk',
        composite: ['createdAt'],
      },
    },
  },
}, { client, table: process.env.DYNAMODB_TABLE_PREFIX + '-resources' });

// Resource Sharing Entity
const ResourceSharing = new Entity({
  model: {
    entity: 'resource-sharing',
    version: '1',
    service: 'resource-sharing',
  },
  attributes: {
    resourceId: {
      type: 'string',
      required: true,
    },
    shareType: {
      type: ['user', 'group', 'global'],
      required: true,
    },
    targetId: {
      type: 'string',
      // For user shares: userId
      // For group shares: groupId
      // For global shares: 'global'
    },
    sharedBy: {
      type: 'string',
      required: true,
    },
    sharedAt: {
      type: 'string',
      default: () => new Date().toISOString(),
    },
    permissions: {
      type: 'list',
      items: {
        type: 'string',
      },
      default: ['read'],
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['resourceId'],
      },
      sk: {
        field: 'sk',
        composite: ['shareType', 'targetId'],
      },
    },
    byTarget: {
      index: 'gsi1',
      pk: {
        field: 'gsi1pk',
        composite: ['targetId'],
      },
      sk: {
        field: 'gsi1sk',
        composite: ['resourceId'],
      },
    },
    byShareType: {
      index: 'gsi2',
      pk: {
        field: 'gsi2pk',
        composite: ['shareType'],
      },
      sk: {
        field: 'gsi2sk',
        composite: ['resourceId'],
      },
    },
  },
}, { client, table: process.env.DYNAMODB_TABLE_PREFIX + '-sharing' });

module.exports = {
  User,
  Group,
  UserGroup,
  Resource,
  ResourceSharing,
  client,
};
