
/**
 * Integration Test
 */
const assert = require ('assert');

const synthClient = require('../index');
const config = require('../../.nrconfig.json');
const fs = require ('fs');

console.log(`testApp.js using config: ${JSON.stringify(config)}`);

(async function(){
    const synthMgr = synthClient({apiKey: config.apiKey});
    console.log(synthMgr.props)
    const monitorDir= synthMgr.props.monitorDir;

    // Get monitors and save to local
    const response = await synthMgr.getAllMonitors({saveConfig:true});  
    const {count, monitors} = response;

    assert(monitors.length>0, 'no monitors for account ${config.apiKey}');

    await synthMgr.saveScripts(monitors);
    
    const scriptedMonitors= monitors.filter( m=>( m.type === 'SCRIPT_BROWSER' || m.type==='SCRIPT_API'));
    let files = fs.readdirSync(monitorDir);
    
    assert (files.length-1 === scriptedMonitors.length);
    
    await synthMgr.uploadScripts([`${scriptedMonitors[0].name}.js`]);
})()
.then(_=>{
    console.log('Success!!!')
})
