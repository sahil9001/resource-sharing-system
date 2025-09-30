const express = require('express');
const router = express.Router();
const accessService = require('../services/accessService');
const { Resource, User, Group } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       properties:
 *         resourceId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         ownerId:
 *           type: string
 *         isGlobal:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     AccessDetail:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         accessType:
 *           type: string
 *           enum: [direct, group, global]
 *         user:
 *           $ref: '#/components/schemas/User'
 *         groupId:
 *           type: string
 *         sharedBy:
 *           type: string
 *         sharedAt:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *     ResourceAccessList:
 *       type: object
 *       properties:
 *         resourceId:
 *           type: string
 *         accessType:
 *           type: string
 *           enum: [specific, global]
 *         totalUsers:
 *           type: integer
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AccessDetail'
 */

/**
 * @swagger
 * /resource/{id}/access-list:
 *   get:
 *     summary: Get all users who have access to a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: List of users with access to the resource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceAccessList'
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/access-list', async (req, res) => {
  try {
    const { id } = req.params;
    const accessList = await accessService.getResourceAccessList(id);
    res.json(accessList);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /user/{id}/resources:
 *   get:
 *     summary: Get all resources a user has access to
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of resources the user has access to
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 totalResources:
 *                   type: integer
 *                 resources:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       resource:
 *                         $ref: '#/components/schemas/Resource'
 *                       accessType:
 *                         type: string
 *                         enum: [direct, group, global]
 *                       groupId:
 *                         type: string
 *                       sharedBy:
 *                         type: string
 *                       sharedAt:
 *                         type: string
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/user/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('here');
    const userResources = await accessService.getUserResources(id);
    res.json(userResources);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /resources/with-user-count:
 *   get:
 *     summary: Get all resources with user count (reporting)
 *     tags: [Reporting]
 *     responses:
 *       200:
 *         description: List of resources with user counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   resource:
 *                     $ref: '#/components/schemas/Resource'
 *                   userCount:
 *                     type: integer
 *                   accessType:
 *                     type: string
 *                     enum: [specific, global]
 *       500:
 *         description: Internal server error
 */
router.get('/resources/with-user-count', async (req, res) => {
  try {
    const resourcesWithCount = await accessService.getResourcesWithUserCount();
    res.json(resourcesWithCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/with-resource-count:
 *   get:
 *     summary: Get all users with resource count (reporting)
 *     tags: [Reporting]
 *     responses:
 *       200:
 *         description: List of users with resource counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   resourceCount:
 *                     type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/users/with-resource-count', async (req, res) => {
  try {
    const usersWithCount = await accessService.getUsersWithResourceCount();
    res.json(usersWithCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /resource/{id}/share:
 *   post:
 *     summary: Share a resource with a user, group, or globally
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shareType
 *               - targetId
 *               - sharedBy
 *             properties:
 *               shareType:
 *                 type: string
 *                 enum: [user, group, global]
 *               targetId:
 *                 type: string
 *               sharedBy:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 default: [read]
 *     responses:
 *       200:
 *         description: Resource shared successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Resource or target not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const { shareType, targetId, sharedBy, permissions } = req.body;

    if (!shareType || !targetId || !sharedBy) {
      return res.status(400).json({ 
        error: 'shareType, targetId, and sharedBy are required' 
      });
    }

    const result = await accessService.shareResource(
      id, 
      shareType, 
      targetId, 
      sharedBy, 
      permissions
    );
    res.json(result);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /resource/{id}/unshare:
 *   delete:
 *     summary: Remove sharing access for a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shareType
 *               - targetId
 *             properties:
 *               shareType:
 *                 type: string
 *                 enum: [user, group, global]
 *               targetId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource unshared successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/unshare', async (req, res) => {
  try {
    const { id } = req.params;
    const { shareType, targetId } = req.body;

    if (!shareType || !targetId) {
      return res.status(400).json({ 
        error: 'shareType and targetId are required' 
      });
    }

    const result = await accessService.unshareResource(id, shareType, targetId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
