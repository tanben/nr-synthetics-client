"use strict";

const got = require("got");
const { isBase64 } = require("validator");
const btoa = require("btoa");

module.exports = function({ apiKey = "" }) {
  const _apiKey = apiKey;
  const _rest = got.extend({
    prefixUrl: "https://synthetics.newrelic.com/synthetics/api",
    responseType: "json",
    headers: {
      "X-Api-Key": _apiKey,
    },
  });

  function _parseError(error){
    var { statusCode, message, body } = error;

    if (typeof statusCode === "undefined" && message && message.length > 0) {
      if (message.includes("Response code")) {
        const code = message.match(/\d+/g);
        statusCode = code.length > 0 ? code[0] : 200;
      }
    }

    return {
      statusCode,
      message,
      body,
    };
  }

  async function getMonitors() {
    try {
      const monitors = await _rest.paginate.all("v3/monitors", {
        pagination: {
          transform: response => {
            return response.body.monitors
          },
        }
      });

      return {
        statusCode: 200,
        message: "",
        body: {
          count: monitors.length,
          monitors
        },
      };
    } catch (error) {
      var { statusCode, message, body } = _parseError(error);

      console.log(
        `Failed to get all monitors. ${statusCode} ${message} ${body}`
      );
      return {
        statusCode,
        message,
        body,
      };
    }
  }

  async function getScript(id) {
    try {
      const { statusCode, message, body } = await _rest(
        `v3/monitors/${id}/script`
      );
      return {
        statusCode,
        message,
        body,
      };
    } catch (error) {
      var { statusCode, message, body } = _parseError(error);
      console.log(`Failed to getScript. ${statusCode} ${message} ${body}`);
      return {
        statusCode,
        message,
        body,
      };
    }
  }

  async function updateScript(id, data) {
    try {
      const b64Data = isBase64(data) ? data : btoa(data);

      const { statusCode, message, body } = await _rest(
        `v3/monitors/${id}/script`,
        {
          method: "PUT",
          json: {
            scriptText: b64Data,
          },
        }
      );
      return {
        statusCode,
        message,
        body,
      };
    } catch (error) {
      var { statusCode, message, body } = _parseError(error);
      console.log(`Failed to updateScript. ${statusCode} ${message} ${body}`);
      return {
        statusCode,
        message,
        body,
      };
    }
  }

  async function getLocations() {
    try {
      const { statusCode, message, body } = await _rest("v1/locations");

      return {
        statusCode,
        message,
        body
      };
    } catch (error) {
      var { statusCode, message, body } = _parseError(error);

      console.log(
        `Failed to get all locations. ${statusCode} ${message} ${body}`
      );
      return {
        statusCode,
        message,
        body,
      };
    }
  }

  async function createScript(name, type, frequency, locations, status) {
    try {

      const {statusCode, message, headers} = await _rest(
        `v3/monitors`,
        {
          method: "POST",
          json: {
            name: name,
            type: type,
            frequency: frequency,
            locations: locations,
            status: status
          },
        }
      );

      return {
        statusCode,
        message,
        body: headers
      };
    } catch (error) {
      var { statusCode, message, body } = _parseError(error);
      console.log(`Failed to createScript. ${statusCode} ${message} ${body}`);
      return {
        statusCode,
        message,
        body,
      };
    }
  }

  async function deleteScript(id) {
    try {

      const { statusCode, message, body } = await _rest(`v3/monitors/${id}`, {
        method: "DELETE",
      });

      return {
        statusCode,
        message,
        body
      };
    } catch (error) {
      var { statusCode, message, body } = _parseError(error);
      console.log(`Failed to deleteScript. ${statusCode} ${message} ${body}`);
      return {
        statusCode,
        message,
        body,
      };
    }
  }

  async function updateScriptSetting(id, frequency, status, locations) {
    try {
      let json = {
        frequency: frequency,
        status: status
      }
      if (locations.length > 0) {
        json = {...json, locations}
      }
      const { statusCode, message, body } = await _rest(`v3/monitors/${id}`, {
        method: "PATCH",
        json: json,
      });

      return {
        statusCode,
        message,
        body
      };
    } catch (error) {
      var { statusCode, message, body } = _parseError(error);
      console.log(`Failed to updateScriptSetting. ${statusCode} ${message} ${body}`);
      return {
        statusCode,
        message,
        body,
      };
    }
  }

  return {
    getMonitors,
    getScript,
    updateScript,
    getLocations,
    createScript,
    deleteScript,
    updateScriptSetting
  };
};
