var mongoose     = require('mongoose');
var Schema = mongoose.Schema;

var QuestionSchema   = new Schema({
    text: { type: String, required: [true, "Question text is missing."] },
    headline: { type: String, required: [true, "Question headline is required."] },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    dateTime: { type: Date, default: Date.now},
    likes: [{ body: String, date: Date }],
    likeCount: { type: Number, default: 0},
    dislikes: [{ body: String, date: Date }],
    dislikeCount: { type: Number, default: 0 },
    answers: [{ 
        text: String, userId: String, username: String, 
        likes: [{userId : String}], likeCount: { type: Number, default: 0}, 
        dislikes: [{userId : String}], dislikeCount: { type: Number, default: 0 } }]
});

module.exports = mongoose.model('Question', QuestionSchema);