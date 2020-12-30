const syntRestApi = require("./synth-restapi/index.js");
const path = require("path");
const makeDir = require("make-dir");
const fs = require("fs");
const atob = require("atob");

module.exports = function ({ apiKey = "" }) {
  const monitorDir = "monitors";
  const configFile = "nr-monitor.json";

  const _props = {
    apiKey: apiKey,
    monitorDir,
    configFile: path.join(monitorDir, configFile),
    monitorConfigs: {},
  };

  const _restAPI = syntRestApi({
    apiKey: _props.apiKey,
  });

  async function getAllMonitors({ saveConfig = false } = {}) {
    const { statusCode, message, body } = await _restAPI.getMonitors();

    if (statusCode >= 400) {
      console.log(
        `getAllMonitors(): Failed to retrieve all monitors for _props.apiKey=${_props._props.apiKey}`
      );
      throw new Error({
        statusCode,
        message,
      });
    }
    Object.assign(_props.monitorConfigs, body);
    if (saveConfig) {
      _saveConfig();
    }

    return { ...body };
  }

  async function _saveConfig() {
    if (_props.monitorConfigs.count == 0) {
      console.log(`No monitor config in memory, skipping save config.`);
      return;
    }
    try {
      const local = await makeDir(_props.monitorDir);
      fs.writeFileSync(
        _props.configFile,
        JSON.stringify(_props.monitorConfigs, null, 2)
      );
    } catch (error) {
      console.log(`_saveConfig(): Failed to save monitor config to file.`);
      console.log(error);
    }
  }

  async function saveScripts(monitors) {
    
    if (!Array.isArray(monitors)) {
      console.log( error(`getScripts() monitorArr must be array of monitor IDs`));
      throw new Error(
        "Invalid Parameter: monitorArr must be array of monitor IDs"
      );
    }
    for ( let i = 0, monitor = monitors[i];  i < monitors.length;  monitor = monitors[++i] ) {
      const { id, name, type } = monitor;
      try {
        if (type === 'SIMPLE'  || type === 'BROWSER'){
          // console.log(`Skipping monitor ${name} of type PING and Simple Browser`);
          continue;
        }

        const scriptText = await getScript(id);

        const fname = path.join(_props.monitorDir, `${name}.js`);
        console.log(`downloading monitor [${name}] id=[${id}] type=[${type}] to directory [${_props.monitorDir}]`);
        fs.writeFileSync(fname, scriptText);
      } catch (error) {
        console.log( `saveScripts(): Failed writting script [${name}] id=[${id}] type=[${type}]`);
      }
    }
  }

  async function getScript(id, decodeb64 = true) {
    const { statusCode, message, body } = await _restAPI.getScript(id);

    if (statusCode >= 400) {
      console.log(
        `getScript(): Failed to retrieve script for monitor ${id} for _props.apiKey=${_props.apiKey}`
      );
      throw new Error({
        statusCode,
        message,
      });
    }
    const { scriptText } = body;
    return decodeb64 ? atob(scriptText) : scriptText;
  }

  async function uploadScripts(monitorNames) {
    if (!Array.isArray(monitorNames)) {
      console.log(`getScripts() monitorNames must be array of monitor names`);
      throw new Error(
        "uploadScripts(): Invalid Parameter: monitorNames must be array of monitor names"
      );
    }
    const config = _loadMonitorConfig();
    
    // { 'monitor-name':{id:'monitor-id' type:API, ... }
    const monitorIdMap = _createMonitorNameMap(config.monitors);

  
    for ( let i = 0, name = monitorNames[i];  i < monitorNames.length;  name = monitorNames[++i] ) {
      try {
        if (!name || (name && name.trim().length == 0)) {
          continue;
        }

        name = (path.extname(name).length ==0)?`${name.trim()}.js`: name.trim();

        const fname = path.join( _props.monitorDir, name);
        const basename=path.basename(name, ".js");
        const {id, type} = monitorIdMap[basename];

        if (type === 'SIMPLE'  || type === 'BROWSER'){
          continue;
        }

        const scriptText = atob(fs.readFileSync(fname));

        console.log(`uploading script ${name}`);
        await updateScript(id, scriptText);

        console.log(`Successfully uploaded script ${name} id=${id}`);

      } catch (error) {
        console.log(`uploadScripts(): Failed to uploaded script ${name}`);
        console.log(error);
      }
    }

  }

  /**
   * returns : { 'monitor-name':'monitor-id'}
   */
  function _createMonitorNameMap(monitors) {
    return monitors.reduce((acc, curr) => {
      acc[curr.name.trim()] = {id:curr.id.trim(), type:curr.type};
      return acc;
    }, {});
  }

  async function updateScript(id, scriptText) {
    const { statusCode, message, body } = await _restAPI.updateScript(
      id,
      scriptText
    );

    if (statusCode >= 400) {
      console.log(
        `updateScript(): Failed to updateScript script for monitor ${id} for _props.apiKey=${_props.apiKey}`
      );
      throw new Error({
        statusCode,
        message,
      });
    }
  }

  function _loadMonitorConfig(){
    try{
      return JSON.parse(
        fs.readFileSync(_props.configFile, {
          encoding: "utf8",
        })
      );
    }catch (error){
      console.log(`_loadMonitorConfig(): Failed to load monitor configuration file [${_props.configFile}]`);
      throw error;
    }
  }

  /**
   * returns a list of monitors that are in the monitor config file
   */
  function listMonitors(){
    try{

      let files = fs.readdirSync(_props.monitorDir);
      files = files.filter( file=> (file!==configFile));
      let {monitors} = _loadMonitorConfig();

      const matchMonitors = monitors.filter( monitor =>{
        for (let i=0, file=files[i];i < files.length; file=files[++i]){
          const {id, name, type} = monitor;
          if (type === 'SIMPLE'  || type === 'BROWSER'){
            continue;
          }
          if (name == path.basename(file, ".js")){
            return true;
          }
        }
      })
      return matchMonitors;

    }catch (error){
      console.log(`listMonitors(): Failed to list monitor directory [${_props.monitorDir}]`);
      throw error;
    }
  }

  /**
   * Returns a list of local monitors (i.e. not in the monitor config file)
   */
  async function listLocalMonitors(){
    try{

      // Get monitors and save to local
      let {monitors} = await getAllMonitors({
        saveConfig: true,
      });

      let files = fs.readdirSync(_props.monitorDir);
      files = files
        .filter((file) => file !== configFile)
        .map((file) => path.basename(file, ".js"));

      const localMonitors = files.filter( file =>{
        for (const monitor of monitors) {
          const {id, name, type} = monitor;
          if (type === 'SIMPLE'  || type === 'BROWSER'){
            continue;
          }
          if (name == file){
            return false;
          }
        }
        return true;
      })
      return localMonitors;

    }catch (error){
      console.log(`listLocalMonitors(): Failed to list monitor directory [${_props.monitorDir}]`);
      throw error;
    }
  }

  /**
   * Returns a list of available locations
   */
  async function getAllLocations() {
    const { statusCode, message, body } = await _restAPI.getLocations();

    if (statusCode >= 400) {
      console.log(
        `getAllLocations(): Failed to retrieve all locations for _props.apiKey=${_props._props.apiKey}`
      );
      throw new Error({
        statusCode,
        message,
      });
    }

    return body;
  }

  /**
   * Creates new/local scripts and uploads the corresponding script text
   * @param {*} monitorNames - list of monitor names
   * @param {*} type - 'SCRIPT_API' or 'SCRIPT_BROWSER'
   * @param {*} frequency - valid values: 1, 5, 10, 15, 30, 60, 360, 720, 1440
   * @param {*} status - valid values: "ENABLED", "MUTED", "DISABLED"
   * @param {*} locations - list of location names
   */
  async function createScripts(monitorNames, type, frequency, status, locations ) {
    if (!Array.isArray(monitorNames)) {
      console.log(`createScripts() monitorNames must be array of monitor names`);
      throw new Error(
        "createScripts(): Invalid Parameter: monitorNames must be array of monitor names"
      );
    }
  
    for ( let i = 0, name = monitorNames[i];  i < monitorNames.length;  name = monitorNames[++i] ) {
      try {
        if (!name || (name && name.trim().length == 0)) {
          continue;
        }

        name = (path.extname(name).length ==0)?`${name.trim()}.js`: name.trim();

        const fname = path.join( _props.monitorDir, name);
        const basename=path.basename(name, ".js");

        //create script
        console.log(`creating script ${name}`);
        let id = await createScript(basename, type, frequency, locations, status)
        const scriptText = atob(fs.readFileSync(fname));

        console.log(`uploading script ${name}`);
        await updateScript(id, scriptText);

        console.log(`Successfully created script ${name} id=${id}`);

      } catch (error) {
        console.log(`uploadScripts(): Failed to uploaded script ${name}`);
        console.log(error);
      }
    }
  }

  async function createScript(name, type, frequency, locations, status) {
    const { statusCode, message, body } = await _restAPI.createScript(
      name, type, frequency, locations, status
    );

    if (statusCode >= 400) {
      console.log(
        `createScript(): Failed to createScript script for monitor ${name} for _props.apiKey=${_props.apiKey}`
      );
      throw new Error({
        statusCode,
        message,
      });
    }

    const {location} = body;
    const id = location.substring(location.lastIndexOf("/")+1);
    return id;
  }

  /**
   * Deletes each monitor in the list
   * @param {*} monitors - list of monitor objects
   */
  async function deleteScripts(monitors) {
    if (!Array.isArray(monitors)) {
      console.log(`deleteScripts() monitors must be array of monitor objects`);
      throw new Error(
        "Invalid Parameter: monitors must be array of monitor objects"
      );
    }
  
    for ( let i = 0, monitor = monitors[i];  i < monitors.length;  monitor = monitors[++i] ) {
      const { id, name, type } = monitor;
      try {
        if (type === 'SIMPLE'  || type === 'BROWSER'){
          // console.log(`Skipping monitor ${name} of type PING and Simple Browser`);
          continue;
        }
  
        //delete script
        await deleteScript(id, name)

        console.log(`Successfully deleted script ${name} id=${id}`);

      } catch (error) {
        console.log(`deleteScripts(): Failed to delete script ${name}`);
        console.log(error);
      }
    }
  }

  async function deleteScript(id, name) {
    const { statusCode, message, body } = await _restAPI.deleteScript(id);

    if (statusCode >= 400) {
      console.log(
        `deleteScript(): Failed to deleteScript script for monitor ${name} for _props.apiKey=${_props.apiKey}`
      );
      throw new Error({
        statusCode,
        message,
      });
    }
  }

  /**
   * Updates the settings of each monitor in the list; the frequency, status and locations will be applied to all monitors
   * @param {*} monitors - list of monitor objects
   * @param {*} frequency - valid values: 1, 5, 10, 15, 30, 60, 360, 720, 1440
   * @param {*} status - valid values: "ENABLED", "MUTED", "DISABLED"
   * @param {*} locations - list of location names
   */
  async function updateSettings(monitors, frequency, status, locations) {
    if (!Array.isArray(monitors)) {
      console.log(`updateSettings() monitors must be array of monitor objects`);
      throw new Error(
        "Invalid Parameter: monitors must be array of monitor objects"
      );
    }
  
    for ( let i = 0, monitor = monitors[i];  i < monitors.length;  monitor = monitors[++i] ) {
      const { id, name, type } = monitor;
      try {
        if (type === 'SIMPLE'  || type === 'BROWSER'){
          // console.log(`Skipping monitor ${name} of type PING and Simple Browser`);
          continue;
        }
  
        await updateScriptSetting(id, name, frequency, status, locations)

        console.log(`Successfully updated settings for script ${name} id=${id}`);

      } catch (error) {
        console.log(`updateSettings(): Failed to update settings for script ${name}`);
        console.log(error);
      }
    }
  }

  async function updateScriptSetting(id, name, frequency, status, locations) {
    const { statusCode, message, body } = await _restAPI.updateScriptSetting(id, frequency, status, locations);

    if (statusCode >= 400) {
      console.log(
        `updateScriptSetting(): Failed to update script settings for monitor ${name} for _props.apiKey=${_props.apiKey}`
      );
      throw new Error({
        statusCode,
        message,
      });
    }
  }

  return {
    getAllMonitors,
    getScript,
    saveScripts,
    uploadScripts,
    updateScript,
    listMonitors,
    listLocalMonitors,
    getAllLocations,
    createScripts,
    deleteScripts,
    updateSettings,
    props: _props
  };
};
