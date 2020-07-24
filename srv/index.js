"use strict";

const express = require("express");
const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const csn = 'gen/csn.json'

const host = "0.0.0.0";
const port = process.env.PORT || 4004;

const app = express();

(async () => {
  
  // serve odata v4
    await cds
    .connect("db") // ensure database is connected!
 
 //Using csn instead of 'db' : At runtime in CF cds doesn't have access to the db folder that
 //contains the DB schema. 
 //So you have to point the proxy to a static resource
 //that is available in srv.
 //Reference app: https://github.com/gregorwolf/bookshop-demo/blob/master/srv/v2server.js#L9
  await cds
    .serve('all')
    .from(csn)
    .in(app)

  // serve odata v2
  app.use(
    proxy({
      // app
      path: 'v2',
      model: csn,
      // target
      port: port
    })
  )
  
// const express = require('express');
// const passport = require('passport');
// const xsenv = require('@sap/xsenv');
// const JWTStrategy = require('@sap/xssec').JWTStrategy;
// //const app = express();
// const services = xsenv.getServices({ uaa:'uaa_Opus' });

// passport.use(new JWTStrategy(services.uaa_Opus));

// app.use(passport.initialize());
// app.use(passport.authenticate('JWT', { session: false }));

// app.get('/user', function (req, res, next) {
//   var user = req.user;
//   console.log(req.user.id);
//   res.send(req.user.id);
//   });

  // start server
  const server = app.listen(port, host, () => console.info('app is listing at ${host}:${port}'));
  server.on("error", error => console.error(error.stack));
})();