import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ProductManageController} from "./ProductManageController";

@Module({
  imports: [],
  controllers: [AppController, ProductManageController],
  providers: [AppService],
})
export class AppModule {}
