import { generateMicroLesson } from '@/lib/gemini/service';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            title: 'Java Basics',
            conceptExplainer: 'Java is a programming language.',
            analogy: 'analogy',
            realWorldExample: 'example',
            quiz: {
                question: 'What is Java?',
                options: ['A language', 'A database', 'An OS', 'A browser'],
                correctIndex: 0,
                explanation: 'Java is a programming language.',
            },
          }),
        },
      }),
    }),
  })),
}));

describe('Gemini Lesson Generation', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test";
  });
  it('generates a lesson with title and content', async () => {
    const lesson = await generateMicroLesson('Java', 'beginner');
    expect(lesson).toHaveProperty('title');
    expect(lesson).toHaveProperty('conceptExplainer');
    expect(lesson).toHaveProperty('quiz');
  });

  it('generates quiz with correct structure', async () => {
    const lesson = await generateMicroLesson('Python', 'intermediate');
    expect(lesson.quiz).toHaveProperty('question');
    expect(lesson.quiz).toHaveProperty('options');
    expect(lesson.quiz.options).toHaveLength(4);
    expect(lesson.quiz).toHaveProperty('correctIndex');
  });

  it('handles API errors gracefully', async () => {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    GoogleGenerativeAI.mockImplementationOnce(() => ({
      getGenerativeModel: () => ({
        generateContent: jest.fn().mockRejectedValue(new Error('API quota exceeded')),
      }),
    }));
    await expect(generateMicroLesson('Java', 'beginner')).rejects.toThrow();
  });
});
