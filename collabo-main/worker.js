//data section
const rooms = {}; //this is dictionary of containing {id : reference to room object}
let totalInstances = 0
const LIMIT = 1000;


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


class client{
    constructor(ws, room){
        this.ws = ws;
        this.room = room; //reference of room
        this.timer = 120000;
        this.interval = 100;
        this.lastSent = ""; //last text send to client
        this.ws.on('pong', () => {this.timer = 120000});
    }
    async process(){
        totalInstances++;
        this.room.clientCount++;
        while(this.timer>0 && this.room){
            try{
                if(this.timer<=5000 && this.timer%1000==0) this.ws.ping("heartbeat");
                if(this.ws.readyState === 1 && this.lastSent!==this.room.data && this.ws!==this.room.clientEdited) {
                    this.lastSent = this.room.data;
                    this.ws.send(JSON.stringify({"TYPE":"TEXT", "TEXT":this.room.data}))
                }
                if(this.ws.readyState > 1) break;
            }
            catch(err){break;}

            this.timer -= this.interval;
            await delay(this.interval);
        }
        this.room.clientCount--;
        totalInstances--;
        this.ws.close();
        return;
    }
}

class room{
    constructor(id, pwd){
        this.id = id; //room id
        this.pwd = pwd; //room pwd
        this.data = ""; //text
        this.clientEdited = null; //ws of client who has just edited
        this.clientCount = 0; //number of client connected
    }

    async add(ws){
        let newClient = new client(ws, this);
        newClient.process();
        return true;
    }

    async process(){
        let timer = 300000;
        let interval = 1000;
        totalInstances++;
        while(timer>0){
            if(this.clientCount>0) timer = 300000;
            timer -= interval;
            await delay(interval);
        }
        totalInstances--;
        delete rooms[this.id];
    }
}


class roomManager{
    constructor(){}
    
    async createRoom(){
        if (totalInstances>LIMIT) return [];

        let id;
        do {
            id = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
        } while (id in rooms);  // check directly in dictionary
        let pwd = Math.floor(1000 + Math.random() *9000);

        let newRoom = new room(id, pwd);
        newRoom.process();
        rooms[id] = newRoom;
        return [Number(id), Number(pwd)];
    }

    async updateRoom(id, pwd, text, ws){
        try{
            id = Number(id);
            pwd = Number(pwd);
            if((id in rooms)==false) return false; //room is not created
            if(rooms[id].pwd!==pwd) return false; //pwd doesn't match
            rooms[id].data = text;
            rooms[id].clientEdited = ws;
            return true;
        }
        catch(err){return false;}
    }

    async addClient(id, ws, pwd=-1){
        if (totalInstances>LIMIT) return false; //server limit exceed
        try{
            id = Number(id);
            pwd = Number(pwd);
            if((id in rooms)==false) return false; //if room is not created
            if(pwd==-1){
                await rooms[id].add(ws);
                return true;
            }
            if(rooms[id].pwd!==pwd) return false; //if pwd doen't matches
            return await rooms[id].add(ws);
        }
        catch{return false;}
    }

}

module.exports = roomManager;