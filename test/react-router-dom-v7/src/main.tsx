import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import Examples from '@react-params/test-utils/src/examples.tsx'
import './index.css'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {ReactParamsApiProvider} from "@react-params/react-router-dom";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={
            <ReactParamsApiProvider>
                <Examples/>
            </ReactParamsApiProvider>
        }/>,
    ),
);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>,
)
