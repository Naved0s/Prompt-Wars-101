import { generateMicroLesson } from '../lib/gemini/service';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => JSON.stringify({ title: "Test", conceptExplainer: "Test", analogy: "Test", realWorldExample: "Test", quiz: { question: "Q", options: ["A", "B"], correctIndex: 0, explanation: "E" } }) }
      })
    })
  }))
}));

describe('Gemini Service', () => {
  it('should generate a lesson successfully', async () => {
    // Mock env to bypass throw
    process.env.GEMINI_API_KEY = 'test_key';
    const lesson = await generateMicroLesson('Java', 'visual');
    expect(lesson).toBeDefined();
    expect(lesson.title).toBe("Test");
  });
});
