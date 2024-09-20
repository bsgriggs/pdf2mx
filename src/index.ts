/**
 * Helpful links:
 * - https://github.com/engalar/MendixModelSDKDemo/tree/master
 * - https://apidocs.rnd.mendix.com/modelsdk/latest/classes/projects.Folder.html#createIn
 */

//import "dotenv/config";
import { connectToModel, commit } from "./connect";
import { createEntity } from "./createEntity";
import { createNewEditPage } from "./pages/addPage_NewEdit";
import { IData, IEntity, IMendixAttribute, IParams } from "../typings/general";
import { domainmodels } from "mendixmodelsdk";
import { createOverviewPage } from "./pages/addPage_Overview";

async function main(data: IData, params: IParams) {
  /**
   * remove dupes from input - TODO
   */
  console.debug("IInputModel", data);
  console.debug("IParams", params);

  //Check that the provided data is valid
  let cleanEntities: IEntity[] = [];
  for (let entity of data.entities.sort((a, b) => a.sort - b.sort)) {
    //Check for duplicate entity names
    const existingIEntity = cleanEntities.find(
      (existingIEntity) => existingIEntity.entityName === entity.entityName
    );
    if (existingIEntity === undefined) {
      if (
        entity.parentEntityName &&
        entity.parentEntityName.trim() !== "" &&
        data.entities.findIndex(
          (dataEntity) => (dataEntity.entityName = entity.parentEntityName)
        ) === -1
      ) {
        //Check that provided parent entity name exists
        console.warn(
          `Entity '${entity.entityName}' has parent name '${entity.parentEntityName}' which was not provided by the request.`
        );
      }
      //Check for duplicate attribute names
      let cleanAttributes: IMendixAttribute[] = [];
      for (let attribute of entity.attributes) {
        const existingIAttribute = cleanAttributes.find(
          (existingIAttribute) => existingIAttribute.name === attribute.name
        );
        if (existingIAttribute === undefined) {
          cleanAttributes.push(attribute);
        } else {
          console.warn(
            `Received duplicate attributes '${attribute.name}' for entity '${entity.entityName}'`
          );
        }
      }
      entity.attributes = cleanAttributes;
      cleanEntities.push(entity);
    } else {
      console.warn(`Received duplicate entity name '${entity.entityName}'`);
    }
  }

  console.debug(JSON.stringify(cleanEntities));

  const { model, workingCopy } = await connectToModel(params);
  //Validate module name
  if (data.moduleName && data.moduleName.trim() === "") {
    throw new Error("Module name must be provided");
  }
  console.debug("moduleName: " + data.moduleName);
  let existingModule = model
    .allModules()
    .find((module) => module.name === data.moduleName);

  if (!existingModule) {
    throw new Error(`Unknown module '${data.moduleName}' for model ${model}`);
  }
  await existingModule.domainModel.load();
  //create new entities
  let createdEntities: domainmodels.Entity[] = [];
  let x = 100;
  let y = 100;
  for (let entity of cleanEntities) {
    console.debug("entity of cleanEntity", entity);
    createdEntities.push(
      await createEntity(entity, existingModule.domainModel, model, x, y)
    );
    await createNewEditPage(entity, existingModule, model);
    await createOverviewPage(entity, existingModule, model);
    x += 400;
  }

  //create new associations
  for (let entity of cleanEntities.filter(
    (entity) => entity.parentEntityName && entity.parentEntityName.trim() !== ""
  )) {
    const child = createdEntities.find(
      (newEntity) => newEntity.name === entity.entityName
    );
    const parent = createdEntities.find(
      (newEntity) => newEntity.name === entity.parentEntityName
    );
    if (child !== parent) {
      if (child && parent) {
        const newAssociation = domainmodels.Association.create(model);
        newAssociation.name = `${child.name}_${parent.name}`;
        newAssociation.child = child;
        newAssociation.parent = parent;
        newAssociation.type = domainmodels.AssociationType.Reference;
        newAssociation.owner = domainmodels.AssociationOwner.Both;
        // these x,y values are percentages
        newAssociation.childConnection = { x: 0, y: 0 };
        newAssociation.parentConnection = { x: 100, y: 0 };

        console.debug(`creating association '${newAssociation.name}'`);
        existingModule.domainModel.associations.push(newAssociation);
      } else {
        console.warn(
          `Unable to create association. Either child '${entity.entityName}' or parent '${entity.parentEntityName}' was not found`
        );
      }
    }
  }

  await commit(
    workingCopy,
    model,
    `PDF2MX - Added Entities/Pages for module '${data.moduleName}'`,
    params.branch
  );
}

exports.handler = async (event: any) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));
    // Call the main function
    await main(event.data as IData, event.params as IParams);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Function executed successfully",
      }),
    };
  } catch (error: any) {
    console.error("Error:", error);

    return {
      statusCode: 500,
      body: {
        message: "Function execution failed",
        error: error.errorMessage ? error.errorMessage : JSON.stringify(error),
      },
    };
  }
};
