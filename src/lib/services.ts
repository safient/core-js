import { GenericError } from "./types";

export class SafientResponse<T> {
    error?: GenericError;
    data?: T;

    constructor({data, error}: {data?:T, error?:GenericError}){
        this.data = data;
        this.error = error
    }
}