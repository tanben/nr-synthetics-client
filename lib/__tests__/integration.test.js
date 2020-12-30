
/**
 * Integration Test
 */
const assert = require ('assert');

const synthClient = require('../index');
const config = require('../../.nrconfig.json');
const fs = require ('fs');
const path = require("path");

console.log(`testApp.js using config: ${JSON.stringify(config)}`);

(async function(){
    const synthMgr = synthClient({apiKey: config.apiKey});
    console.log(synthMgr.props)
    const monitorDir= synthMgr.props.monitorDir;

    // Get monitors and save to local
    let response = await synthMgr.getAllMonitors({saveConfig:true});  
    const {count, monitors} = response;

    assert(monitors.length>0, 'no monitors for account ${config.apiKey}');

    await synthMgr.saveScripts(monitors);
    
    const scriptedMonitors= monitors.filter( m=>( m.type === 'SCRIPT_BROWSER' || m.type==='SCRIPT_API'));
    let files = fs.readdirSync(monitorDir);
    
    assert (files.length-1 === scriptedMonitors.length);
    
    await synthMgr.uploadScripts([`${scriptedMonitors[0].name}.js`]);

    // Upload local script test
    const fname = path.join(monitorDir, `${scriptedMonitors[0].name}.js`);
    const newname = path.join(monitorDir, `${scriptedMonitors[0].name}-2.js`);
    fs.copyFileSync(fname, newname);

    const localMonitors = await synthMgr.listLocalMonitors();
    let locations = await synthMgr.getAllLocations();
    const location = locations.slice(0,1).map(location => location.name); // use only 1 location
    await synthMgr.createScripts(localMonitors, scriptedMonitors[0].type, scriptedMonitors[0].frequency, scriptedMonitors[0].status, location);

    // Update settings test
    response = await synthMgr.getAllMonitors({saveConfig:true});  
    const createdMonitors = response.monitors.filter( m=>( m.name === `${scriptedMonitors[0].name}-2`));

    await synthMgr.updateSettings(createdMonitors, createdMonitors[0].frequency, createdMonitors[0].status, location);

    // Delete script test
    await synthMgr.deleteScripts(createdMonitors);

    // Clean up - delete copied file
    fs.unlinkSync(newname);

})()
.then(_=>{
    console.log('Success!!!')
})
