import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, data: { name?: string; phone?: string }) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          phone: data.phone,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
          cityId: true,
        }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Phone number is already in use');
      }
      throw e;
    }
  }

  async changePassword(userId: string, data: { currentPassword?: string; newPassword?: string }) {
    if (!data.currentPassword || !data.newPassword) {
      throw new BadRequestException('Current and new password are required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid current password');

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true };
  }
}
