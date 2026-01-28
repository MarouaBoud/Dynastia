import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        country: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile (country, currency)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { country, currency } = req.body;

    // Validate country (ISO 3166-1 alpha-2: 2 uppercase letters)
    if (country !== undefined) {
      if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country)) {
        res.status(400).json({ message: 'Invalid country code. Must be 2 uppercase letters (ISO 3166-1 alpha-2)' });
        return;
      }
    }

    // Validate currency (ISO 4217: 3 uppercase letters)
    if (currency !== undefined) {
      if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) {
        res.status(400).json({ message: 'Invalid currency code. Must be 3 uppercase letters (ISO 4217)' });
        return;
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(country !== undefined && { country }),
        ...(currency !== undefined && { currency }),
      },
      select: {
        id: true,
        email: true,
        country: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
