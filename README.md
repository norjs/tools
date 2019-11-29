# @norjs/tools

NorJS Development Tools

### `norjs-db-model-generator`

This command can be used to auto-generate database model files.

`norjs-db-model-generator ./examples/timecard.json NrTimecardRecord > ./examples/NrTimecardRecord.js`

It will convert [NrDatabaseTable object](https://github.com/norjs/ui/blob/master/models/NrDatabaseTable.js) (see also
 [examples/timecard.json](https://github.com/norjs/tools/blob/master/examples/timecard.json)) as a JavaScript data model 
 class file. 

Sample output is available at [examples/NrTimecardRecord.js](https://github.com/norjs/tools/blob/master/examples/NrTimecardRecord.js).
