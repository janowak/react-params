<div align="center">
  <h1>@react-params</h1>
  <p>
    Monorepo for @react-params - Opinionated url state (search params) React library
  </p>
<hr />

<a href="#rationale">Rationale</a> |
<a href="#simple-usage">Sample Usage</a> |
<a href="#installation">Installation</a> |
<a href="#setup">Setup</a> |
<a href="advanced-use-cases">Advanced use cases</a> |
<a href="#api">API</a>

</div>
<hr/>

## Rationale

There are multiple issues with native URL state management in React:
* its not strongly typed 
* managing state update is tricky (causing unnecessary re-renders)
* no unified hook api for common use cases like:
    * default values
    * prefixing
    * validation

**This library is solving those by:**

* Using Typescript for strongly typed 
* Optimizing the rendering process
    * special `useSet` method for only updating search param
    * don't re-render on every url change (compares values internally and only updates if changed)
* Using single interface across multiple frameworks (react-router-dom, remix, vanilla)
* Providing multiple utilities:
  * batching support
  * working both SSR and client side
  * parameter prefixes options
  * built in method for generating urls
  * grouping of params
  * support `replace` and `push` state methods
  * custom serialization
  * validation
  * custom setters (e.g. bool `toggle` method, or dialog `open`)

## Simple Usage

```tsx
import {create} from "@react-params/core";

const params = create({
    "user-name": f.string(),
    //number and  types are supported
    "counter": f.number().withDefault(0),
    //for object we specify type
    "address": f.object<{ a: string }>(),
    //list of strings
    "colors": f.list({separator: ",", item: f.string()}).withDefault([]),
});

const Component = () => {
    // all params are auto mapped from kebab case to camel case
    //react useState like hook result (setter supports dispatch shape: value or (prev)=> newValue)
    const [value, setValue] = params.userName.use();
    
    //useSet result in not subscribing to this param changes resulting in optimized renders
    const setAddress = params.address.useSet();

    //you can overrride default param settings in particular default value
    const [colors, setColors] = params.list.use({
        defaultValue: ["green", "red"],
        prefix: "prefix"
    });

    return <div/>
};
```

## Installation

Depending on project setup:

* vanilla react ```npm install @react-params/core```
* react-router-dom ```npm install @react-params/react-router-dom```
* remix  ```npm install @react-params/remix```
* react-router (v7) ```npm install @react-params/react-router```

## Setup

For vanilla react no additional setup is required.  
For framework adapters:

* `@react-params/react-router-dom`
* `@react-params/remix`
* `@react-params/react-router`

You **need to** wrap your app with `<ReactParamsApiProvider/>` component provided by each of package.

```tsx
import {ReactParamsApiProvider} from "@react-params/react-router-dom";

const App = () => {
    return (
        <ReactParamsApiProvider>
          <div />
        </ReactParamsApiProvider>
    )
}
```

Checkout those sandboxes for fully working examples:

* [vanilla react](https://codesandbox.io/p/sandbox/xl8z6m)
* [react-router-dom](https://codesandbox.io/p/sandbox/qmyslg)
* [react-router](https://codesandbox.io/p/devbox/v3mvnf)
* [remix](/test/remix/)

**Note**

* You can import factory functions `create`and `p` from `@react-params/core` package or adapter package used for your
  framework.

```js
import {create} from "@react-params/core";
//or 
import {create} from "@react-params/react-router";
//or
import {create} from "@react-params/remix-v7";
```

### Advanced use cases

* links generation [link](../../test/utils/src/link-example.tsx)
* single param usage (without grouping) [link](../../test/utils/src/single-param.tsx)
* batching support [link](../../test/utils/src/batch-example.tsx)
* transforming the shape of useSet method [link](../../test/utils/src/dialog-example.tsx)
* transforming the shape of useSet method to support table pagination [link](../../test/utils/src/pagination-example.tsx)

## API

### `create`

Creates a new params instance. Accepts a schema object where each key is a param `name and value is a param builder.
Returns an instance of `ReactParams`

```ts
import {create} from "@react-params/core";

const params = create({
    "param-name": paramBuilder, //e.g. p.string()
    ...
});
```

### `ReactParams` 
(ReturnType\<type of create>)

Represents the params instance.
For each param defnied there is camelCase substitute with two methods:
* `use` returns a tuple of `[value, setValue]`
* `useSet` returns a set method

```tsx
const [value, setValue] = params.paramName.use();
const setParamName = params.paramName.useSet();
```

Besides this ReactParams provide:
* `batch` method
* `withOptions` method (add ability to provide global options)
* `build` - utility method to build url params (to be used in links generation)

### `p`

A function that creates a new param builder.
Possible methods are:\
`string`, `number`, `boolean`, `datetime`, `date`, `object`

Each of those method accepts options (currently `updateType` which specifies how the param should be updated in the url)

#### updateType
| Name                    | Description                                                                            |
|-------------------------|----------------------------------------------------------------------------------------|
| replaceIn (**default**) | Replaces the current url with the new one                                              |
| pushIn                  | Pushes the new url to the current url                                                  |
| replace                 | Replaces the current url with the new one, but doesn't push the new url to the history |
| push                    | Pushes the new url to the history                                                      |

All builders have following methods:
* `withDefault` - sets a default value for the param, marking it as non nullable
* `validate` - sets a custom validator for the param
* `withCustomSetter` - transforms the param setter result (useful for e.g. toggling a boolean value)
* `withSerializer` - sets a custom serializer for the param
 
Example:

```ts
import {p} from "@react-params/core";

p.string({updateType: "replace"}).withDefault("")
```

### `Options`

you can specify options:
* globally (by calling `withOptions` method on `ReactParams` instance)
* per param (by passing those to `use` and `useSet` methods)

#### options
| Name         | Description                                                                                            |
|--------------|--------------------------------------------------------------------------------------------------------|
| updateType   | Sets the update type for the param.  |
| defaultValue | Sets a default value for the param, marking it as non nullable                                         |
| prefix       | Sets prefix to be used with param name                                                                 |

