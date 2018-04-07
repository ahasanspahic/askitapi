var mongoose     = require('mongoose');
var Schema = mongoose.Schema;

var AnswerSchema   = new Schema({
    text: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    dateTime: { type: Date, default: Date.now},
    likes: [{ body: String, date: Date }],
    dislikes: [{ body: String, date: Date }],
    questionId: { type: Number, required: true }
});

module.exports = mongoose.model('Answer', AnswerSchema);