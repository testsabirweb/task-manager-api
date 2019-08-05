const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task').Task

const user_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,

        validate(value) {
            if (value < 0) {
                throw new Error('age must be positive')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('invalid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('password must not contain word "password"')
            }
        }

    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer////////////this is used to store images lin the database
    }
}, {
        timestamps: true
    })

user_schema.virtual('my_tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

/*************************USER DEFINED FUNCTION*****************************/
//generate_auth_token
user_schema.methods.generate_auth_token = async function () {////////methods are accessable on the instance
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY)//secret key must be anything u want
    user.tokens = user.tokens.concat({ token: token })
    await user.save()
    return token
}

/////DATA HIDING
/**********this can be done by making another function and calling it expclitily whenever required but 
 * the method used here is overriding toJSON()method so that the function run implicitly */
user_schema.methods.toJSON = function () {
    const user = this
    const user_object = user.toObject()

    delete user_object.password
    delete user_object.tokens
    delete user_object.avatar
    return user_object
}

//find_by_crendentials
user_schema.statics.find_by_credentials = async (email, password) => {/**statics are accessable on the model */
    const user = await User.findOne({ email: email })
    if (!user) {
        throw new Error('unable to login')
    }
    const is_match = await bcrypt.compare(password, user.password)
    if (!is_match) {
        throw new Error('unable to login')
    }
    return user
}
///////////////     MIDDLE WARES//////////////////////
/******************************HASHING******************************************/
user_schema.pre('save', async function (next) {/////////a normal function must be used not an arrow function
    ////////////because arrow function creates problem with "this" keyword
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
    ///////////next()must be called everytime before completing a middleware ,if not callled the function will run forever
    //////////////////////https://mongoosejs.com/docs/middleware.html
})
/****************************DELETE ALL TASK WHEN A USER IS DELETED**********************/

user_schema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })

    next()
})

const User = mongoose.model('User', user_schema)

module.exports = {
    User
}