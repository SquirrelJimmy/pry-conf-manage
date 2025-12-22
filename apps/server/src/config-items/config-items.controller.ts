import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ConfigItemsService } from './config-items.service';

@Controller('/config-items')
export class ConfigItemsController {
  constructor(private readonly configItemsService: ConfigItemsService) {}

  @Get()
  list() {
    return this.configItemsService.list();
  }

  @Put(':key')
  upsert(@Param('key') key: string, @Body() body: { value: string }) {
    return this.configItemsService.upsert(key, body.value);
  }
}

