import { OnlineWorkingCopy } from "mendixplatformsdk";
import { IModel } from "mendixmodelsdk";

export interface IParams {
  mendix_token: string;
  app_id: string;
  branch: string;
}

export interface IMendixAttribute {
  name: string;
  label?: string;
  type:
    | "Boolean"
    | "DateTime"
    | "Decimal"
    | "Enumeration"
    | "Integer"
    | "Long"
    | "String";
  top: number;
  row: number;
  left: number;
  height: number;
  width: number;
}

export interface IEntity {
  entityName: string;
  attributes: IMendixAttribute[];
  parentEntityName: string;
}

export interface IData {
  moduleName: string;
  entities: IEntity[];
}

export interface IConnectionReturn {
  model: IModel;
  workingCopy: OnlineWorkingCopy;
}
