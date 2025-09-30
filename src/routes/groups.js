const express = require('express');
const router = express.Router();
const { Group, UserGroup } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         groupId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     CreateGroupRequest:
 *       type: object
 *       required:
 *         - groupId
 *         - name
 *       properties:
 *         groupId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     UpdateGroupRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     responses:
 *       200:
 *         description: List of all groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGroupRequest'
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const groups = await Group.scan.go();
    res.json(groups.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { groupId, name, description } = req.body;

    if (!groupId || !name) {
      return res.status(400).json({ 
        error: 'groupId and name are required' 
      });
    }

    const group = await Group.create({
      groupId,
      name,
      description
    }).go();

    res.status(201).json(group.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Get a specific group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGroupRequest'
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.get({ groupId: id }).go();
    
    if (!group.data) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const group = await Group.update({ groupId: id })
      .set({ 
        ...(name && { name }),
        ...(description && { description }),
        updatedAt: new Date().toISOString()
      })
      .go();

    if (!group.data) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Group.delete({ groupId: id }).go();
    
    if (!result.data) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /groups/{id}/members:
 *   get:
 *     summary: Get all members of a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: List of group members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   joinedAt:
 *                     type: string
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if group exists
    const group = await Group.get({ groupId: id }).go();
    if (!group.data) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const members = await UserGroup.query.byGroup({ groupId: id }).go();
    res.json(members.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
