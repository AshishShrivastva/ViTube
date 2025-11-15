import express from "express"
import cors from "cors"

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


//import routes
import healthCheckRouter from "./routes/healthcheck.routes.js"


//routes
app.use("/api/v1/healthcheck", healthCheckRouter)

export { app }