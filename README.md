# nr-synthetics-client
**This is not an official New Relic release, and not supported by New Relic.** 


A New Relic [Synthetics REST API v3](https://docs.newrelic.com/docs/apis/synthetics-rest-api/monitor-examples/manage-synthetics-monitors-rest-api) client.



## Installation

```sh
$ npm install --save nr-synthetics-client
```

## Usage

```js
const syntheticsMgr = require('nr-synthetics-client');


```
## Testing
1. Copy `.nrconfig.json.tmpl` to `.nrconfig.json` in your project root directory
2. Edit `nrconfig.json` and update with your admin api key and a test monitor Id.
3. run test

```
npm run test
```

###  [Synthetics monitoring attributes](https://docs.newrelic.com/docs/apis/synthetics-rest-api/monitor-examples/payload-attributes-synthetics-rest-api#api-attributes)
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

# Sample  Download / Upload Monitors
### Pre-requisite
1. Install NPM packages by running `npm install`
2. Copy `.nrconfig.json.tmpl` to `.nrconfig.json` update the JSON file with your admin api key.

1. Run  `npm run download` or `npm run upload`, and select the monitor(s) or `ALL`  to start dowload/upload of monitors. Files including the configuration file are saved in `./monitors` directory.


```
$ npm run download

Using apiKey: "NRAA-xxxxxx-xxxxxxxx-xxxxxxxx"

? Select Monitors (Press <space> to select, <a> to toggle all, <i> to invert selection)
> ◯ ALL
  = Scripted Browsers = 
 ◯ scriptedBrowser-test1
 ◯ scriptedBrowser-test2
  = API Tests = 
 ◯ apiTest-test1
 ◯ apiTest-test2

```

## License

Apache-2.0 © []()


[npm-image]: https://badge.fury.io/js/nr-synthetics-client.svg
[npm-url]: https://npmjs.org/package/nr-synthetics-client
[travis-image]: https://travis-ci.com//nr-synthetics-client.svg?branch=master
[travis-url]: https://travis-ci.com//nr-synthetics-client
[daviddm-image]: https://david-dm.org//nr-synthetics-client.svg?theme=shields.io
[daviddm-url]: https://david-dm.org//nr-synthetics-client
[coveralls-image]: https://coveralls.io/repos//nr-synthetics-client/badge.svg
[coveralls-url]: https://coveralls.io/r//nr-synthetics-client
