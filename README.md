# mg-aws

Collection of AWS utilities for making working with Amazon's Web Services a little easier.

## ssm - Secure System Manager

A utility that retrieves a list of values from the Property Manager and caches them.  It is designed for properties that have been stored in JSON format in the property manager.

```
const ssmClass = require("mg-aws/ssm");

// Create the instance and load the parameters
const ssm = new ssmClass();
await ssm.init(["/dev/thecollector"]);

// Calls to individual items
console.log( ssm.getParams() );
console.log( ssm.getParam("thecollector") );
console.log( ssm.getParam("thecollector")["database"] );
console.log( ssm.getParam("thecollector")["username"] );
```