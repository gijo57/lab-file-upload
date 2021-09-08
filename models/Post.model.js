const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    content: String,
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    picPath: String,
    picName: String
  },
  {
    timestamps: true
  }
);

module.exports = model('User', userSchema);
