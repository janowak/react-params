import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Example from '../../test-utils/src/example.tsx'
import './index.css'
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import {ReactRouterApiProvider} from "@react-params/react-router";

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
