<div id="header" align="center">
<img src="./docs/public/strings.png" alt="Strings"/>

# Chord - RPC Framework

The revolution in the world of client-server communication. Type-safe RPC on top of [JSON-RPC v2](https://www.jsonrpc.org/specification) protocol.

<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white"></a>
<a href="https://kit.svelte.dev/"><img src="https://img.shields.io/badge/SvelteKit-191919?style=for-the-badge&logo=svelte&logoColor=FF3E00"></a>
<a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-69b74d?style=for-the-badge&logo=express&logoColor=white"></a>
<a href="https://www.jsonrpc.org/specification"><img src="https://img.shields.io/badge/JSONRPC-18181a?style=for-the-badge&logo=json&logoColor=white"></a>

</div>

## ⚙️ Installation

**Chord** is framework agnostic and can be used with any backend library. Install it freely from [npm](https://www.npmjs.com/package/chord-rpc) via your favorite package manager.

```bash
npm install chord-rpc
# or
pnpm install chord-rpc
```

**Chord** uses [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) and [reflection](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect) under the hood, to construct server and client.

So you need to configure your _tsconfig.json_ first.

**`./tsconfig.ts`**

```json5
{
  compilerOptions: {
    // Other stuff...

    target: 'ESNext',
    experimentalDecorators: true,
    emitDecoratorMetadata: true
  }
}
```

### ⚠️ Caveats

If you are using [Vite](https://vitejs.dev/) as bundler of your project, you have to note, that [ESbuild](https://esbuild.github.io/) that is used under the hood, [does not support](https://github.com/evanw/esbuild/issues/257) _emitDecoratorMetadata_ flag at the moment.

Thus, you have to use additional plugins for [Vite](https://vitejs.dev/). I personally recommend to try out [SWC](https://www.npmjs.com/package/unplugin-swc). It fixes this issue and doesn't impact on rebuilding performance.

Then add [SWC](https://www.npmjs.com/package/unplugin-swc) plugin to [Vite](https://vitejs.dev/):

**`./vite.config.ts`**

```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [sveltekit(), swc.vite()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
```

## 🛠️ Usage

The example below uses [SvelteKit](https://kit.svelte.dev/) framework, but you can try your own on any other preferred framework like [Next](https://nextjs.org/) or [Nuxt](https://nuxt.com/).

### 🧾 Make the Contract

Firstly, create a contract using TypeScript Interfaces. Also add a type _"Wrapped"_ it will be used later.

**`./src/routes/types.ts`**

```typescript
export interface IHelloRPC {
  hello(name: string): string;
}

// ⚠️ Note, the key should be the same as Implemented Class name
export type Wrapped = { HelloRPC: IHelloRPC };
```

### 📝 Implement the Class

Then implement defined interface inside your controller. In [SvelteKit](https://kit.svelte.dev/) it's [+server.ts](https://kit.svelte.dev/docs/routing#server) file.

**`./src/routes/+server.ts`**

```typescript
import { json } from '@sveltejs/kit';
import { Composer, rpc, type Composed } from 'chord-rpc'; // Main components of Chord we will use
import sveltekit from 'chord-rpc/middlewares/sveltekit'; // Middleware to process RequestEvent object
import type { IHelloRPC, Wrapped } from './types'; // Your defined types

// 1. Implement the interface we created before
export class HelloRPC implements IHelloRPC {
  @rpc() // Use decorator to register callable method
  hello(name: string): string {
    return `Hello, ${name}!`;
  }
}

// 2. Init Composer instance that will handle requests
export const composer = new Composer(
  { TestRPC, TestRPC2 },
  { route: '/test' }
) as unknown as Composed<Wrapped>;
composer.use(sveltekit()); // Use middleware to process SvelteKit RequestEvent

// 3. SvelteKit syntax to define POST endpoint
export async function POST(event) {
  // Execute request in place and return result of execution
  return json(await composer.exec(event));
}
```

What we did in this listing is defined everything we need to handle requests. The first and second steps are the same for each framework you will use, while the third is depended of it.

### 📒 Generate and send Schema

To connect backend with frontend we need to create a _Schema_ of our **rpc** methods. This is possible, using _composer.getSchema()_

In [SvelteKit](https://kit.svelte.dev/) we can define [load](https://kit.svelte.dev/docs/load) function that sends _data_ to the frontend during **SSR**. It is the most convenient way to send _Schema_

**`./src/routes/+server.ts`**

```typescript
import { composer } from './+server';

export async function load() {
  return { schema: composer.getSchema() };
}
```

### 🖼️ Use RPC on frontend

Now we are ready to call the method on frontend. As we use [SvelteKit](https://kit.svelte.dev/), we have a full power of [Svelte](https://svelte.dev/) for our UI.

**`./src/routes/+page.svelte`**

```html
<script lang="ts">
  import { initClient } from 'chord-rpc';
  import { onMount } from 'svelte';

  // Import our Contract
  import type { Wrapped } from './types';

  export let data; // Get schema from load function during SSR
  const { schema } = data;

  // Init client based on Schema.
  // Use Contract as Generic to get type safety and hints from IDE
  const rpc = initClient<Wrapped>(schema);

  let res;
  // Called after Page mount. The same as useEffect(..., [])
  onMount(async () => {
    // Call method defined on backend with type-hinting
    res = await rpc.HelloRPC.hello('world');
    console.log(res);
  });
</script>

<h1>Chord call Test</h1>
<p>Result: {res}</p>
```

## 📚 Further reading

We have finished a basic example of using **Chord**. But it's the tip of the iceberg of possibilities that framework unlocks.

---
Visit the [Documentation](https://chord.vercel.app)(Coming Soon) to dive deeper.
