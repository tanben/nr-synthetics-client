//@ts-check
/**
 * 
 * Download Synthetics Monitor Configuration
 * 
 */
const inquirer = require("inquirer");

const chalk = require ('chalk');
const colorize={
    red:chalk.bold.red,
    orange: chalk.keyword('orange'),
    green: chalk.keyword('green'),
    grey: chalk.keyword('grey')
};


const synthManager = require("../lib/index");
const {
    apiKey
} = require("../.nrconfig.json");

console.log(`Using apiKey: ${colorize.orange(JSON.stringify(apiKey))}`);

(async function () {
    const smgr = synthManager({
        apiKey
    });

    // Get monitors and save to local
    const response = await smgr.getAllMonitors({
        saveConfig: true
    });

    const { count, monitors } = response;
    console.log(`Totol scripts ${colorize.orange(count)}`);
})()
.then( _=> {
    console.log(`Download ${colorize.green("Complete")}` );
}, err=>{
    console.log(`Download ${colorize.red("Failed")}` );
    console.log(err);
});