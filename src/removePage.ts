// import { commit, connectToModel } from "./connect";
// import 'dotenv/config';
// const { MENDIX_TOKEN, APP_ID, BRANCH } = process.env;

// async function deleteSamplePage() {
//     try {
//         const res = await connectToModel();
//         const { model, workingCopy } = res;
//         const p = model.allProjects().find(project => true);
//         if (!p) {
//             throw new Error("failed to find a project");
//         }
//         const page = model.allPages().find(i => i.name === "GeneratedEntity_NewEdit");
//         const module = model.allModules().find(i => i.name === "GeneratedModule")
//         const folder = model.allFolders().find(i => i.name === "SampleFolder")
//         if (page) {
//             console.log(`Found page. Deleting it`)
//             await page?.delete();
//             await folder?.delete();
//             await module?.delete();
//         } else {
//             console.log("Didn't find the page")
//         }
//         await commit(workingCopy, model, "removed sample page", BRANCH as string)
//     } catch (e) {
//         console.error(e);
//     }

// }

// deleteSamplePage();
