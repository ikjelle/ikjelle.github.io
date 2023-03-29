export interface ODataResponse<T> {
    ["@odata.context"]: string;
    ["@odata.count"]: number | null;
    ["@odata.nextLink"]: string | null;
    value: T[];
}