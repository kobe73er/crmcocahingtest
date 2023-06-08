import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller("/pm")
export class ProductManageController {
  constructor(private readonly appService: AppService) {}

  @Get("/product/all")
  getAllProducts(): string {
    return this.appService.getAllProducts();
  }
}
