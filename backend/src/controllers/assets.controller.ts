/**
 * Assets Controller
 *
 * CRUD operations for user assets (Cash, Investments, Property, Vehicles, Other)
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const VALID_ASSET_TYPES = ['Cash', 'Investments', 'Property', 'Vehicles', 'Other'];

/**
 * Create a new asset
 * POST /api/assets
 *
 * Body: { type: string, name: string, value: number }
 */
export async function createAsset(req: Request, res: Response): Promise<void> {
  try {
    const { type, name, value } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Validate required fields
    if (!type || typeof type !== 'string') {
      res.status(400).json({ error: 'Type is required and must be a string' });
      return;
    }

    if (!VALID_ASSET_TYPES.includes(type)) {
      res.status(400).json({
        error: `Type must be one of: ${VALID_ASSET_TYPES.join(', ')}`,
      });
      return;
    }

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name is required and must be a string' });
      return;
    }

    if (value === undefined || typeof value !== 'number') {
      res.status(400).json({ error: 'Value is required and must be a number' });
      return;
    }

    // Create asset
    const asset = await prisma.asset.create({
      data: {
        type,
        name,
        value,
        userId,
      },
    });

    res.status(201).json(asset);
  } catch (error: any) {
    console.error('Create asset error:', error);
    res.status(500).json({
      error: "We couldn't save that asset. Let's try again.",
    });
  }
}

/**
 * Get all assets for current user
 * GET /api/assets
 */
export async function getAssets(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const assets = await prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(assets);
  } catch (error: any) {
    console.error('Get assets error:', error);
    res.status(500).json({
      error: "We couldn't load your assets. Let's try again.",
    });
  }
}

/**
 * Update an asset
 * PUT /api/assets/:id
 *
 * Body: { type?, name?, value? }
 */
export async function updateAsset(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { type, name, value } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify asset belongs to user
    const existing = await prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that asset. It may have been deleted." });
      return;
    }

    // Validate type if provided
    if (type !== undefined && !VALID_ASSET_TYPES.includes(type)) {
      res.status(400).json({
        error: `Type must be one of: ${VALID_ASSET_TYPES.join(', ')}`,
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (name !== undefined) updateData.name = name;
    if (value !== undefined) updateData.value = value;

    // Update asset
    const asset = await prisma.asset.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(asset);
  } catch (error: any) {
    console.error('Update asset error:', error);
    res.status(500).json({
      error: "We couldn't save your changes. Let's try again.",
    });
  }
}

/**
 * Delete an asset
 * DELETE /api/assets/:id
 */
export async function deleteAsset(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    // Verify asset belongs to user
    const existing = await prisma.asset.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: "We couldn't find that asset. It may have been deleted." });
      return;
    }

    // Delete asset
    await prisma.asset.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      error: "We couldn't delete that asset. Let's try again.",
    });
  }
}
