# nr-synthetics-client
[![Version](https://img.shields.io/badge/dynamic/json?color=blue&label=Version&query=version&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftanben%2Fnr-synthetics-client%2Fmaster%2Fpackage.json)]() [![NPM](https://img.shields.io/badge/dynamic/json?color=red&label=NPM&query=engines.npm&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftanben%2Fnr-synthetics-client%2Fmaster%2Fpackage.json)]()


A New Relic [Synthetics REST API v3](https://docs.newrelic.com/docs/apis/synthetics-rest-api/monitor-examples/manage-synthetics-monitors-rest-api) client.



## Installation

1. Include this package by using either:
```
npm install  @tanben/nr-synthetics-client@<version>

```
OR manually include in your package.json  dependencies:
```
  "dependencies": {
    "@tanben/nr-synthetics-client": "^0.1.0"
  }
```

## Usage

```js
const syntheticsClient = require('@tanben/nr-synthetics-client');
```

## API


### Get All Monitors

```
getAllMonitors({ saveConfig }?: {
    saveConfig?: boolean;
}): Promise<Monitors>
```


### Get Monitor Script 
Download scripted browser and API test to local monitor directory.
```
getScript(id: any, decodeb64?: boolean): Promise<any>

Params: id - Synthetics monitor id
        decodeb64 - true(default), monitor script is in base64, set to false to return as base64.

```

### Upload  Script
Upload local script.

```
uploadScripts(monitorNames: any): Promise<void>

```



###  [Synthetics Monitor attributes](https://docs.newrelic.com/docs/apis/synthetics-rest-api/monitor-examples/payload-attributes-synthetics-rest-api#api-attributes)
```
 {
    monitors: {
        id: string;
        name: string;
        type: string;
        frequency: number;
        uri: string;
        locations: string[];
        status: string;
        slaThreshold: number;
        options: {};
        modifiedAt: string;
        createdAt: string;
        userId: number;
        apiVersion: string;
    }[];
    count: number;
}
```


# Sample  Download / Upload Monitor App
### Pre-requisite
1. Install NPM packages by running `npm install`
2. Copy `.nrconfig.json.tmpl` to `.nrconfig.json` update the JSON file with your admin api key.

1. Run  `npm run download` or `npm run upload`, and select the monitor(s) or `ALL`  to start dowloading/uploading  monitors.  Files including the configuration file are saved in `./monitors` directory.


```
$ npm run download

Using apiKey: "xxxx-xxxxxx-xxxxxxxx-xxxxxxxx"

? Select Monitors (Press <space> to select, <a> to toggle all, <i> to invert selection)
> ◯ ALL
  = Scripted Browsers = 
 ◯ scriptedBrowser-test1
 ◯ scriptedBrowser-test2
  = API Tests = 
 ◯ apiTest-test1
 ◯ apiTest-test2

 
 ? Select Monitors ALL
downloading monitor [scriptedBrowser-test1] id=[xxxxxxxxxxxxxxxxxxxxxxxx] type=[SCRIPT_BROWSER] to directory [monitors]
downloading monitor [scriptedBrowser-test2] id=[xxxxxxxxxxxxxxxxxxxxxxxx] type=[SCRIPT_BROWSER] to directory [monitors]
downloading monitor [apiTest-test1] id=[xxxxxxxxxxxxxxxxxxxxxxxxxx] type=[SCRIPT_API] to directory [monitors]
downloading monitor [apiTest-test2] id=[xxxxxxxxxxxxxxxxxxxxxxxxxx] type=[SCRIPT_API] to directory [monitors]
Download Complete

```

## License

Apache-2.0 © [Benedicto Tan](https://github.com/tanben)
