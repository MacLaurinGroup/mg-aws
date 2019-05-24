/**
 * Handles the loading and caching of the SSM parameter stores.
 *
 * Assumes the keys are stored in JSON formatted keys
 *
 * (c) MacLaurin Group LLC 2018
 */
"use strict";

const log = require("mg-toolbox/log")("SSM");

module.exports = class ssm {

  constructor(_region) {
    this.paramValues = {};
    this.region = (typeof _region != "undefined") ? _region : "us-east-1";
  }

  async init(paramArray) {
    const params = {
      Names: paramArray,
      WithDecryption: false
    };

    try {
      await this._getParameters(params)
        .then((p) => {
          this.paramValues = this._processParams(p);
        });

      log.config( "Params Loaded=" + JSON.stringify(paramArray));
      return this;
    } catch (err) {
      log.serve(err,false);
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

  getParams(){
    return Object.keys(this.paramValues);
  }


  /**
   * Call the initial SSM to fetch all the parameters
   *
   */
  _getParameters(params) {
    //set up a new promise instead of leveraging the callback
    return new Promise((resolve, reject) => {
      const AWS = require("aws-sdk");
      const ssm = new AWS.SSM({region:this.region});

      ssm.getParameters(params, (error, result) => {
        return (error ? reject(error) : resolve(result));
      });
    });
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