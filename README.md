## PDF 2 MX ReadMe

This module is used to create domain model entities from a PDF file.

### Set up

1. Create a Lambda function in AWS
2. Compile the code using the steps below
3. Add the PDF2MX module to a Mendix app.
   1. Follow the steps inside the PDF2MX module's ReadMe

### Compile/Contribute to the Code

Changes made to pdf2mx code utilizing mendix sdk

1. Download the project with git clone
2. Npm install
3. Make your changes
4. Npm run build (compiles TS to JS)
5. Depending on your machine (compresses needed JS files to .zip) (delete previous zip if existing)
   1. windows: Npm run zip
   2. max: Npm run zipmac
6. Upload 'pdf2mx.zip' to AWS Lambda

### Text Example Payload:

```
{
  "moduleName": "",
  "entities": [
    {
      "entityName": "",
      "parentEntityName": "",
      "sort": 1
      "attributes": [
        {
          "name": "",
          "label": "optional",
          "type": "Boolean, DateTime, Decimal, Enumeration, Integer, Long, String",
          "sort": 1,
        }
      ]
    }
  ]
}

```
