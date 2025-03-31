import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import Examples from '@react-params/test-utils/src/examples.tsx'
import './index.css'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {ReactRouterApiProvider} from "@react-params/react-router-v6";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={
            <ReactRouterApiProvider>
                <Examples/>
            </ReactRouterApiProvider>
        }/>,
    ),
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <RouterProvider router={router}/>
  </StrictMode>,
)
