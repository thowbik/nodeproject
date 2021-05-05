import "reflect-metadata";
import { createConnection, getRepository } from "typeorm";
import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";
import * as WebRequest from 'web-request';

import swaggerUi from 'swagger-ui-express';
// import * as swaggerDocument from './swagger.json';

import swaggerJSDoc from "swagger-jsdoc";
import { User } from "./entity/User";
import { STATUS_CODES } from "http";
import { NotificationMessageInfo } from "./entity/NotificationMessageInfo";
import { fail } from "assert";
import QuizController from "./controllers/QuizController";
import AuthController from "./controllers/AuthController";

// Swagger set up
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "REST API for OVC",
      version: "1.0.0",
      description:
        "This is the REST API for OVC",
      // license: {
      //   name: "MIT",
      //   url: "https://choosealicense.com/licenses/mit/"
      // },
      contact: {
        name: "Swagger",
        url: "https://swagger.io",
        email: "Info@SmartBear.com"
      }
    },
    servers: [
      {
        url: "http://localhost:9500"
      }
    ]
  },
  apis: ["src/entity/User.ts", "src/routes/user.ts"]
};


const run = async () => {
  const interval = setInterval(async () => {
    clearInterval(interval);
    //Get users from database
    const notificationMessageInfoRepository = getRepository(NotificationMessageInfo);

    const notificationMessageInfoList = await notificationMessageInfoRepository.find({
      where: { StatusType: true, NotificationType: 1, MessageStatusType: 1 },
    });
    notificationMessageInfoList.forEach(async element => {
      let noOfAttempts = 1;
      element.MessageStatusType = 2;//processing
      notificationMessageInfoRepository.save(element);
      while (element.NoOfAttempts <= element.NoOfRetries && element.MessageStatusType == 2) {
        
        let reslut = await WebRequest.get('http://api.cutesms24.com/sms.aspx?email=yuvarajesh.r@xenovex.com&pw=sms@2017&sid=XENCNT&to='+element.Recipient+'&msg='+element.Message);

        //let reslut = await WebRequest.get('https://api.cutesms24.com/sms.aspx?email=yuvarajesh.r@xenovex.com&pw=sms@2017&sid=XENCNT&msg=' + element.Message + '&to=' + element.Recipient);
        //let reslut={statusCode:0,content:''}
        element.NoOfAttempts = noOfAttempts;
        if (reslut && reslut.statusCode == 200 && reslut.content.indexOf("SMS SENT") != -1) {
          element.MessageStatusType = 3; //success
        }
        else
        element.MessageStatusType = 4; //fail
        noOfAttempts++;
      }
      
      notificationMessageInfoRepository.save(element);
    });
    console.log(` Worker is working...` + notificationMessageInfoList.length + "  " + new Date())
    run();
  }, 2000);
}

const mysql = require('mysql');

var mysqlConnection = mysql.createPool({
  connectionLimit: 50,
  waitForConnections: true,
  queueLimit: 0,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test',
  wait_timeout:28800,
  connect_timeout:10,
  multipleStatement: true
  // debug:true
});


//run().catch(error => console.error(error));
//Connects to the Database -> then starts the express
mysqlConnection.createConnection()
  .then(async connection => {
    // Create a new express application instance
    const app = express();

    // Call midlewares
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());
    const specs = swaggerJSDoc(options);
    app.use("/docs", swaggerUi.serve);
    app.get(
      "/docs",
      swaggerUi.setup(specs, {
        explorer: true
      })
    );

    //Set all routes from routes folder
    app.use("/", routes);

    app.listen(9500, () => {
      console.log("Server started on port 9500!");
    });
    QuizController.storeQstnsInCache();
    AuthController.storeUserLoginInfoInCache();
  })
  .catch(error => {
    console.log(error)
  });