require("dotenv").config();
Object.assign(global, process.env)
require('./storage')();
require("./db")();
const morgan = require('morgan');
const express = require('express')

const userRouter = require("./routes/user-route")
const auctionRouter = require("./routes/auction-route")
const offerRouter = require("./routes/offer-route")
const notificationRouter = require("./routes/notification-route")
const domainRouter = require("./routes/domain-route")
const cardRouter = require("./routes/card-route")

var cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')




function requestMonitoring(req, res, next) {
    console.log(new Date().toISOString().slice(11, -1) + ' path:', req._parsedUrl.href, 'body:', req.body, 'params:', req.params, 'query:', req.query);
    next();
}


const server = express()
server.use(cors())
server.use(express.json());
server.use(express.static('client'))
//server.use(requestMonitoring);
morgan.token('body', (req, res) => JSON.stringify(req.body));
server.use(morgan(':method :url :status :response-time ms - :body '))
server.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
server.use("/users", userRouter)
server.use("/auctions", auctionRouter)
server.use("/offers", offerRouter)
server.use("/notifications", notificationRouter)
server.use("/domains", domainRouter);
server.use("/cards", cardRouter);



server.use(function (err, req, res, next) {
    console.error(err.message); // Log error message in our server's console
    if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
    res.status(err.statusCode).send(err.message); // All HTTP requests must have a response, so let's send back an error with its status code and message
});


server.listen(global.PORT, () => {
    console.log(`https://localhost:${global.PORT} is listening.`)
})