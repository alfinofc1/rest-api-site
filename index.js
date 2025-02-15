/**
 * Copyright (C) 2024.
 * Licensed under the License;
 * You may not use this file except in compliance with the License.
 * It is supplied in the hope that it may be useful.
 * @project_name : BK9-API
 * @author : BK9 <https://github.com/BK9dev>
 * @description : API website with multiple endpoints and modern UI dashboard.
 * @version 0.0.1
 **/


const express = require("express");
const cors = require("cors");
const app = express();
const api = require("./api");
const path = require('path');

app.use(express.static(path.join(__dirname, 'html')));
app.use(cors());
app.use(express.json());
app.set("json spaces", 2);

app.use(api);

app.listen(process.env.PORT || 3000, () => {
  console.log("BK9 API working now ...");
});

module.exports = app;
