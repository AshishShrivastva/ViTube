import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(
    cors({                                          //middleware cors(Cross-Origin Resource Sharing)
        origin: process.env.CORS_ORIGIN,
        credentials: true 
    })
)

// common express middlewares
app.use(express.json({limit: "16kb"}))                          
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))                               //for storing img or css
app.use(cookieParser())

//import routes
import healthCheckRouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js"
//import logoutRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"


//routes
app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/users", userRouter)
//app.use("'api/v1/users", logoutRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetRouter)
//app.use(errorHandler)
export { app }