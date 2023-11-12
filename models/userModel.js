const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: [true, 'username is required']
    },
    email:{
        type: String,
        required:[true,"email is required"],
        unique: [true,"email must be unique"]
    },
    password:{
        type: String,
        required: [true,"password is required"],
    }
},{
    timestamps: true
});

module.exports = mongoose.model('User',userSchema);