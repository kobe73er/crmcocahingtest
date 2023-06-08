import {Get, Injectable, Param} from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getAllProducts(): string {
    return "All products returned!";
  }
}
