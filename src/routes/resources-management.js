const express = require('express');
const router = express.Router();
const { Resource } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateResourceRequest:
 *       type: object
 *       required:
 *         - resourceId
 *         - name
 *         - type
 *         - ownerId
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
 *           default: false
 *     UpdateResourceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *         isGlobal:
 *           type: boolean
 */

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of all resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResourceRequest'
 *     responses:
 *       201:
 *         description: Resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.scan.go();
    res.json(resources.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { resourceId, name, description, type, ownerId, isGlobal } = req.body;

    if (!resourceId || !name || !type || !ownerId) {
      return res.status(400).json({ 
        error: 'resourceId, name, type, and ownerId are required' 
      });
    }

    const resource = await Resource.create({
      resourceId,
      name,
      description,
      type,
      ownerId,
      isGlobal: isGlobal || false
    }).go();

    res.status(201).json(resource.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get a specific resource
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
 *         description: Resource details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update a resource
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
 *             $ref: '#/components/schemas/UpdateResourceRequest'
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a resource
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
 *         description: Resource deleted successfully
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await Resource.get({ resourceId: id }).go();
    
    if (!resource.data) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(resource.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, isGlobal } = req.body;

    const resource = await Resource.update({ resourceId: id })
      .set({ 
        ...(name && { name }),
        ...(description && { description }),
        ...(type && { type }),
        ...(isGlobal !== undefined && { isGlobal }),
        updatedAt: new Date().toISOString()
      })
      .go();

    if (!resource.data) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Resource.delete({ resourceId: id }).go();
    
    if (!result.data) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /resources/owner/{ownerId}:
 *   get:
 *     summary: Get all resources owned by a user
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Owner ID
 *     responses:
 *       200:
 *         description: List of resources owned by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 *       500:
 *         description: Internal server error
 */
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const resources = await Resource.query.byOwner({ ownerId }).go();
    res.json(resources.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
