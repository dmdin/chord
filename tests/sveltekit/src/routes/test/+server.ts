import { json } from '@sveltejs/kit';
import { Composer, rpc, depends, type Composed, buildResponse } from '../../../../../src/index';
import cache  from '../../../../../src/middlewares/cache';
import sveltekit from 'chord-rpc/middlewares/sveltekit';
import type { ITestRPC, ITestRPC2, Wrapped } from './types';

// THIS IS CONTROLLER

interface Context {
  sb: unknown;
}

class TestRPC implements ITestRPC {
  @depends()
  private readonly ctx!: Context;

  @rpc()
  dbReq(param: number): string {
    // console.log('!ctx injected ', this.rpc2);
    // console.log('ctx injected ', this.ctx);
    // throw Error('Произошла ошибка!')
    return `Hello from TestRPC, ${param}`;
  }
  @rpc()
  dbReq2(param: string): string {
    return `Hello dbReq2, ${param}`;
  }
}


// function testMode() {
//   return async function h(event, ctx, next) {
//     console.log(event, ctx, )
//     return buildResponse({request: event.raw, result: 'hello!!!!'})
//   }
// }

const testCache = {
  async get(k) {throw TypeError('hh'); return "Cached hello"},
  async set(k, v, ttl) { console.log('set', k, v, ttl)}
}


class TestRPC2 implements ITestRPC2 {

  @rpc({ use: [cache(testCache)]})
  dbReq(param: number): string {
    return `Hello from TestRPC2, ${param}!`;
  }
  
  @rpc()
  dbReq3(param: string, param2: number): string {
    return `Hello from TestRPC2 dbReq3, ${param} ${param2}!`;
  }
}

export const composer = new Composer(
  { TestRPC, TestRPC2 },
  {
    route: '/test',
    // onError: async (e, body) => console.log('hello error', body)
  }
) as unknown as Composed<Wrapped>;

composer.use(sveltekit());

export async function POST(event: RequestEvent) {
  return json(await composer.exec(event));
}
