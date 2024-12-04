
<div align="center">
  <h1>@react-params/core</h1>
  <p>
    Opinionated search query param hooks to manage state in React
  </p>
<hr />

<a href="#installation">Installation</a> |
<a href="#rationale">Rationale</a> |
<a href="#usage">Usage</a> |
<a href="#api">API</a> |
<a href="https://pbeshai.github.io/use-query-params/">Demo</a>

</div>
<hr/>

## Installation

```bash
npm install @react-params/core
```
## Rationale

* Typescript support 
* Grouping of params (see here)
* Optimized rendering
  * `useSet` method for only updating params
  * don't re-render on every url change (compares values internally)
  * keeps the same reference every time urls update don't trigger direct param change
* supports batching
* build method for generating urls in links
* specialized hooks for common use cases
  * dialog
  * pagination

## Sample Usage

```tsx
import { create } from "@react-params/core";

const params = create({
  "some-string": f.string(),
  "count": f.number().withDefault(0),
  //for object we specify type
  "some-object": f.object<{ a: string }>(),
  //list of strings
  "list": f.list({separator: ",", item: f.string()}).withDefault([]),
});

// all params are auto mapped from kebab case to camel case
const Component = () => {
    
  //react useState like hook result
  const [value, setValue] = params.someString.use();
  const [count, setCount] = params.count.use();
  
  //useSet result in not subscribing to this param changes
  const [object, setObject] = params.someObject.useSet();
  const [list, setList] = params.list.use();
  
  return <div  />
};
```

## API

### `create`

Creates a new params instance. Accepts a schema object.
Each key in the schema object is a param `name`.
Returns an instance of `ReactParams`

```ts
const params = create({
  "some-string": p.string(),
  "count": p.number().withDefault(0),
  "some-object": p.object<{ a: string }>(),
  "list": p.list({separator: ",", item: p.string(),}).withDefault([]),
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
| asDialog    | Sets the param as a dialog param returning dialog specyfic method                                      |

Example:

```ts
  p.string({updateType: "replace" }).withDefault("").asDialog();
```

#### Update types

|Name|Description|
|----|-----------|
|replaceIn|Replaces the current url with the new one|
|pushIn|Pushes the new url to the current url|
|replace|Replaces the current url with the new one, but doesn't push the new url to the history|
|push|Pushes the new url to the history|

#### Param methods

| Name | Description |
| --- | --- |
| useSet | Returns a tuple of `[value, setValue]` |
| use | Returns a tuple of `[value, setValue]` |

#### Dialog param methods

| Name | Description |
| --- | --- |
| useSet | Returns a dialog set object |
| use | Returns a dialog get object |

#### Page param methods
