const mongoose = require('mongoose')
const validator = require('validator')

const task_schema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }

},{
    timestamps:true
})

task_schema.pre('save', async function (next) {
    const task = this
    /*********every thing u want to do before saving the task
     * 
     * 
     * for more info see models/user.js 
     */

    next()
})

const Task = mongoose.model('Task', task_schema)

module.exports = {
    Task
}