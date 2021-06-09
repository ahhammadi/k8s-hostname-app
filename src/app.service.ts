import { Injectable } from '@nestjs/common';
import * as os from 'os';
var pjson = require('./package.json');

@Injectable()
export class AppService {
  getHostName(): string {
    return `Host Name is ${os.hostname()} for v (${pjson.version}).`;
  }
}
