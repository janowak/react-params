import {renderExample} from '../../test-utils/src/example.tsx'
import {create, p} from "@react-params/core";

const Example =  renderExample(create, p);

function App() {
  return (
    <>
      <Example />
    </>
  )
}

export default App
