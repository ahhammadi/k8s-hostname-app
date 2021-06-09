import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class AppService {
  getHostName(): string {
    return `Host Name is ${os.hostname()} for v (1.6.0).`;
  }
}
