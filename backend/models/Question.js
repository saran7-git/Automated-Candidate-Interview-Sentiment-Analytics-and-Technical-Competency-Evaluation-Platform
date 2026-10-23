import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      enum: ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'SQL', 'Python', 'Java', 'General'],
    },
    skill: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    expectedConcepts: {
      type: [String],
      required: [true, 'Expected concepts are required for automated evaluation'],
      default: [],
    },
    keywords: {
      type: [String],
      default: [],
    },
    sampleAnswer: {
      type: String,
      required: [true, 'Sample answer is required'],
    },
    marks: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

export const Question = mongoose.model('Question', questionSchema);
