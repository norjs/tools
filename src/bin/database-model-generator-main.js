import ProcessUtils from "@norjs/utils/src/ProcessUtils";
import NrDatabaseModelGenerator from "../NrDatabaseModelGenerator";

const ARGS = ProcessUtils.getArguments();

NrDatabaseModelGenerator.main(ARGS).catch( err => {
    console.error(`Exception: `, err);
});
