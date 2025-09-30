const { User, Group, UserGroup, Resource, ResourceSharing } = require('../models');

/**
 * Setup script to create sample data for testing
 */
async function setupSampleData() {
  try {
    console.log('Setting up sample data...');

    // Create sample users
    const users = [
      { userId: 'user1', email: 'alice@example.com', name: 'Alice Johnson' },
      { userId: 'user2', email: 'bob@example.com', name: 'Bob Smith' },
      { userId: 'user3', email: 'charlie@example.com', name: 'Charlie Brown' },
      { userId: 'user4', email: 'diana@example.com', name: 'Diana Prince' },
      { userId: 'user5', email: 'eve@example.com', name: 'Eve Wilson' }
    ];

    console.log('Creating users...');
    for (const userData of users) {
      try {
        await User.create(userData).go();
        console.log(`Created user: ${userData.name}`);
      } catch (error) {
        console.log(`User ${userData.userId} might already exist`);
      }
    }

    // Create sample groups
    const groups = [
      { groupId: 'group1', name: 'Developers', description: 'Software development team' },
      { groupId: 'group2', name: 'Designers', description: 'UI/UX design team' },
      { groupId: 'group3', name: 'Managers', description: 'Management team' },
      { groupId: 'group4', name: 'QA', description: 'Quality assurance team' }
    ];

    console.log('Creating groups...');
    for (const groupData of groups) {
      try {
        await Group.create(groupData).go();
        console.log(`Created group: ${groupData.name}`);
      } catch (error) {
        console.log(`Group ${groupData.groupId} might already exist`);
      }
    }

    // Create user-group memberships
    const memberships = [
      { userId: 'user1', groupId: 'group1' }, // Alice in Developers
      { userId: 'user2', groupId: 'group1' }, // Bob in Developers
      { userId: 'user3', groupId: 'group2' }, // Charlie in Designers
      { userId: 'user4', groupId: 'group2' }, // Diana in Designers
      { userId: 'user4', groupId: 'group3' }, // Diana also in Managers
      { userId: 'user5', groupId: 'group4' }, // Eve in QA
    ];

    console.log('Creating user-group memberships...');
    for (const membership of memberships) {
      try {
        await UserGroup.create(membership).go();
        console.log(`Added ${membership.userId} to ${membership.groupId}`);
      } catch (error) {
        console.log(`Membership might already exist`);
      }
    }

    // Create sample resources
    const resources = [
      {
        resourceId: 'resource1',
        name: 'Project Alpha Documentation',
        description: 'Technical documentation for Project Alpha',
        type: 'document',
        ownerId: 'user1',
        isGlobal: false
      },
      {
        resourceId: 'resource2',
        name: 'Design System Guidelines',
        description: 'UI/UX design system and guidelines',
        type: 'document',
        ownerId: 'user3',
        isGlobal: false
      },
      {
        resourceId: 'resource3',
        name: 'Company Handbook',
        description: 'Company policies and procedures',
        type: 'document',
        ownerId: 'user4',
        isGlobal: true
      },
      {
        resourceId: 'resource4',
        name: 'API Documentation',
        description: 'REST API documentation',
        type: 'document',
        ownerId: 'user2',
        isGlobal: false
      },
      {
        resourceId: 'resource5',
        name: 'Test Cases Repository',
        description: 'Automated test cases and scripts',
        type: 'repository',
        ownerId: 'user5',
        isGlobal: false
      }
    ];

    console.log('Creating resources...');
    for (const resourceData of resources) {
      try {
        await Resource.create(resourceData).go();
        console.log(`Created resource: ${resourceData.name}`);
      } catch (error) {
        console.log(`Resource ${resourceData.resourceId} might already exist`);
      }
    }

    // Create resource sharing rules
    const sharingRules = [
      // Resource 1: Shared with Developers group
      {
        resourceId: 'resource1',
        shareType: 'group',
        targetId: 'group1',
        sharedBy: 'user1',
        permissions: ['read']
      },
      // Resource 2: Shared with Designers group
      {
        resourceId: 'resource2',
        shareType: 'group',
        targetId: 'group2',
        sharedBy: 'user3',
        permissions: ['read', 'write']
      },
      // Resource 4: Shared with specific users
      {
        resourceId: 'resource4',
        shareType: 'user',
        targetId: 'user1',
        sharedBy: 'user2',
        permissions: ['read']
      },
      {
        resourceId: 'resource4',
        shareType: 'user',
        targetId: 'user3',
        sharedBy: 'user2',
        permissions: ['read']
      },
      // Resource 5: Shared with QA group
      {
        resourceId: 'resource5',
        shareType: 'group',
        targetId: 'group4',
        sharedBy: 'user5',
        permissions: ['read', 'write']
      }
    ];

    console.log('Creating resource sharing rules...');
    for (const rule of sharingRules) {
      try {
        await ResourceSharing.create(rule).go();
        console.log(`Created sharing rule: ${rule.resourceId} -> ${rule.shareType}:${rule.targetId}`);
      } catch (error) {
        console.log(`Sharing rule might already exist`);
      }
    }

    console.log('\n✅ Sample data setup completed!');
    console.log('\nSample data summary:');
    console.log('- 5 users created');
    console.log('- 4 groups created');
    console.log('- 6 user-group memberships created');
    console.log('- 5 resources created (1 global, 4 specific)');
    console.log('- 5 sharing rules created');
    
    console.log('\nTest scenarios:');
    console.log('1. GET /resource/resource1/access-list - Should show Developers group members');
    console.log('2. GET /user/user1/resources - Should show resources Alice has access to');
    console.log('3. GET /resource/resource3/access-list - Should show all users (global)');
    console.log('4. GET /resources/with-user-count - Should show resource counts');
    console.log('5. GET /users/with-resource-count - Should show user access counts');

  } catch (error) {
    console.error('Error setting up sample data:', error);
    throw error;
  }
}

/**
 * Clean up all sample data
 */
async function cleanupSampleData() {
  try {
    console.log('Cleaning up sample data...');

    // Delete sharing rules
    const sharingRules = await ResourceSharing.scan.go();
    for (const rule of sharingRules.data) {
      await ResourceSharing.delete({
        resourceId: rule.resourceId,
        shareType: rule.shareType,
        targetId: rule.targetId
      }).go();
    }

    // Delete resources
    const resources = await Resource.scan.go();
    for (const resource of resources.data) {
      await Resource.delete({ resourceId: resource.resourceId }).go();
    }

    // Delete user-group memberships
    const memberships = await UserGroup.scan.go();
    for (const membership of memberships.data) {
      await UserGroup.delete({
        userId: membership.userId,
        groupId: membership.groupId
      }).go();
    }

    // Delete groups
    const groups = await Group.scan.go();
    for (const group of groups.data) {
      await Group.delete({ groupId: group.groupId }).go();
    }

    // Delete users
    const users = await User.scan.go();
    for (const user of users.data) {
      await User.delete({ userId: user.userId }).go();
    }

    console.log('✅ Sample data cleanup completed!');
  } catch (error) {
    console.error('Error cleaning up sample data:', error);
    throw error;
  }
}

module.exports = {
  setupSampleData,
  cleanupSampleData
};
