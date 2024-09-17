import { pages, domainmodels, datatypes, IModel, texts } from "mendixmodelsdk";

import {
  IInputModel,
  IMendixAttribute,
  getSafeAttributeName,
} from "./createEntity";
import { OnlineWorkingCopy } from "mendixplatformsdk";
import { IParams } from ".";

function createInputForAttribute(
  attr: IMendixAttribute,
  input: IInputModel,
  params: IParams,
  model: IModel,
  index: Number
): pages.Widget {
  const ar = domainmodels.AttributeRef.create(model);
  const lt = pages.ClientTemplate.create(model);
  const tx = texts.Translation.create(model);
  tx.text = attr.label ? attr.label : attr.name;
  tx.languageCode = "en_US";
  const t = texts.Text.create(model);
  t.translations.push(tx);
  lt.template = t;
  const attribute = model.findAttributeByQualifiedName(
    `${params.moduleName}.${params.entityName}.${getSafeAttributeName(
      attr.name
    )}`
  );
  if (!attribute)
    throw new Error(
      `Cannout find attribute ${params.moduleName}.${
        params.entityName
      }.${getSafeAttributeName(attr.name)}`
    );
  ar.attribute = attribute;

  let wid: pages.AttributeWidget | undefined;

  switch (attr.type) {
    case "Boolean":
    case "Enumeration":
      wid = pages.RadioButtonGroup.create(model);
      break;
    case "DateTime":
      wid = pages.DatePicker.create(model);
      break;
    case "Decimal":
    case "Integer":
    case "Long":
    case "String":
    default:
      wid = pages.TextBox.create(model);
      break;
  }
  if (!wid) throw new Error(`Could not determine widget type: ${attr.type}`);
  wid.name = `radioButtons${index}`;
  wid.labelTemplate = lt;
  wid.attributeRef = ar;
  return wid;
}

function createSaveButton(model: IModel): pages.ActionButton {
  const tx = texts.Translation.create(model);
  const lt = pages.ClientTemplate.create(model);
  const a = pages.SaveChangesClientAction.create(model);
  tx.text = "Save";
  tx.languageCode = "en_US";
  const t = texts.Text.create(model);
  t.translations.push(tx);
  lt.template = t;
  const ab = pages.ActionButton.create(model);
  ab.name = "saveButton";
  ab.caption = lt;
  ab.buttonStyle = pages.ButtonStyle.Success;
  ab.action = a;
  return ab;
}

export async function createPage(
  input: IInputModel,
  params: IParams,
  model: IModel,
  workingCopy: OnlineWorkingCopy
) {
  // const {model, workingCopy} = await connectToModel();
  const entityName = `${params.moduleName}.${params.entityName}`;
  const pageName = `${params.entityName}_NewEdit`;
  const module = model.allModules().find((m) => m.name === params.moduleName);
  if (!module) throw new Error(`Module ${params.moduleName} not found`);
  const entity = model.findEntityByQualifiedName(entityName);
  if (!entity) throw new Error(`Entity ${entityName} not found`);
  // following the serialized file.

  const ot = datatypes.ObjectType.create(model);
  ot.entity = entity;

  const pp = pages.PageParameter.create(model);
  pp.name = params.entityName;
  pp.parameterType = ot;

  const der = domainmodels.DirectEntityRef.create(model);
  der.entity = entity;

  const pv = pages.PageVariable.create(model);

  const dvs = pages.DataViewSource.create(model);
  dvs.entityRef = der;
  dvs.sourceVariable = pv;

  const widgets: pages.Widget[] = [];
  input.attributes.forEach((a, i) => {
    widgets.push(createInputForAttribute(a, input, params, model, i));
  });
  // widgets.push(createSaveButton(model));

  const dv = pages.DataView.create(model);
  dv.name = "dataView1";
  dv.dataSource = dvs;
  dv.widgets.push(...widgets);
  dv.footerWidgets.push(createSaveButton(model));

  const lca = pages.LayoutCallArgument.create(model);
  // @ts-ignore
  lca.__parameter.updateWithRawValue("Atlas_Core.Atlas_Default.Main");
  lca.widgets.push(dv);

  const lc = pages.LayoutCall.create(model);
  lc.layout = model.findLayoutByQualifiedName("Atlas_Core.Atlas_Default");
  lc.arguments.push(lca);

  const page = pages.Page.createIn(module);
  page.name = pageName;
  page.parameters.push(pp);
  page.layoutCall = lc;

  pv.pageParameter = pp;
}
