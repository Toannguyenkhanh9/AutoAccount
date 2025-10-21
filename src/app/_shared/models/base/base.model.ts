export interface PagingRequest {
  pageNo: number;
  rowsPerPage: number;
}

export class BaseModelResponse {
  Code: number;
  Message: string;
}

export interface BaseModel<T> extends BaseModelResponse {
  Result: T;
}

export interface BasePageModel<T> extends BaseModelResponse {
  TotalRow: number;
  Result: Array<T>;
}

export interface BaseRepoModel {
  Message: string;
}
