import {
  pages,
  domainmodels,
  datatypes,
  IModel,
  projects,
  texts,
} from "mendixmodelsdk";

import { getSafeAttributeName } from "../createEntity";
import { IEntity, IMendixAttribute } from "../../typings/general";

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

function createSaveButton(model: IModel): pages.Widget[] {
  const saveTranslation = texts.Translation.create(model);
  saveTranslation.text = "Save";
  saveTranslation.languageCode = "en_US";

  const saveText = texts.Text.create(model);
  saveText.translations.push(saveTranslation);

  const saveClientTemplate = pages.ClientTemplate.create(model);
  saveClientTemplate.template = saveText;

  const cancelTranslation = texts.Translation.create(model);
  cancelTranslation.text = "Cancel";
  cancelTranslation.languageCode = "en_US";

  const cancelText = texts.Text.create(model);
  cancelText.translations.push(cancelTranslation);

  const cancelClientTemplate = pages.ClientTemplate.create(model);
  cancelClientTemplate.template = cancelText;

  const newSaveButton = pages.ActionButton.create(model);
  newSaveButton.name = "saveButton";
  newSaveButton.caption = saveClientTemplate;
  newSaveButton.buttonStyle = pages.ButtonStyle.Success;
  newSaveButton.action = pages.SaveChangesClientAction.create(model);

  const newCancelButton = pages.ActionButton.create(model);
  newCancelButton.name = "cancelButton";
  newCancelButton.caption = cancelClientTemplate;
  newCancelButton.buttonStyle = pages.ButtonStyle.Default;
  newCancelButton.action = pages.CancelChangesClientAction.create(model);

  return [newSaveButton, newCancelButton];
}

export async function createNewEditPage(
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
  newDataView.footerWidgets.push(...createSaveButton(model));

  const newLayoutGrid = pages.LayoutGrid.create(model);
  newLayoutGrid.name = "layoutGrid1";
  const newLayoutGridRow = pages.LayoutGridRow.createIn(newLayoutGrid);
  const newLayoutGridColumn = pages.LayoutGridColumn.createIn(newLayoutGridRow);
  newLayoutGridColumn.weight = 12;
  newLayoutGridColumn.widgets.push(newDataView);

  const newLayoutCallArgument = pages.LayoutCallArgument.create(model);
  // @ts-ignore
  newLayoutCallArgument.__parameter.updateWithRawValue(
    "Atlas_Core.PopupLayout.Main"
  );
  newLayoutCallArgument.widgets.push(newLayoutGrid);

  const newLayoutCall = pages.LayoutCall.create(model);
  newLayoutCall.layout = model.findLayoutByQualifiedName(
    "Atlas_Core.PopupLayout"
  );
  newLayoutCall.arguments.push(newLayoutCallArgument);

  const titleTranslation = texts.Translation.create(model);
  titleTranslation.text = `Edit ${mxEntity.entityName}`;
  titleTranslation.languageCode = "en_US";

  const titleText = texts.Text.create(model);
  titleText.translations.push(titleTranslation);

  const newPage = pages.Page.createIn(module);
  newPage.name = pageName;
  newPage.parameters.push(newPageParameter);
  newPage.layoutCall = newLayoutCall;
  newPage.title = titleText;

  newPageVariable.pageParameter = newPageParameter;
}
