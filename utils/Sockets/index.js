const Server = require('socket.io');
const io = new Server();
const config = require('config')
const jwt = require('jsonwebtoken')

var Socket = {
    emit: function (event, data) {
        console.log("************* Socket Emit *************************")
        console.log("EventId:::::::", event, "--------->", data)
        io.sockets.emit(event, data);
    },
    emitToRoom: function (room, event, data) {
        console.log("************* Socket Emit *************************")
        console.log("RoomId::::::::", room)
        console.log("EventId:::::::", event, "--------->", data)
        io.to(room).emit(event, data);
    }
};

let Users = {

}




io.use(async (socket, next) => {
    try {
        if (socket.handshake.query && socket.handshake.query.token) {
            let decoded = jwt.verify(socket.handshake.query.token, config.get("JWT_OPTIONS").SECRET_KEY);
            if (!decoded) {
                console.log('Socket Authentication error')
                socket.disconnect(true);
            }
            else {
                Users[String(socket.id)] = decoded._id
                next();
            }
        }
        else if (socket.handshake.query.type == "monitoring") {
            next()
        }
        else {
            console.log('Socket Authentication error')
            socket.disconnect(true);
        }
    }
    catch (error) {
        console.log('Socket Authentication error')
        socket.disconnect(true);
    }
}).on("connection", function (socket) {
    console.log("************ User Attached **********")

    socket.on("connect", async (data) => {
        try {
            let userId = Users[String(socket.id)]
            console.log("************ User Connect **********", socket.id, userId)
            socket.join(userId);
            io.to(userId).emit("connectOk", { status: 200, message: "Socket connected", data: {} });
        } catch (error) {
            console.log(error)
        }
    });

    socket.on("disconnect", async (data) => {
        try {
            let userId = Users[String(socket.id)]
            socket.leave(userId);
            delete Users[String(socket.id)]
            io.to(userId).emit("disConnect", { status: 200, message: "Socket disconnected", data: {} });
        } catch (error) {
        }
    })

});
exports.Socket = Socket;
exports.io = io;