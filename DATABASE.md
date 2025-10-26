# Global Secondary Indexes (GSIs) in Resource Sharing System

## Overview
This document outlines all Global Secondary Indexes defined in the DynamoDB tables for the resource sharing system. GSIs enable efficient query patterns beyond the primary key access patterns.

## Table: Users (`{prefix}-users`)

### GSI1: `byEmail`
- **Purpose**: Lookup users by email address
- **Partition Key**: `gsi1pk` → `email`
- **Sort Key**: `gsi1sk` → (empty)
- **Usage**: Authentication and user lookup by email
- **Status**: ⚠️ Defined but not currently used in code

```javascript
byEmail: {
  index: 'gsi1',
  pk: { field: 'gsi1pk', composite: ['email'] },
  sk: { field: 'gsi1sk', composite: [] }
}
```

## Table: Groups (`{prefix}-groups`)

### No GSIs
- **Reason**: Simple table with only primary key access patterns
- **Primary Key**: `pk` → `groupId`, `sk` → (empty)

## Table: UserGroup Memberships (`{prefix}-users`)

### GSI1: `byGroup`
- **Purpose**: Find all users in a specific group
- **Partition Key**: `gsi1pk` → `groupId`
- **Sort Key**: `gsi1sk` → `userId`
- **Usage**: Group membership queries, resource sharing with groups
- **Status**: ✅ Actively used

```javascript
byGroup: {
  index: 'gsi1',
  pk: { field: 'gsi1pk', composite: ['groupId'] },
  sk: { field: 'gsi1sk', composite: ['userId'] }
}
```

**Used in:**
- `src/routes/groups.js` - Get group members
- `src/services/accessService.js` - Group-based resource access

## Table: Resources (`{prefix}-resources`)

### GSI1: `byOwner`
- **Purpose**: Find all resources owned by a specific user
- **Partition Key**: `gsi1pk` → `ownerId`
- **Sort Key**: `gsi1sk` → `createdAt`
- **Usage**: Owner-based resource queries, chronological ordering
- **Status**: ✅ Actively used

```javascript
byOwner: {
  index: 'gsi1',
  pk: { field: 'gsi1pk', composite: ['ownerId'] },
  sk: { field: 'gsi1sk', composite: ['createdAt'] }
}
```

**Used in:**
- `src/routes/resources-management.js` - Get resources by owner

### GSI2: `globalResources`
- **Purpose**: Find all globally shared resources
- **Partition Key**: `gsi2pk` → `isGlobal`
- **Sort Key**: `gsi2sk` → `createdAt`
- **Usage**: Global resource access queries
- **Status**: ✅ Actively used

```javascript
globalResources: {
  index: 'gsi2',
  pk: { field: 'gsi2pk', composite: ['isGlobal'] },
  sk: { field: 'gsi2sk', composite: ['createdAt'] }
}
```

**Used in:**
- `src/services/accessService.js` - Get global resources for user access

## Table: Resource Sharing (`{prefix}-sharing`)

### GSI1: `byTarget`
- **Purpose**: Find all resources shared with a specific user or group
- **Partition Key**: `gsi1pk` → `targetId`
- **Sort Key**: `gsi1sk` → `resourceId`
- **Usage**: User/group access queries, "what resources does this user have access to?"
- **Status**: ✅ Actively used

```javascript
byTarget: {
  index: 'gsi1',
  pk: { field: 'gsi1pk', composite: ['targetId'] },
  sk: { field: 'gsi1sk', composite: ['resourceId'] }
}
```

**Used in:**
- `src/services/accessService.js` - Direct user shares and group shares

### GSI2: `byShareType`
- **Purpose**: Find all sharing rules by type (user, group, global)
- **Partition Key**: `gsi2pk` → `shareType`
- **Sort Key**: `gsi2sk` → `resourceId`
- **Usage**: Analytics and reporting by share type
- **Status**: ⚠️ Defined but not currently used in code

```javascript
byShareType: {
  index: 'gsi2',
  pk: { field: 'gsi2pk', composite: ['shareType'] },
  sk: { field: 'gsi2sk', composite: ['resourceId'] }
}
```

## Summary

### Actively Used GSIs (4)
1. **UserGroup.byGroup** - Group membership queries
2. **Resource.byOwner** - Owner-based resource queries
3. **Resource.globalResources** - Global resource access
4. **ResourceSharing.byTarget** - User/group access queries

### Defined but Unused GSIs (2)
1. **User.byEmail** - Planned for authentication
2. **ResourceSharing.byShareType** - Planned for analytics

### Performance Benefits
- **Eliminates Table Scans**: All queries use efficient key-based access
- **Optimized Access Patterns**: GSIs match actual application query patterns
- **Scalable Performance**: Consistent query performance as data grows
- **Cost Effective**: Reduces DynamoDB read capacity consumption

### Query Patterns Enabled
- Find users by email (authentication)
- Find group members (group management)
- Find resources by owner (resource management)
- Find global resources (access control)
- Find resources shared with user/group (access control)
- Analyze sharing patterns by type (reporting)