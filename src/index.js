const express = require('express')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

const user_router = require('./routers/user')
const task_router = require('./routers/task')


// app.use((req,res,next)=>{////////////this is a userdefined middleware function
//     res.status(503).send('site is under maintainance please check after sometime')
// })

app.use(express.json())
app.use(user_router)
app.use(task_router)

app.listen(port, () => {
    console.log('server started at port  ' + port)
})
