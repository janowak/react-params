import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {renderExample} from '../../test-utils/src/example.tsx'
import './index.css'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {ReactRouterApiProvider, create, p} from "@react-params/react-router";

const Example =  renderExample(create, p);

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={
            <ReactRouterApiProvider>
                <Example/>
            </ReactRouterApiProvider>
        }/>,
    ),
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <RouterProvider router={router}/>
  </StrictMode>,
)
