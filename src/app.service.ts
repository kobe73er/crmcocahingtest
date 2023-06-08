import {Injectable} from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getAllProducts(): string {
    return "All products returned!";
  }
}
