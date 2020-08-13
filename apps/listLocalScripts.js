//@ts-check
/**
 * 
 * Upload Synthetics Monitor Scripts
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


const synthClient = require("../lib/index");
const {
    apiKey
} = require("../.nrconfig.json");

const smgr = synthClient({apiKey});

// list local monitors that are defined in nr-monitor.json
const monitors = smgr.listMonitors();

console.log(JSON.stringify(monitors));


