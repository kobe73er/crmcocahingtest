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

  @Get("/all3")
  getAllProducts3(): string {
    return "all3";
  }

  @Get("/all4")
  getAllProducts4(): string {
    return "all4";
  }

  @Get("/all5")
  getAllProducts5(): string {
    return "all5";
  }

  @Get("/all6")
  getAllProducts6(): string {
    return "all6";
  }
}
