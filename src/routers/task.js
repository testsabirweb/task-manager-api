const express = require('express')
const router = new express.Router()
const Task = require('../models/task').Task
const auth = require('../middleaware/auth')

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,///////////////ES6 syntax it copies all the data of anything after ...
        owner: req.user._id
    })
    try {
        const not_needed = await task.save()///////we can directly write   ""'await user.save()'""
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }

})
//GET /tasks?completed=true
//GET /tasks?limit=3&skip=4
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'my_tasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
        }).execPopulate()//this as well as code below also works well
        res.send(req.user.my_tasks)

        // const tasks = await Task.find({ owner: req.user._id })
        // res.send(tasks)


    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {////////////////   : is a route handler
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id: _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    ////////////////////////////////////////////////////////////
    const updates = Object.keys(req.body)
    const allowed_updates = ['description', 'completed']
    const is_valid_operation = updates.every((update) => {
        return allowed_updates.includes(update)
    })

    if (!is_valid_operation) {
        return res.status(400).send({ error: 'invalid attribute' })
    }


    ////////////////////////////////////////////////////////////
    const _id = req.params.id
    try {
        //const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        /////the above code cannot able to run MIDDLEWARE so the new code is below
        /********************************************/
        const task = await Task.findOne({ _id: _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()
        /********************************************/
        res.send(task)
    } catch (e) {
        res.status(400).send(e)

    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)

    }
    catch (e) {
        res.status(500).send()
    }
})

module.exports = router