module.exports = govind =>(req,res,next) =>{

    Promise.resolve(govind(req,res,next)).catch(next);
}