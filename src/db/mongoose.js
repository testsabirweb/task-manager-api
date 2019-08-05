const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify:false
})




















// const task2=new Task({
//     description:'task2',
// })
// task2.save().then((result)=>{
//     console.log(result)
// }).catch((error)=>{
//     console.log(error)
// })

// const me = new User({
//     name: '  z     ',
//     age: 20,
//     email: '    a@b.com',
//     password: 'qwertyuiop'
// })

// me.save().then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log(error)
// })
