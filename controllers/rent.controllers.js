var db = require('../db') ; 
var subFunction = require('./subFunction') ; 
var nodemailer = require('../nodemailer') ; 
module.exports.rent = function(req,res){
    let customer = res.locals.user ; 
    let tab = req.params.tab ;
    let type ;
    if (tab === 'all'){
        type = 'TẤT CẢ' ; 
        var data = db.get('rents').filter((element)=>{
           return (db.get('users').find({id : element.owner}).value().status === 'Normal')
        }).filter({status : 'On sale'}).value() ; 
        res.render('rent/index.pug',{data ,type,customer}) ; 
        return ; 
    }
    else {
        if (tab === 'food') type = 'THỰC PHẨM' ;   
        if (tab === 'deco') type = 'TRANG TRÍ' ;   
        if (tab === 'fashion') type = 'THỜI TRANG' ;   
        if (tab === 'digital') type = 'THIẾT BỊ ĐIỆN TỬ' ;   
        if (tab === 'others') type = 'KHÁC' ;   

        var data = db.get('rents').filter((element)=>{
            return (db.get('users').find({id : element.owner}).value().status === 'Normal')
         }).filter({status : 'On sale' , type}).value() ; 
        res.render('rent/index.pug',{data ,type,customer}) ; 
        return ;
    }
    
}
module.exports.checkOut = function(req,res){
    let customer = res.locals.user ; 
    let item = db.get('rents').find({idItem : req.params.id}).value() ; 
    let user = db.get('users').find({id : item.owner}).value() ; 
    res.render('rent/checkOut.pug',{item,user,customer}) ; 
}
module.exports.postCheckOut = function(req,res){
    
    let customer = req.body ; 
    if (customer.id ==='') customer.id = 'anonymous' ; 

    let item = db.get('rents').find({idItem : req.params.id}).value() ; 
    let date = subFunction.getDay() ; 
    let time =  subFunction.getTime() ; 
    db.get('history').push({
        action : 'Buy - Sell' ,
        item : item , 
        objectInfo : customer , 
        subject : item.owner,
        object : customer.id, 
        date , 
        time 
    }).write() ; 
    nodemailer.send(customer,item) ; 
    setTimeout(function(){
        res.redirect('/rent/checkOut/' + req.params.id) ; 
    }, 2000);
    
}
module.exports.postComment = function(req,res){
    let comment = { cmt : req.body.comment , user : req.params.idUser }  ; 
    let newCmt = db.get('rents').find({idItem : req.params.id}).value().comment.push(comment) ; 
    db.get('rents').find({idItem : req.params.id}).assign({cmt : newCmt}).write() ; 
    res.redirect('/rent/checkOut/' + req.params.id) ; 
}