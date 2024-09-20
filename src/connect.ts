import { IModel } from "mendixmodelsdk";
import {
  MendixPlatformClient,
  OnlineWorkingCopy,
  setPlatformConfig,
} from "mendixplatformsdk";
import { IConnectionReturn, IParams } from "../typings/general";

async function connect({
  mendix_token,
  app_id,
  branch,
}: IParams): Promise<IConnectionReturn> {
  console.debug(`Attempting to connect to app: ${app_id}:${branch}`);
  setPlatformConfig({
    mendixToken: mendix_token,
  });
  const client = new MendixPlatformClient();
  console.debug("got client", client);
  const app = await client.getApp(app_id as string);
  console.debug("got app", app);
  // this takes the name of the branch to checkout
  const workingCopy = await app.createTemporaryWorkingCopy(branch as string);
  console.debug("got working copy", workingCopy);
  const model = await workingCopy.openModel();
  console.debug("got model", model);
  return {
    model,
    workingCopy,
  };
}

export async function connectToModel(
  params: IParams
): Promise<IConnectionReturn> {
  let errorMessage: string | undefined;

  if (params.mendix_token === "") {
    errorMessage + "\n mendix_token was not provided";
  } else if (params.app_id === "") {
    errorMessage + "\n app_id was not provided";
  } else if (params.branch === "") {
    errorMessage + "\n branch was not provided";
  }
  if (errorMessage) {
    throw new Error(errorMessage.trim());
  } else {
    console.debug("Connection params are valid", params);
    return await connect(params);
  }
}

export async function commit(
  workingCopy: OnlineWorkingCopy,
  model: IModel,
  message: string,
  branchName: string
) {
  await model.flushChanges();
  await workingCopy.commitToRepository(branchName, {
    commitMessage: message,
  });
}
