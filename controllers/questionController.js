import Question from "../models/question.js";


// @desc    Get all questions
// @route   GET /questions
// @access  Public
export const getAllQuestions = async (req, res, next) => {
  const questions = await Question.find()
    .populate("specialty", "name")
    .populate("patient", "name")
    .populate("answers.doctor", "name image")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions,
  });
};

// @desc    Get questions by client
// @route   GET /questions/client/:clientId
// @access  Private (Client)
export const getQuestionsByClient = async (req, res, next) => {
  const { clientId } = req.params;

  const questions = await Question.find({ patient: clientId })
    .populate("specialty", "name")
    .populate("answers.doctor", "name image")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions,
  });
};


// @desc    Create new question
// @route   POST /questions
// @access  Public / Client
export const createQuestion = async (req, res, next) => {
  const { specialty, title, description } = req.body;

  const question = await Question.create({
    specialty,
    title,
    description,
    patient: req.user?._id || null, // لو Anonymous
  });

  res.status(201).json({
    success: true,
    data: question,
  });
};


// @desc    Delete question
// @route   DELETE /questions/:id
// @access  Private (Owner / Admin)
export const deleteQuestion = async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  await question.deleteOne();
  res.status(200).json({
    success: true,
    message: "Question deleted successfully",
  });
};

// @desc    Get questions by specialty
// @route   GET /questions/specialty/:specialtyId
// @access  Public
export const getQuestionsBySpecialty = async (req, res, next) => {
  const { specialtyId } = req.params;

  const questions = await Question.find({ specialty: specialtyId })
    .populate("patient", "name")
    .populate("answers.doctor", "name profileImage")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions,
  });
};


export const answerQuestion = async (req, res) => {
  try {
    const { answer, doctor } = req.body;
    const questionId = req.params.id;

    if (!answer || !doctor) {
      return res.status(400).json({
        success: false,
        message: "Answer and doctor are required",
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // منع نفس الدكتور يجاوب مرتين
    const alreadyAnswered = question.answers.find(
      (a) => a.doctor.toString() === doctor
    );

    if (alreadyAnswered) {
      return res.status(400).json({
        success: false,
        message: "Doctor already answered this question",
      });
    }

    question.answers.push({
      doctor,
      answer,
    });

    question.isAnswered = true;
    await question.save();

    res.status(201).json({
      success: true,
      message: "Answer added successfully",
      data: question,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};