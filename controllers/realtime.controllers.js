module.exports.online = function(socket){
    mapList.push({
        socketId : socket.id,
        customId : userId 
    }) ; 
    console.log(`${userId} connect`, socket.id) ;
}
module.exports.disconnect = function() {
    console.log(`${socket.id} disconnect`) ; 
    for (let i = 0 ; i < mapList.length ; i++){
        if (socket.id === mapList[i].socketId){
            mapList.splice(i,1) ; 
        }
    }
}
//////////////////////////////////////////////////
module.exports.joinItemRoom = function(idItemClient){
    socket.join(`${idItemClient}`);
    console.log(socket.id, 'join room' ,idItemClient)
};

module.exports.checkOut = function(data,idItem,clientId){ 

    let temp = db.get('items').find({idItem}).value() ; 

    var client = mapList.find(function(element){
        return element.customId === client ;
    });
    //check Fill date
    if (!data.dateReceive && clientId) {
        io.to(`${socket.id}`).emit('plsFillDate') ; // Can use socket.emit
        return ; 
    } ;  
    //check amount 0
    if (data.amount === '0' && clientId){
        io.to(`${socket.id}`).emit('amount0') ; 
        return ; 
    }
    //check amount
    if ((data.amount > temp.amount)  && clientId) {
        io.to(`${socket.id}`).emit('soldOut') ; // Can use socket.emit
        return ; 
    } ;  
    //check date 
    let dateR = subFunction.convert(data.dateReceive).getTime() ; 
    let dateI = subFunction.convert(temp.dateItem).getTime() ; 
    console.log(dateR,' ' ,dateI);
    if (dateR > dateI){
        socket.emit('errorDate') ; 
        return ; 
    }
    
    // decrease the amount of item and update new amount
    temp.amount -= data.amount
    db.get('items')
        .find({id : idItem})
        .assign({amount : temp.amount})
        .write() ; 
    
    io.in(`${temp.idItem}`).emit('updateNewAmount',temp.idItem,temp.amount);

    //push data to queue of user
    let queue = db.get('users').find({id : temp.owner}).value().queue ; 
    data.idItem = idItem ; 
    data.nameItem = temp.nameItem ; 
    data.cost = temp.priceItem * data.amount  ;
    data.status = 'Đang giao' ; 
    queue.push(data) ; 
    db.get('users')
        .find({id : temp.owner})
        .assign({queue})
        .write() ; 


    // Check seller con online khong    
    let seller = mapList.find(function(element){
        return element.customId === temp.owner ;
    });
    io.to(`${socket.id}`).emit('buySucc') ; 
    if (seller){
        io.to(`${seller.socketId}`).emit('customerSendData',data) ; 
    }
}
module.exports.userRemoveRequest = function(){
    setTimeout(function(){
        let waitingAccept = db.get('items').filter({status : 'Waiting accept'}).value() ;          

        var admin = mapList.find(function(element){
            return element.customId === 'admin' ;
        });
        io.to(`${admin.socketId}`).emit('displayNewRequest',waitingAccept) ; 
    },2000) ; 
}