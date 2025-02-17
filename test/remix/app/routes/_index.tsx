import {renderExample} from '../../../test-utils/src/example.tsx'
import {create, p} from "@react-params/remix";

const Example = renderExample(create, p);

const Component = () => {
    return (
        <Example/>
    )
}

export default Component;