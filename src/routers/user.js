const express = require('express')
const router = new express.Router()
const sharp = require('sharp')
const User = require('../models/user').User
const auth = require('../middleaware/auth')
const multer = require('multer')
const email_service = require('../emails/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        const not_needed = await user.save()///////we can directly write   ""'await user.save()'""
        email_service.sendWelcomeEmail(user.email, user.name)
        const token = await user.generate_auth_token()
        res.status(201).send({ user: user, token: token })
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.find_by_credentials(req.body.email, req.body.password)
        const token = await user.generate_auth_token()//////lower case user is used because this property refers to a particular user not for the user class itself
        res.send({ user: user, token: token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()

    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutALL', auth, async (req, res) => {
    try {
        // req.user.tokens = req.user.tokens.find((token) => {
        //     return token.token === req.token
        // })
        req.user.tokens = []/////////another great method
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowed_updates = ['name', 'email', 'password', 'age']
    const is_valid_operation = updates.every((update) => {
        return allowed_updates.includes(update)
    })

    if (!is_valid_operation) {
        return res.status(400).send({ error: 'invalid attribute' })
    }
    ////////////////////////////////////////////////////////////
    //const _id = req.params.id
    try {
        // //const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        // /////the above code cannot able to run MIDDLEWARE so the new code is below
        // /********************************************/
        // const user = await User.findById(_id)
        updates.forEach((update) => {
            req.user[update] = req.body[update]//////dynamically change the value of the attribute which is provided by the request//n3-12-03/10:50
        })
        await req.user.save()
        /*********************************************/

        // if (!user) { we just authenticate the user so this code is not needed
        //     return res.status(404).send()
        // }
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)

    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()/**after refactoring the above code */
        email_service.sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)

    }
    catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    // dest: 'avatars',///destination is not defined implicitly so that we can store data to database in the form of buffer
    limits: {
        fileSize: 1000000/////////size of file
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {//regex101.com  ///n3-14-03  11:08
            return cb(new Error('only images are supported'))
        }
        cb(undefined, true)

    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {//upload.single is a middle ware
    const buffer = await sharp(req.file.buffer).resize({ width: 300, height: 300 }).png().toBuffer()
    req.user.avatar = buffer
    // req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {//////this function runs if middleware throws an error
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image,png')
        res.send(user.avatar)
    } catch (e) {

    }
})

module.exports = router