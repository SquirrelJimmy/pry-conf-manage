import { Module } from '@nestjs/common';
import { ConfigItemsController } from './config-items.controller';
import { ConfigItemsService } from './config-items.service';

@Module({
  controllers: [ConfigItemsController],
  providers: [ConfigItemsService],
})
export class ConfigItemsModule {}

