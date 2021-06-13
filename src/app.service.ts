import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as packageJson from '../package.json';

@Injectable()
export class AppService {
  getHostName(): string {
    return `Host Name is ${os.hostname()} for v (${packageJson.version}) ***.`;
  }
}
