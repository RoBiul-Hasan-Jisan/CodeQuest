const mongoose = require("mongoose");



const UserSchema = new mongoose.Schema(
{

    uid:{
        type:String,
        required:true,
        unique:true
    },


    email:{
        type:String,
        required:true
    },


    displayName:{
        type:String,
        default:""
    },


    profile:{


        streak:{
            type:Number,
            default:0
        },


        totalXP:{
            type:Number,
            default:0
        },


        wordsLearned:{
            type:Number,
            default:0
        },


        lessonsCompleted:{
            type:Number,
            default:0
        },


        proficiencyLevel:{
            type:String,
            default:"Beginner"
        },


        targetLevel:{
            type:String,
            default:"Intermediate"
        }

    },


    stats:{


        totalStudyTime:{
            type:Number,
            default:0
        },


        weeklyStudyTime:[
            {
                day:String,
                hours:Number
            }
        ],



        monthlyProgress:[
            {
                month:String,
                progress:Number
            }
        ],



        achievements:[
            {
                id:String,
                name:String,
                icon:String
            }
        ]

    }



},
{
    timestamps:true
}

);



module.exports = mongoose.model(
    "User",
    UserSchema
);