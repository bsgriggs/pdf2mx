import { IModel, domainmodels } from "mendixmodelsdk";
import { OnlineWorkingCopy } from "mendixplatformsdk";
import { IParams } from ".";

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
  top: Number;
  row: Number;
  left: Number;
  height: Number;
  width: Number;
}
export interface IInputModel {
  attributes: IMendixAttribute[];
}
function getAttributeType(
  model: IModel,
  attr: IMendixAttribute
): domainmodels.AttributeType {
  let at: domainmodels.AttributeType | undefined;

  switch (attr.type) {
    case "Boolean":
      at = domainmodels.BooleanAttributeType.create(model);
      break;
    case "Enumeration":

    case "DateTime":
      at = domainmodels.DateTimeAttributeType.create(model);
      break;
    case "Decimal":
      at = domainmodels.DecimalAttributeType.create(model);
      break;
    case "Integer":
      at = domainmodels.IntegerAttributeType.create(model);
      break;
    case "Long":
      at = domainmodels.LongAttributeType.create(model);
      break;
    case "String":
      at = domainmodels.StringAttributeType.create(model);
      break;
    default:
      at = domainmodels.StringAttributeType.create(model);
      break;
  }
  return at;
}

/**
 *
 * @param {string} rawValue value read from the form
 * @returns {string} a mendix attribute-safe name
 */
export function getSafeAttributeName(rawValue: string): string {
  let newValue = rawValue.replace(/\W/g, "_");
  if (newValue.charAt(0).match(/\d/g)) {
    newValue = "_" + newValue;
  }
  return newValue;
}

function createAttribute(
  model: IModel,
  data: IMendixAttribute
): domainmodels.Attribute {
  const attr = domainmodels.Attribute.create(model);
  const sv = domainmodels.StoredValue.create(model);
  if (data.type === "Boolean") {
    sv.defaultValue = "false";
    attr.value = sv;
  }
  const safeName = getSafeAttributeName(data.name);
  attr.name = safeName;
  attr.type = getAttributeType(model, data);
  console.debug(`creating attribute name: ${safeName} with type ${data.type}`);
  return attr;
}

export async function createEntity(
  input: IInputModel,
  params: IParams,
  model: IModel,
  workingCopy: OnlineWorkingCopy
) {
  console.debug("params: " + params);
  console.debug("input: " + input);
  let m = model
    .allModules()
    .find((module) => module.name === params.moduleName);

  if (!m) {
    throw new Error(`Unknown module: ${params.moduleName} with model ${model}`);
  }
  // create the entity
  const entity = domainmodels.Entity.create(model);
  entity.name = params.entityName;
  entity.location = { x: 100, y: 100 };
  entity.imageData = "";
  // add each attribute
  input.attributes.forEach((a) => {
    entity.attributes.push(createAttribute(model, a));
  });
  await m.domainModel.load();

  m.domainModel.entities.push(entity);
}
