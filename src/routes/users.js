const express = require('express');
const router = express.Router();
const { User, UserGroup } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - userId
 *         - email
 *         - name
 *       properties:
 *         userId:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         name:
 *           type: string
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.scan.go();
    res.json(users.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, email, name } = req.body;

    if (!userId || !email || !name) {
      return res.status(400).json({ 
        error: 'userId, email, and name are required' 
      });
    }

    const user = await User.create({
      userId,
      email,
      name
    }).go();

    res.status(201).json(user.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a specific user
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
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a user
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.get({ userId: id }).go();
    
    if (!user.data) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    const user = await User.update({ userId: id })
      .set({ 
        ...(email && { email }),
        ...(name && { name }),
        updatedAt: new Date().toISOString()
      })
      .go();

    if (!user.data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.delete({ userId: id }).go();
    
    if (!result.data) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{id}/groups:
 *   get:
 *     summary: Get groups a user belongs to
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
 *         description: List of groups the user belongs to
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   groupId:
 *                     type: string
 *                   joinedAt:
 *                     type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Add user to a group
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *             properties:
 *               groupId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User added to group successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User or group not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/groups', async (req, res) => {
  try {
    const { id } = req.params;
    const userGroups = await UserGroup.query.primary({ userId: id }).go();
    res.json(userGroups.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/groups', async (req, res) => {
  try {
    const { id } = req.params;
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ error: 'groupId is required' });
    }

    // Check if user exists
    const user = await User.get({ userId: id }).go();
    if (!user.data) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userGroup = await UserGroup.create({
      userId: id,
      groupId
    }).go();

    res.status(201).json(userGroup.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /users/{userId}/groups/{groupId}:
 *   delete:
 *     summary: Remove user from a group
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: User removed from group successfully
 *       404:
 *         description: User-group relationship not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:userId/groups/:groupId', async (req, res) => {
  try {
    const { userId, groupId } = req.params;
    const result = await UserGroup.delete({ userId, groupId }).go();
    
    if (!result.data) {
      return res.status(404).json({ error: 'User-group relationship not found' });
    }
    
    res.json({ message: 'User removed from group successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
