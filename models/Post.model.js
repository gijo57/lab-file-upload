const { Schema, model } = require('mongoose');

const postSchema = new Schema(
  {
    content: String,
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    picPath: {
      type: String,
      required: true
    },
    picName: String,
    comments: [
      {
        content: {
          type: String,
          required: true
        },
        authorId: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        imagePath: String,
        imageName: String,
        commentedAt: {
          type: Date,
          default: Date.now()
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = model('Post', postSchema);
