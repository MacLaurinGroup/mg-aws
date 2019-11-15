/**
 * Handles the loading and caching of the SSM parameter stores.
 *
 * Assumes the keys are stored in JSON formatted keys
 *
 * (c) MacLaurin Group LLC 2019
 */
"use strict";

const log = new(require("mg-toolbox/log"))("SSM");
const SSM = require("aws-sdk/clients/ssm");

module.exports = class ssm {

  constructor(_region) {
    this.paramValues = {};
    this.withDecryption = false;
    this.region = (typeof _region != "undefined") ? _region : "us-east-1";
  }

  async init(paramArray, withDecryption) {
    try {
      this.withDecryption = (typeof withDecryption == "undefined") ? false : withDecryption;

      this.ssm = new SSM({region: this.region});

      if (paramArray !== null && paramArray.length > 0) {
        const p = await this.ssm.getParameters({
          Names: paramArray,
          WithDecryption: this.withDecryption
        }).promise();
        this.paramValues = this._processParams(p);
        log.config("Params Loaded=" + JSON.stringify(paramArray));
      }

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


  /**
   * Returns all the parameters
   */
  getParams() {
    return Object.keys(this.paramValues);
  }


  /**
   * Fetches the parameter from cache, but if not, then gets it from SSM
   * @param {*} param 
   */
  async fetchParamCache(param){
    if ( this.paramValues[param] ){
      return this.paramValues[param];
    }

    this.paramValues[param] = await this.fetchParam(param);
    return this.paramValues[param];
  }


  /**
   * Goes and fetches the parameter but does not cache
   * @param {*} param 
   */
  async fetchParam(param){
    const p = await this.ssm.getParameter({
      Name: param,
      WithDecryption: this.withDecryption
    }).promise();

    return p == null ? null : p.Value;
  }


  /**
   * Process the callback from the SSM call
   * @param {*} params
   */
  _processParams(params) {
    const pAll = {};
    params.Parameters.forEach(p => {
      const arry = p.Name.split("/");
      const key = arry[arry.length - 1];
      pAll[key] = JSON.parse(p.Value);
    });
    return pAll;
  }
}