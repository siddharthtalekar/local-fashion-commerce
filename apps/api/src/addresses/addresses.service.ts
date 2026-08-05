import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createAddressDto: CreateAddressDto) {
    if (createAddressDto.isDefault) {
      // Unset previous defaults
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const count = await this.prisma.address.count({ where: { userId } });
    
    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        userId,
        isDefault: createAddressDto.isDefault || count === 0,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId },
    });
    if (!address) {
      throw new NotFoundException(`Address #${id} not found`);
    }
    return address;
  }

  async update(userId: string, id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.findOne(userId, id); // check if exists and belongs to user

    if (updateAddressDto.isDefault) {
      // Unset previous defaults
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: address.id },
      data: updateAddressDto,
    });
  }

  async remove(userId: string, id: string) {
    const address = await this.findOne(userId, id); // check if exists and belongs to user

    await this.prisma.address.delete({
      where: { id: address.id },
    });

    if (address.isDefault) {
      // Set another address as default if there is one
      const anotherAddress = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (anotherAddress) {
        await this.prisma.address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Address deleted successfully' };
  }
}
