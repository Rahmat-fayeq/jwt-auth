const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"User"
    },
    refreshToken:{
        type: String,
        required: [true,"RefreshToken is required"],
    }
});

module.exports = mongoose.model("Token",tokenSchema);