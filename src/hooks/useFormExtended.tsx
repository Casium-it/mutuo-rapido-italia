import { useContext } from "react";
import { FormContext } from "@/contexts/FormContext";
import { Block, Question } from "@/types/form";
import { useNavigate } from "react-router-dom";
import { useBlocks } from "./useBlocks";

export const useFormExtended = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormExtended must be used within a FormProvider');
  }

  const {
    state,
    setActiveBlocks,
    setActiveQuestion,
    setResponse,
    setAnsweredQuestions,
    addAnsweredQuestion,
    setNavigating,
    setBackNavigation,
    addNavigationHistory,
    addDynamicBlock,
    addActiveBlock,
    setBlockActivations,
    addCompletedBlock,
    addPendingRemoval,
    removePendingRemoval
  } = context;

  const blocks = useBlocks();
  const navigate = useNavigate();

  const getResponse = (questionId: string, placeholderKey: string): string | string[] | undefined => {
    return state.responses[questionId]?.[placeholderKey];
  };

  const navigateToNextQuestion = (currentQuestionId: string, leadsTo: string) => {
    const currentBlockId = state.activeQuestion.block_id;
    const currentBlock = blocks.find(block => block.block_id === currentBlockId);

    if (!currentBlock) {
      console.error("Current block not found:", currentBlockId);
      return;
    }

    const currentQuestionIndex = currentBlock.questions.findIndex(q => q.question_id === currentQuestionId);

    if (leadsTo === "next_block") {
      // Find the next active block
      const currentBlockIndex = state.activeBlocks.indexOf(currentBlockId);
      const nextBlockId = state.activeBlocks[currentBlockIndex + 1];

      if (nextBlockId) {
        const nextBlock = blocks.find(block => block.block_id === nextBlockId);
        if (nextBlock) {
          setActiveQuestion({
            block_id: nextBlock.block_id,
            question_id: nextBlock.questions[0].question_id
          });
          navigate(`/form/${nextBlock.block_id}/${nextBlock.questions[0].question_id}`);
          return;
        }
      } else {
        // If there are no more blocks, navigate to the summary
        navigate("/summary");
        return;
      }
    } else {
      // Navigate to a specific question within the current block
      const nextQuestion = currentBlock.questions.find(q => q.question_id === leadsTo);
      if (nextQuestion) {
        setActiveQuestion({
          block_id: currentBlockId,
          question_id: nextQuestion.question_id
        });
        navigate(`/form/${currentBlockId}/${nextQuestion.question_id}`);
        return;
      } else {
        console.error("Next question not found:", leadsTo);
        return;
      }
    }
  };

  const goToQuestion = (blockId: string, questionId: string) => {
    setActiveQuestion({ block_id: blockId, question_id: questionId });
    navigate(`/form/${blockId}/${questionId}`);
  };

  const getPreviousQuestionText = (questionId: string): string | undefined => {
    // Find the block containing the current question
    const currentBlock = blocks.find(block =>
      block.questions.some(question => question.question_id === questionId)
    );
  
    if (!currentBlock) {
      console.error("Current block not found for question:", questionId);
      return undefined;
    }
  
    // Find the current question in the block
    const currentQuestionIndex = currentBlock.questions.findIndex(question => question.question_id === questionId);
  
    if (currentQuestionIndex <= 0) {
      // If it's the first question in the block, return undefined
      return undefined;
    }
  
    // Get the previous question
    const previousQuestion = currentBlock.questions[currentQuestionIndex - 1];
  
    return previousQuestion ? previousQuestion.question_text : undefined;
  };

  const getPreviousQuestion = (questionId: string): Question | undefined => {
    // Find the block containing the current question
    const currentBlock = blocks.find(block =>
      block.questions.some(question => question.question_id === questionId)
    );
  
    if (!currentBlock) {
      console.error("Current block not found for question:", questionId);
      return undefined;
    }
  
    // Find the current question in the block
    const currentQuestionIndex = currentBlock.questions.findIndex(question => question.question_id === questionId);
  
    if (currentQuestionIndex <= 0) {
      // If it's the first question in the block, return undefined
      return undefined;
    }
  
    // Get the previous question
    const previousQuestion = currentBlock.questions[currentQuestionIndex - 1];
  
    return previousQuestion ? previousQuestion : undefined;
  };

  const getInlineQuestionChain = (blockId: string, questionId: string): Question[] => {
    const currentBlock = blocks.find(block => block.block_id === blockId);

    if (!currentBlock) {
      console.error("Current block not found:", blockId);
      return [];
    }

    const currentQuestionIndex = currentBlock.questions.findIndex(q => q.question_id === questionId);
    if (currentQuestionIndex === -1) {
      console.error("Current question not found in block:", questionId, blockId);
      return [];
    }

    const inlineQuestions: Question[] = [];
    for (let i = 0; i < currentQuestionIndex; i++) {
      const question = currentBlock.questions[i];
      if (question.inline === true) {
        inlineQuestions.push(question);
      }
    }

    return inlineQuestions;
  };

  const initializeForm = () => {
    if (blocks.length > 0) {
      const firstBlock = blocks[0];
      setActiveQuestion({
        block_id: firstBlock.block_id,
        question_id: firstBlock.questions[0].question_id
      });
      navigate(`/form/${firstBlock.block_id}/${firstBlock.questions[0].question_id}`);
    }
  };

  return {
    state,
    blocks,
    setActiveBlocks,
    setActiveQuestion,
    setResponse,
    getResponse,
    setAnsweredQuestions,
    addAnsweredQuestion,
    setNavigating,
    setBackNavigation,
    navigateToNextQuestion,
    goToQuestion,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain,
    addNavigationHistory,
    addDynamicBlock,
    addActiveBlock,
    setBlockActivations,
    addCompletedBlock,
    addPendingRemoval,
    removePendingRemoval,
    initializeForm
  };
};
