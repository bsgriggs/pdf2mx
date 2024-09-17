import {
  pages,
  domainmodels,
  datatypes,
  IModel,
  texts,
  projects,
} from "mendixmodelsdk";

import { getSafeAttributeName } from "./createEntity";
import { IEntity, IMendixAttribute } from "../typings/general";

function createInputForAttribute(
  mxAttribute: IMendixAttribute,
  mxEntity: IEntity,
  module: projects.IModule,
  model: IModel,
  index: Number
): pages.Widget {
  const newTranslation = texts.Translation.create(model);
  newTranslation.text = mxAttribute.label
    ? mxAttribute.label
    : mxAttribute.name;
  newTranslation.languageCode = "en_US";

  const newText = texts.Text.create(model);
  newText.translations.push(newTranslation);

  const newClientTemplate = pages.ClientTemplate.create(model);
  newClientTemplate.template = newText;
  const attributeQualifiedName = `${module.name}.${
    mxEntity.entityName
  }.${getSafeAttributeName(mxAttribute.name)}`;

  const newAttributeRef = domainmodels.AttributeRef.create(model);
  const attribute = model.findAttributeByQualifiedName(attributeQualifiedName);
  if (!attribute)
    throw new Error(`Cannout find attribute '${attributeQualifiedName}'`);
  newAttributeRef.attribute = attribute;

  let newAttributeWidget: pages.AttributeWidget | undefined;

  switch (mxAttribute.type) {
    case "Boolean":
    case "Enumeration":
      newAttributeWidget = pages.RadioButtonGroup.create(model);
      newAttributeWidget.name = `radioButtons${index}`;
      break;
    case "DateTime":
      newAttributeWidget = pages.DatePicker.create(model);
      newAttributeWidget.name = `datePicker${index}`;
      break;
    case "Decimal":
    case "Integer":
    case "Long":
    case "String":
    default:
      newAttributeWidget = pages.TextBox.create(model);
      newAttributeWidget.name = `textBox${index}`;
      break;
  }
  if (!newAttributeWidget)
    throw new Error(`Could not determine widget type: ${mxAttribute.type}`);

  newAttributeWidget.labelTemplate = newClientTemplate;
  newAttributeWidget.attributeRef = newAttributeRef;

  return newAttributeWidget;
}

function createSaveButton(model: IModel): pages.ActionButton {
  const newTranslation = texts.Translation.create(model);
  newTranslation.text = "Save";
  newTranslation.languageCode = "en_US";

  const newText = texts.Text.create(model);
  newText.translations.push(newTranslation);

  const newClientTemplate = pages.ClientTemplate.create(model);
  newClientTemplate.template = newText;

  const newActionButton = pages.ActionButton.create(model);
  newActionButton.name = "saveButton";
  newActionButton.caption = newClientTemplate;
  newActionButton.buttonStyle = pages.ButtonStyle.Success;
  newActionButton.action = pages.SaveChangesClientAction.create(model);

  return newActionButton;
}

export async function createPage(
  mxEntity: IEntity,
  module: projects.IModule,
  model: IModel
) {
  const entityName = `${module.name}.${mxEntity.entityName}`;
  const pageName = `${mxEntity.entityName}_NewEdit`;
  const entity = model.findEntityByQualifiedName(entityName);
  if (!entity) throw new Error(`Entity ${entityName} not found`);

  const newObjectType = datatypes.ObjectType.create(model);
  newObjectType.entity = entity;

  const newPageParameter = pages.PageParameter.create(model);
  newPageParameter.name = mxEntity.entityName;
  newPageParameter.parameterType = newObjectType;

  const newDirectEntityRef = domainmodels.DirectEntityRef.create(model);
  newDirectEntityRef.entity = entity;

  const newPageVariable = pages.PageVariable.create(model);

  const newDataViewSource = pages.DataViewSource.create(model);
  newDataViewSource.entityRef = newDirectEntityRef;
  newDataViewSource.sourceVariable = newPageVariable;

  const widgets: pages.Widget[] = [];
  mxEntity.attributes.forEach((attribute, index) => {
    widgets.push(
      createInputForAttribute(attribute, mxEntity, module, model, index)
    );
  });

  const newDataView = pages.DataView.create(model);
  newDataView.name = "dataView1";
  newDataView.dataSource = newDataViewSource;
  newDataView.widgets.push(...widgets);
  newDataView.footerWidgets.push(createSaveButton(model));

  const newLayoutGrid = pages.LayoutGrid.create(model);
  newLayoutGrid.name = "layoutGrid1";
  const newLayoutGridRow = pages.LayoutGridRow.createIn(newLayoutGrid);
  const newLayoutGridColumn = pages.LayoutGridColumn.createIn(newLayoutGridRow);
  newLayoutGridColumn.weight = 12;
  newLayoutGridColumn.widgets.push(newDataView);

  const newLayoutCallArgument = pages.LayoutCallArgument.create(model);
  // @ts-ignore
  newLayoutCallArgument.__parameter.updateWithRawValue(
    "Atlas_Core.Atlas_Default.Main"
  );
  newLayoutCallArgument.widgets.push(newLayoutGrid);

  const newLayoutCall = pages.LayoutCall.create(model);
  newLayoutCall.layout = model.findLayoutByQualifiedName(
    "Atlas_Core.Atlas_Default"
  );
  newLayoutCall.arguments.push(newLayoutCallArgument);

  const newPage = pages.Page.createIn(module);
  newPage.name = pageName;
  newPage.parameters.push(newPageParameter);
  newPage.layoutCall = newLayoutCall;

  newPageVariable.pageParameter = newPageParameter;
}
