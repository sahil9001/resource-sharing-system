const { User, Group, UserGroup, Resource, ResourceSharing } = require('../models');

class AccessService {
  /**
   * Get all users who have access to a specific resource
   * Handles direct shares, group shares, and global shares
   */
  async getResourceAccessList(resourceId) {
    try {
      // Check if resource exists
      const resource = await Resource.get({ resourceId }).go();
      if (!resource.data) {
        throw new Error('Resource not found');
      }

      const accessList = new Set();
      const accessDetails = [];

      // If resource is globally shared, get all users
      if (resource.data.isGlobal) {
        const allUsers = await User.scan.go();
        allUsers.data.forEach(user => {
          accessList.add(user.userId);
          accessDetails.push({
            userId: user.userId,
            accessType: 'global',
            user: user
          });
        });
        return {
          resourceId,
          accessType: 'global',
          totalUsers: accessList.size,
          users: accessDetails
        };
      }

      // Get all sharing rules for this resource
      const sharingRules = await ResourceSharing.query
        .primary({ resourceId })
        .go();

      // Process each sharing rule
      for (const rule of sharingRules.data) {
        if (rule.shareType === 'user') {
          // Direct user share
          const user = await User.get({ userId: rule.targetId }).go();
          if (user.data) {
            accessList.add(rule.targetId);
            accessDetails.push({
              userId: rule.targetId,
              accessType: 'direct',
              user: user.data,
              sharedBy: rule.sharedBy,
              sharedAt: rule.sharedAt,
              permissions: rule.permissions
            });
          }
        } else if (rule.shareType === 'group') {
          // Group share - get all users in the group
          const groupMembers = await UserGroup.query
            .byGroup({ groupId: rule.targetId })
            .go();

          for (const member of groupMembers.data) {
            if (!accessList.has(member.userId)) {
              const user = await User.get({ userId: member.userId }).go();
              if (user.data) {
                accessList.add(member.userId);
                accessDetails.push({
                  userId: member.userId,
                  accessType: 'group',
                  groupId: rule.targetId,
                  user: user.data,
                  sharedBy: rule.sharedBy,
                  sharedAt: rule.sharedAt,
                  permissions: rule.permissions
                });
              }
            }
          }
        }
      }

      return {
        resourceId,
        accessType: 'specific',
        totalUsers: accessList.size,
        users: accessDetails
      };
    } catch (error) {
      throw new Error(`Failed to get resource access list: ${error.message}`);
    }
  }

  /**
   * Get all resources a user has access to
   * Handles direct shares, group shares, and global shares
   */
  async getUserResources(userId) {
    try {
      // Check if user exists
      const user = await User.get({ userId }).go();
      if (!user.data) {
        throw new Error('User not found');
      }

      const resourceIds = new Set();
      const resources = [];

      // Get user's groups
      const userGroups = await UserGroup.query
        .primary({ userId })
        .go();

      const groupIds = userGroups.data.map(ug => ug.groupId);

      // Get all sharing rules where user is directly targeted
      const directShares = await ResourceSharing.query
        .byTarget({ targetId: userId })
        .go();

      // Get all sharing rules where user's groups are targeted
      const groupShares = [];
      for (const groupId of groupIds) {
        const shares = await ResourceSharing.query
          .byTarget({ targetId: groupId })
          .go();
        groupShares.push(...shares.data);
      }

      // Get all global resources
      const globalResources = await Resource.query
        .globalResources({ isGlobal: true })
        .go();

      // Process direct shares
      for (const share of directShares.data) {
        if (!resourceIds.has(share.resourceId)) {
          const resource = await Resource.get({ resourceId: share.resourceId }).go();
          if (resource.data) {
            resourceIds.add(share.resourceId);
            resources.push({
              resource: resource.data,
              accessType: 'direct',
              sharedBy: share.sharedBy,
              sharedAt: share.sharedAt,
              permissions: share.permissions
            });
          }
        }
      }

      // Process group shares
      for (const share of groupShares) {
        if (!resourceIds.has(share.resourceId)) {
          const resource = await Resource.get({ resourceId: share.resourceId }).go();
          if (resource.data) {
            resourceIds.add(share.resourceId);
            resources.push({
              resource: resource.data,
              accessType: 'group',
              groupId: share.targetId,
              sharedBy: share.sharedBy,
              sharedAt: share.sharedAt,
              permissions: share.permissions
            });
          }
        }
      }

      // Process global resources
      for (const resource of globalResources.data) {
        if (!resourceIds.has(resource.resourceId)) {
          resourceIds.add(resource.resourceId);
          resources.push({
            resource: resource,
            accessType: 'global',
            permissions: ['read']
          });
        }
      }

      return {
        userId,
        totalResources: resourceIds.size,
        resources: resources
      };
    } catch (error) {
      throw new Error(`Failed to get user resources: ${error.message}`);
    }
  }

  /**
   * Get resources with user count (reporting)
   */
  async getResourcesWithUserCount() {
    try {
      const allResources = await Resource.scan.go();
      const results = [];

      for (const resource of allResources.data) {
        const accessList = await this.getResourceAccessList(resource.resourceId);
        results.push({
          resource: resource,
          userCount: accessList.totalUsers,
          accessType: accessList.accessType
        });
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to get resources with user count: ${error.message}`);
    }
  }

  /**
   * Get users with resource count (reporting)
   */
  async getUsersWithResourceCount() {
    try {
      const allUsers = await User.scan.go();
      const results = [];

      for (const user of allUsers.data) {
        const userResources = await this.getUserResources(user.userId);
        results.push({
          user: user,
          resourceCount: userResources.totalResources
        });
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to get users with resource count: ${error.message}`);
    }
  }

  /**
   * Share a resource with a user, group, or globally
   */
  async shareResource(resourceId, shareType, targetId, sharedBy, permissions = ['read']) {
    try {
      // Validate resource exists
      const resource = await Resource.get({ resourceId }).go();
      if (!resource.data) {
        throw new Error('Resource not found');
      }

      // Validate target exists based on share type
      if (shareType === 'user') {
        const user = await User.get({ userId: targetId }).go();
        if (!user.data) {
          throw new Error('Target user not found');
        }
      } else if (shareType === 'group') {
        const group = await Group.get({ groupId: targetId }).go();
        if (!group.data) {
          throw new Error('Target group not found');
        }
      } else if (shareType === 'global') {
        targetId = 'global';
        // Update resource to be global
        await Resource.update({ resourceId })
          .set({ isGlobal: true, updatedAt: new Date().toISOString() })
          .go();
      }

      // Create sharing rule
      const sharingRule = await ResourceSharing.create({
        resourceId,
        shareType,
        targetId,
        sharedBy,
        permissions
      }).go();

      return sharingRule.data;
    } catch (error) {
      throw new Error(`Failed to share resource: ${error.message}`);
    }
  }

  /**
   * Remove sharing access
   */
  async unshareResource(resourceId, shareType, targetId) {
    try {
      const result = await ResourceSharing.delete({
        resourceId,
        shareType,
        targetId
      }).go();

      // If this was a global share, update the resource
      if (shareType === 'global') {
        await Resource.update({ resourceId })
          .set({ isGlobal: false, updatedAt: new Date().toISOString() })
          .go();
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to unshare resource: ${error.message}`);
    }
  }
}

module.exports = new AccessService();
