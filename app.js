import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import authenticationRouter from "./routers/AuthenticationRouter.js";
import notebookRouter from "./routers/NotebookRouter.js";
import { errorHandling } from "./middleware/ErrorHandlingMiddleWare.js";
import { unknownRoute } from "./middleware/NotFoundMiddleWare.js";
import fileContentRouter from "./routers/FileContentRouter.js";
import quoteRouter from "./routers/QuoteRouter.js"
import sharedNotebookRouter from "./routers/SharedNotebookRouter.js";
import { InitializeDatabase } from "./db/db.js";
import { setupSocketIO } from "./services/SocketIOHandlerService.js";
import path from "path";
const app = express();
const server = createServer(app); 
const io = new Server(server); 
const port = process.env.PORT || 8080; // Set by Docker Entrypoint or use 8080
app.use("/notebooks", express.static("notebooks"));//Geef files door images.

app.use(express.json());
app.use(express.static("public"));

try 
{
  InitializeDatabase();
} 
catch
{
  process.exit(1); 
}

app.use("/authentication", authenticationRouter);
app.use("/notebook", notebookRouter);
app.use("/shared", sharedNotebookRouter);
app.use("/files", fileContentRouter);
app.use("/quote",quoteRouter);

setupSocketIO(io);

// Middleware for unknown routes
// Must be last in pipeline
app.use(unknownRoute);

// Middleware for error handling
app.use(errorHandling);

// App starts here
server.listen(port,()=>{});