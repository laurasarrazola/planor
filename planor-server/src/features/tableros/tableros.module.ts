import { Module } from '@nestjs/common';
import { TablerosService } from './tableros.service';

@Module({
  providers: [TablerosService],
})
export class TablerosModule {}
