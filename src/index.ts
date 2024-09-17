/**
 * Helpful links:
 * - https://github.com/engalar/MendixModelSDKDemo/tree/master
 * - https://apidocs.rnd.mendix.com/modelsdk/latest/classes/projects.Folder.html#createIn
 */

//import "dotenv/config";
import { connectToModel, commit } from "./connect";
import { IInputModel, IMendixAttribute, createEntity } from "./createEntity";
import { createPage } from "./addPage";
import { DynamoDB } from "aws-sdk";
const limit = 8;
const dynamodb = new DynamoDB({ apiVersion: "2012-08-10" });

export interface IParams {
  mendix_token: string;
  app_id: string;
  branch: string;
  moduleName: string;
  entityName: string;
}

async function main(data: IInputModel, params: IParams) {
  /**
   * remove dupes from input
   */
  console.debug("IInputModel", data);
  console.debug("IParams", params);
  const dedupedAttributes: IMendixAttribute[] = [];
  data.attributes.forEach((attr) => {
    if (dedupedAttributes.find((existing) => existing.name === attr.name)) {
      return;
    }
    dedupedAttributes.push(attr);
  });
  const cleanedInput: IInputModel = {
    ...data,
    attributes: dedupedAttributes,
  };
  if (data.attributes.length != cleanedInput.attributes.length) {
    console.warn(
      `Removed ${
        data.attributes.length - cleanedInput.attributes.length
      } duplicate attributes`
    );
  }

  const { model, workingCopy } = await connectToModel(params);
  await createEntity(cleanedInput, params, model, workingCopy);
  await createPage(cleanedInput, params, model, workingCopy);
  await commit(
    workingCopy,
    model,
    `PDF2MX - Add Entity ${params.moduleName}.${params.entityName} and page.`,
    params.branch
  );
}

exports.handler = async (event: any) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));
    // Call the main function
    await main(event.data as IInputModel, event.params as IParams);

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
