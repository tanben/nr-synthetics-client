//@ts-check
/**
 * 
 * Download Synthetics Monitor Configuration and Scripts
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
    const { names } = await prompt(monitors);

    if (names.includes('ALL') && names.length ==1) {
        await smgr.saveScripts(monitors);
    } else {
        let monitorSelection = [];
        for (let i=0, name=names[i]; i < names.length; name=names[++i] ){
            monitorSelection= [...monitorSelection, ...monitors.filter( monitor=>(monitor.name == name))];
        }

        await smgr.saveScripts(monitorSelection);
    }


})()
.then( _=> {
    console.log(`Download ${colorize.green("Complete")}` );
}, err=>{
    console.log(`Download ${colorize.red("Failed")}` );
    console.log(err);
});


async function prompt(monitors) {
    const browserMonitors = monitors.filter(({
        type
    }) => type === "SCRIPT_BROWSER");
    const apiMonitors = monitors.filter(({
        type
    }) => type === "SCRIPT_API");

    return await inquirer.prompt([{
        type: "checkbox",
        message: "Select Monitors",
        name: "names",
        loop: false,

        choices: (_) => {
            const choices = [];
            choices.push({
                name: "ALL"
            });
            if (browserMonitors.length > 0) {
                choices.push(new inquirer.Separator(" = Scripted Browsers = "));
                browserMonitors.forEach(({
                    name
                }) => {
                    choices.push({name});
                });
            }

            if (apiMonitors.length > 0) {
                choices.push(new inquirer.Separator(" = API Tests = "));
                apiMonitors.forEach(({
                    name
                }) => {
                    choices.push({name});
                });
            }

            return choices;
        },
        validate: function (answer) {
            if (answer.length == 0) {
                return "You must choose at least one";
            }
            return true;
        },
    }, ]);
}