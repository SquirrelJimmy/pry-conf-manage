import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.configItem.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async upsert(key: string, value: string) {
    return this.prisma.configItem.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}

