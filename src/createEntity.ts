import { IModel, domainmodels } from "mendixmodelsdk";
import { IEntity, IMendixAttribute } from "../typings/general";

function getAttributeType(
  model: IModel,
  attr: IMendixAttribute
): domainmodels.AttributeType {
  let newAttributeType: domainmodels.AttributeType | undefined;

  switch (attr.type) {
    case "Boolean":
      newAttributeType = domainmodels.BooleanAttributeType.create(model);
      break;
    case "Enumeration":

    case "DateTime":
      newAttributeType = domainmodels.DateTimeAttributeType.create(model);
      break;
    case "Decimal":
      newAttributeType = domainmodels.DecimalAttributeType.create(model);
      break;
    case "Integer":
      newAttributeType = domainmodels.IntegerAttributeType.create(model);
      break;
    case "Long":
      newAttributeType = domainmodels.LongAttributeType.create(model);
      break;
    case "String":
      newAttributeType = domainmodels.StringAttributeType.create(model);
      break;
    default:
      newAttributeType = domainmodels.StringAttributeType.create(model);
      break;
  }
  return newAttributeType;
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
  mxAttribute: IMendixAttribute
): domainmodels.Attribute {
  const newAttribute = domainmodels.Attribute.create(model);
  const newStoredValue = domainmodels.StoredValue.create(model);
  if (mxAttribute.type === "Boolean") {
    newStoredValue.defaultValue = "false";
    newAttribute.value = newStoredValue;
  }
  const safeName = getSafeAttributeName(mxAttribute.name);
  newAttribute.name = safeName;
  newAttribute.type = getAttributeType(model, mxAttribute);
  console.debug(
    `creating attribute name '${safeName}' of type '${mxAttribute.type}'`
  );
  return newAttribute;
}

export const createEntity = async (
  mxEntity: IEntity,
  domainModel: domainmodels.IDomainModel,
  model: IModel,
  x: number,
  y: number
): Promise<domainmodels.Entity> =>
  new Promise(async (resolve) => {
    console.debug("creating mxEntity: " + mxEntity.entityName);

    // create the entity
    const entity = domainmodels.Entity.create(model);
    entity.name = mxEntity.entityName;
    entity.location = { x: x, y: y };
    entity.imageData = "";
    // add each attribute
    mxEntity.attributes
      .sort((a, b) => a.row - b.row)
      .forEach((attribute) => {
        entity.attributes.push(createAttribute(model, attribute));
      });
    domainModel.entities.push(entity);
    resolve(entity);
  });
