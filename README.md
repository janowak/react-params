
<div align="center">
  <h1>@react-params</h1>
  <p>
    Monorepo for @react-params - Opinionated search query param hooks library to manage state in React
  </p>
<hr />

<a href="#installation">Installation</a> |
<a href="#rationale">Rationale</a> |
<a href="#usage">Usage</a> |
<a href="#api">API</a> |
<a href="https://pbeshai.github.io/use-query-params/">Demo</a>

</div>
<hr/>

## Rationale

* Strongly typed
* Optimized rendering
    * `useSet` method for only updating params
    * don't re-render on every url change (compares values internally)
    * keeps the same reference every time urls update don't trigger direct param change
* Easy grouping of params
* Single interface across multiple frameworks (react-router-dom, remix, vanilla)
* Multiple utilities (parameter prefixes, custom serialization, validation, build method for generating urls in links and more)

## Sample Usage

```tsx
import { create } from "@react-params/core";

const params = create({
  "user-name": f.string(),
  "counter": f.number().withDefault(0),
  //for object we specify type
  "address": f.object<{ a: string }>(),
  //list of strings
  "colors": f.list({separator: ",", item: f.string()}).withDefault([]),
});

// all params are auto mapped from kebab case to camel case
const Component = () => {
    
  //react useState like hook result(set method supports dispatch shape)
  const [value, setValue] = params.userName.use();
  
  //use and useSet methods support prefixing
  const [counter, setCounter] = params.count.use({
    prefix: "prefix"
  });

  //you can overrride fault param settings in particular default value
  const [colors, setColors] = params.list.use({
    defaultValue: ["green", "red"]
  });

  //useSet result in not subscribing to this param changes
  const setAddress = params.address.useSet();
  
  return <div  />
};
```

## Installation

Depending on project setup:
* vanilla react ```npm install @react-params/core```
* react-router-dom ```npm install @react-params/react-router-dom```
* remix-v6 ```npm install @react-params/remix-v6```
* remix-v7 ```npm install @react-params/remix-v7```


Checkout those sandboxes for examples:
* [vanilla react](https://codesandbox.io/s/react-params-vanilla-monorepo-example-8t0q0?file=/src/App.tsx)
* [react-router-dom](https://codesandbox.io/s/react-params-react-router-dom-monorepo-example-8t0q0?file=/src/App.tsx)
* [remix-v6](https://codesandbox.io/s/react-params-remix-v6-monorepo-example-8t0q0?file=/app/routes/home.tsx)
* [remix-v7](https://codesandbox.io/s/react-params-remix-v7-monorepo-example-8t0q0?file=/app/routes/home.tsx)

### Advanced use cases

* batching support
* dynamic prefixing
* transforming the shape of useSet method
* custom serialization
* links generation
 
## API

> *In progress*

### `create`

Creates a new params instance. Accepts a schema object where each key  is a param `name`.   
Returns an instance of `ReactParams`

```ts
const params = create({
  "param-name": paramBuilder, //"p" function (see below)
  ...
});
```

### `p`

A function that creates a new param builder for a param.
Possible types are:\
`string`, `number`, `boolean`, `datetime`, `date`, `object`, `list`

Returns a builder instance.

#### Builder methods

| Name        | Description                                                                                            |
|-------------|--------------------------------------------------------------------------------------------------------|
| updateType  | Sets the update type for the param. Possible values are <br/> `replaceIn`, `pushIn`, `replace`, `push` |
| withDefault | Sets a default value for the param, marking it as non nullable                                         |
| validate    | Sets a custom serializer for the param                                                                 |

Example:

```ts
  p.string({updateType: "replace" }).withDefault("")
```

#### updateType

| Name                |Description|
|---------------------|-----------|
| replaceIn (default) |Replaces the current url with the new one|
| pushIn              |Pushes the new url to the current url|
| replace             |Replaces the current url with the new one, but doesn't push the new url to the history|
| push                |Pushes the new url to the history|

