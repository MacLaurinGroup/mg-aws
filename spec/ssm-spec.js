describe("SSM", function() {

  //---------------------------------------

  beforeAll(async function() {
    process.env.LOG = "CONFIG";
  });

  afterAll(async function() {

  });

  //---------------------------------------

  it("Simple SSM", async function() {

    const ssmClass = require("../ssm");

    const ssm = new ssmClass();
    await ssm.init(["/dev/thecollector"]);

    console.log( ssm.getParams() );

  });

});