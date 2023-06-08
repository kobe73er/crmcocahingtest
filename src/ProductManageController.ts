import {Controller, Get, Param, Query} from '@nestjs/common';
import { AppService } from './app.service';

@Controller("product")
export class ProductManageController {
  constructor(private readonly appService: AppService) {}

  @Get("/all")
  getAllProducts(): string {
    return this.appService.getAllProducts();
  }

  @Get("/all2")
  getAllProducts2(): string {
    return "all2";
  }

}
