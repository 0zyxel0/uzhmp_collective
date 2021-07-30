require("dotenv").config();
const express = require("express"),
  swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");
  YAML = require('yamljs')
  swaggerDocument = YAML.load('./routes/openapi.yaml');

const app = express();

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.NODE_PORT_PROD || 8899;
app.listen(PORT);

console.debug("Server listening on port: " + PORT);