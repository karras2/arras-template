# Arras Template, Made by Oblivion#3940
This is a heavily optimized and improved upon version of https://github.com/nepphhh/arrasio.<br>
As such, it's very different from the source code.<br>
The client and server are all split up into many different files.
Each file's name should give you a description of what it does.
## Setting up a static client + server on one project
1) In the server's `config.json`, find the `host` property and set it to the proper host (eg. `localhost`, `arras.io`, `your-project.herokuapp.com`, `your-thing.glitch.me`).
2) Make sure the `port` property is correct in the `config.json` file.<br> Please note that if you're using a hosting solution that sets the port for you, it will be the value of `process.env.PORT`. In `global.js`, this is taken care of for you.
3) `npm start` or `node server/index.js`
## Setting up a standalone client somewhere else
1) Make sure you have the `standaloneClient` folder.
2) In the `index.js` file of that folder, make sure the `ip` property on line `9` is set to the complete host and port of the server you want the client to connect to. (eg `127.0.0.1:3000`, `234.23.123.123:3001`, `your-project.herokapp.com`)
3) `npm run host`
## Setting up a standalone server with a standalone client
1) Make sure the steps above are complete
2) In the server's `config.json`, find the `host` property and set it to the proper host (eg. `localhost`, `arras.io`, `your-project.herokuapp.com`, `your-thing.glitch.me`).
3) Make sure the `port` property is correct in the `config.json` file.<br> Please note that if you're using a hosting solution that sets the port for you, it will be the value of `process.env.PORT`. In `global.js`, this is taken care of for you.
4) Make sure the `servesStatic` property is set to `false` in the `config.json` file.
5) `npm start` or `node server/index.js`