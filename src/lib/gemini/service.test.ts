// Mock Gemini SDK before importing service
jest.mock('@google/generative-ai', () => {
    return {
      GoogleGenerativeAI: jest.fn().mockImplementation(() => {
        return {
          getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: () => JSON.stringify({
                  title: "Test Lesson",
                  conceptExplainer: "Explainer text",
                  analogy: "Like a test",
                  realWorldExample: "Testing in prod",
                  quiz: {
                    question: "Q?",
                    options: ["1", "2", "3", "4"],
                    correctIndex: 0,
                    explanation: "1 is correct"
                  }
                })
              }
            })
          })
        };
      }),
      SchemaType: { OBJECT: 'object', STRING: 'string', ARRAY: 'array', INTEGER: 'integer' },
      HarmCategory: {},
      HarmBlockThreshold: {}
    };
  });
  
  describe('Gemini Service', () => {
      beforeAll(() => {
        process.env.GEMINI_API_KEY = "dummy_key_for_test";
      });
  
      it('should request a micro lesson and return structured object', async () => {
          // Require inside test so it picks up the mocked env and mocked SDK
          const { generateMicroLesson } = require('./service');
          
          const lesson = await generateMicroLesson("Unit Testing", "visual", "None");
          
          expect(lesson).toBeDefined();
          expect(lesson.title).toBe("Test Lesson");
          expect(lesson.quiz).toBeDefined();
          expect(lesson.quiz.options.length).toBe(4);
      });
  });
