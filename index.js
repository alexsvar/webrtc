const app = require('http').createServer(handler)
const io = require('socket.io').listen(app)
const fs = require('fs')
let peers = []
let peerSPDs = []

app.listen(8111)

function handler(req, res) {
  fs.readFile(__dirname + '/public/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500)
      return res.end('index.html not found...')
    }

    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(data)
  })
}

io.sockets.on('connection', socket => {
  console.log('Peer connected')

  if (peers.length === 0) {
    socket.emit('client_socket', '0')
    peers.push(socket)
  }

  else if (peers.length === 1) {
    peers.push(socket)
    socket.emit('client_socket', peerSPDs[0])
  }

  socket.on('server_socket', data => {
    if (peers.length < 3) {
      peerSPDs.push(data)
      socket.broadcast.emit('client_socket', data)
    }
  })

  socket.on('disconnect', () => {
    peers = []
    peerSPDs = []
    let sockets = io.sockets.clients()
    for (let i = 0; i < sockets.length; i++) {
      sockets[i].emit('client_socket', 'reset')
    }
  })
})