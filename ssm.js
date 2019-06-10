/**
 * Handles the loading and caching of the SSM parameter stores.
 *
 * Assumes the keys are stored in JSON formatted keys
 *
 * (c) MacLaurin Group LLC 2018
 */
"use strict";

const log = new(require("mg-toolbox/log"))("SSM");

module.exports = class ssm {

  constructor(_region) {
    this.paramValues = {};
    this.region = (typeof _region != "undefined") ? _region : "us-east-1";
  }

  async init(paramArray, withDecryption) {
    try {
      const AWS = require("aws-sdk");
      const ssm = new AWS.SSM({
        region: this.region
      });

      const p = await ssm.getParameters({
        Names: paramArray,
        WithDecryption: (typeof withDecryption == "undefined") ? false : withDecryption
      }).promise();
      this.paramValues = this._processParams(p);

      log.config("Params Loaded=" + JSON.stringify(paramArray));
      return this;
    } catch (err) {
      log.severe(err, false);
      throw new Error("Unable to retrieve SSM; " + err);
    }
  }


  /**
   * Return the specific parameter defined
   *
   * @param {*} param
   */
  getParam(param) {
    return this.paramValues[param];
  }

  getParams() {
    return Object.keys(this.paramValues);
  }


  /**
   * Process the callback from the SSM call
   * @param {*} params
   */
  _processParams(params) {
    const pAll = {};
    params.Parameters.forEach(p => {
      let arry = p.Name.split("/");
      let key = arry[arry.length - 1];
      pAll[key] = JSON.parse(p.Value);
    });
    return pAll;
  }
}
