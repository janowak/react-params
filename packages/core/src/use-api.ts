import {useContext} from "react";
import {ApiContext} from "./api";

export const useContextApi = () => {
    return  useContext(ApiContext);
}
