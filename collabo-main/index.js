//Multiple Editor and Multiple Viewer Mode

//TYPE to server: (TYPE=JOIN, ID, PWD), (TYPE=CREATE), (TYPE=UPDATE, ID, PWD, TEXT), (TYPE=PING)
//TYPE from server : (TYPE=PONG), (TYPE=TEXT, TEXT), (TYPE=STATUS, STATUS=OK/FAIL, ACK), (TYPE=DATA, ID, PWD)

require('dotenv').config()
const WebSocket = require('ws');
const roomManager = require("./worker")
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000

const server = http.createServer(app);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const wss = new WebSocket.Server({ server });
const data = new roomManager();

wss.on('connection', (ws) => {

  ws.on('message', async (message) => {

    let msg = JSON.parse(message);

    if(msg["TYPE"] == "JOIN"){
        let rslt;
        if("PWD" in msg) rslt = await data.addClient(msg["ID"], ws, msg["PWD"]);
        else rslt = await data.addClient(msg["ID"], ws);
        if(rslt) ws.send(JSON.stringify({"TYPE":"STATUS", "STATUS":"OK"}));
        else{
          ws.send(JSON.stringify({"TYPE":"STATUS", "STATUS":"FAIL"}));
          ws.close();
        }
        return;
    }

    if(msg["TYPE"] == "CREATE"){
        let info = await data.createRoom();
        if(info.length==0){
            ws.send(JSON.stringify({"TYPE":"STATUS", "STATUS":"FAIL", "ACK":"server is full"}));
            ws.close();
            return;
        }
        ws.send(JSON.stringify({'TYPE' : "DATA", 'ID' : info[0], 'PWD' : info[1]}));
        data.addClient(info[0], ws, info[1]);
        return;
    }

    if(msg["TYPE"] == "UPDATE"){
        let status = await data.updateRoom(msg["ID"], msg["PWD"], msg["TEXT"], ws);
        if(status==false) {
          ws.send(JSON.stringify({"TYPE":"STATUS", "STATUS":"FAIL"}));
          ws.close();
        }
        else ws.send(JSON.stringify({"TYPE":"STATUS", "STATUS":"OK"}));
        return;
    }
  })
})



server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
