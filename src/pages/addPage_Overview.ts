import { pages, domainmodels, IModel, projects, texts } from "mendixmodelsdk";

import { IEntity } from "../../typings/general";

export async function createOverviewPage(
  mxEntity: IEntity,
  module: projects.IModule,
  model: IModel
) {
  const entityName = `${module.name}.${mxEntity.entityName}`;
  const pageName = `${mxEntity.entityName}_Overview`;
  const entity = model.findEntityByQualifiedName(entityName);
  if (!entity) throw new Error(`Entity ${entityName} not found`);

  const newDirectEntityRef = domainmodels.DirectEntityRef.create(model);
  newDirectEntityRef.entity = entity;

  // Header Details Start
  const headerDiv = pages.DivContainer.create(model);
  headerDiv.name = "headerContainer";
  headerDiv.appearance.class = "pageheader";

  const headerLayoutGrid =
    pages.LayoutGrid.createInDivContainerUnderWidgets(headerDiv);
  headerLayoutGrid.name = "layoutGrid1";
  const headerLayoutGridRow = pages.LayoutGridRow.createIn(headerLayoutGrid);
  const headerLayoutGridColumn =
    pages.LayoutGridColumn.createIn(headerLayoutGridRow);
  headerLayoutGridColumn.weight = 12;

  const pageHeader = pages.Title.createInLayoutGridColumnUnderWidgets(
    headerLayoutGridColumn
  );
  pageHeader.name = "pageHeader";
  pageHeader.appearance.class = "pageheader-title pageheader-title";

  const newTranslation = texts.Translation.create(model);
  newTranslation.text = `Manage ${mxEntity.entityName} objects`;
  newTranslation.languageCode = "en_US";
  const newText = texts.Text.create(model);
  newText.translations.push(newTranslation);
  const newClientTemplate = pages.ClientTemplate.create(model);
  newClientTemplate.template = newText;

  const detailText = pages.DynamicText.createInLayoutGridColumnUnderWidgets(
    headerLayoutGridColumn
  );
  detailText.name = "headerDetailText";
  detailText.appearance.class = "pageheader-subtitle text-detail";

  detailText.content = newClientTemplate;

  //header details end
  //main content start
  const newLayoutGrid = pages.LayoutGrid.create(model);
  newLayoutGrid.name = "layoutGrid2";
  const newLayoutGridRow = pages.LayoutGridRow.createIn(newLayoutGrid);
  const newLayoutGridColumn = pages.LayoutGridColumn.createIn(newLayoutGridRow);
  newLayoutGridColumn.weight = 12;

  // const dataGrid =
  //   pages.DataGrid.createInLayoutGridColumnUnderWidgets(newLayoutGridColumn);
  // dataGrid.name = "dataGrid1";

  //main content end

  //page meta data
  const newLayoutCallArgument = pages.LayoutCallArgument.create(model);
  // @ts-ignore
  newLayoutCallArgument.__parameter.updateWithRawValue(
    "Atlas_Core.Atlas_Default.Main"
  );
  newLayoutCallArgument.widgets.push(headerLayoutGrid, newLayoutGrid);

  const newLayoutCall = pages.LayoutCall.create(model);
  newLayoutCall.layout = model.findLayoutByQualifiedName(
    "Atlas_Core.Atlas_Default"
  );
  newLayoutCall.arguments.push(newLayoutCallArgument);

  const titleTranslation = texts.Translation.create(model);
  titleTranslation.text = `${mxEntity.entityName}_Overview`;
  titleTranslation.languageCode = "en_US";

  const titleText = texts.Text.create(model);
  titleText.translations.push(titleTranslation);

  const newPage = pages.Page.createIn(module);
  newPage.name = pageName;
  newPage.layoutCall = newLayoutCall;
  newPage.title = titleText;
}
