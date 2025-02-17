import {renderExample} from '../../test-utils/src/example.tsx'
import {renderExample as renderPageExample} from '../../test-utils/src/paging-example.tsx'

import {create, p} from "@react-params/core";

const Example = renderExample(create, p);
const PageExample = renderPageExample(create, p);

function App() {
    return (
        <>
            <Example/>
            <PageExample/>
        </>
    )
}

export default App
