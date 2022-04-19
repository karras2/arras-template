const [express, cors, expressMinify, fs, path] = ["express", "cors", "express-minify", "fs", "path"].map(require);
const server = express();
server.use(expressMinify());
server.use(cors());
server.use(express.static(path.join(__dirname, "../public")));
server.get("/serverData.json", function(request, response) {
    response.json({
        ok: true,
        ip: "localhost:3000"
    });
});
server.listen(process.env.PORT || 5000, function() {
    console.log("Express + WS server listening on port", process.env.PORT || 5000);
});