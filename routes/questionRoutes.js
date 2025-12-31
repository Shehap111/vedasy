import express from "express";
import {
  getAllQuestions,
  getQuestionsByClient,
  createQuestion,
  deleteQuestion,
  getQuestionsBySpecialty,
  answerQuestion,
} from "../controllers/questionController.js";


const router = express.Router();

/**
 * Public Routes
 */
router.get("/", getAllQuestions);
router.get("/specialty/:specialtyId", getQuestionsBySpecialty);

/**
 * Client Routes
 */
router.get("/client/:clientId",  getQuestionsByClient);
router.post("/",  createQuestion);
router.delete("/:id", deleteQuestion);
router.patch("/:id/answer", answerQuestion);
    
export default router;
