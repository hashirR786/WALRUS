import Groq from 'groq-sdk';

// We initialize Groq lazily or inside the function so it doesn't crash on startup if GROQ_API_KEY is missing
let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not defined in environment variables');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
};

/**
 * Generates productivity suggestions based on current tasks using the Groq API.
 * @param {Array} tasks - Array of task objects from MongoDB
 * @returns {Promise<Object>} suggestions object
 */
export const generateSuggestions = async (tasks) => {
  // If no tasks are present, provide a helpful baseline request
  const taskListText = tasks.length > 0 
    ? tasks.map(t => `- ${t.title} (${t.completed ? 'Completed' : 'Pending'})`).join('\n')
    : 'No current tasks. Ready to start planning!';

  try {
    const groq = getGroqClient();

    const systemPrompt = `You are a productivity assistant.
Analyze the user's current tasks.
Categorize them into:
- Study
- Career
- Personal

Provide:
1. Highest priority task (pick one from current tasks or suggest a crucial next step)
2. Missing tasks that should be added (crucial helper tasks)
3. Five useful next tasks
4. Productivity recommendations (tips)

Return the response in JSON format. The JSON structure MUST exactly match:
{
  "priority": "Title of highest priority task",
  "missing_tasks": [
    "Task description 1",
    "Task description 2"
  ],
  "suggested_tasks": [
    "Task 1",
    "Task 2",
    "Task 3",
    "Task 4",
    "Task 5"
  ],
  "tips": [
    "Recommendation 1",
    "Recommendation 2"
  ]
}`;

    const userPrompt = `Here are my current tasks:\n${taskListText}\n\nAnalyze and provide suggestions.`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq API');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Groq Service Error:', error.message);
    
    // Provide structured fallback data if Groq is unavailable or misconfigured,
    // so the app still functions beautifully and prompts the user.
    const isApiKeyMissing = !process.env.GROQ_API_KEY;
    
    return {
      priority: tasks.find(t => !t.completed)?.title || "Create your first task!",
      missing_tasks: isApiKeyMissing 
        ? ["Add GROQ_API_KEY to your backend/.env file to get AI suggestions"]
        : ["Review your schedule", "Organize workspace"],
      suggested_tasks: [
        "Plan your daily objectives",
        "Take a 5-minute break",
        "Set reminders for important deadlines",
        "Check off completed items",
        "Review weekly progress"
      ],
      tips: isApiKeyMissing
        ? [
            "AI suggestions are currently in demo mode. Create a backend/.env file and set GROQ_API_KEY=your_key to unlock personalized AI features.",
            "Break large projects down into manageable daily sub-tasks."
          ]
        : [
            "Keep tasks short and action-oriented (e.g., 'Draft' instead of 'Work on').",
            "Focus on completing your highest-priority task first."
          ]
    };
  }
};

/**
 * Answers coach questions based on task list and the question query using the Groq API.
 * @param {String} question - User question
 * @param {Array} tasks - Current task list
 * @returns {Promise<String>} Coach advice
 */
export const askCoach = async (question, tasks) => {
  const taskListText = tasks.length > 0 
    ? tasks.map(t => `- ${t.title} (${t.completed ? 'Completed' : 'Pending'})`).join('\n')
    : 'No current tasks.';

  try {
    const groq = getGroqClient();

    const systemPrompt = `You are a productivity and career coach. The user is asking for advice on their preparation or tasks.
Analyze their query in the context of their current task list:
${taskListText}

Provide concise, highly actionable, step-by-step advice. Keep your answer encouraging and under 3-4 short paragraphs. Highlight key actions in bold.`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    return response.choices[0]?.message?.content || 'Sorry, I could not generate advice at this moment.';
  } catch (error) {
    console.error('Groq Coach Error:', error.message);
    const isApiKeyMissing = !process.env.GROQ_API_KEY;
    if (isApiKeyMissing) {
      return "Please configure your GROQ_API_KEY in the backend/.env file to unlock direct AI coaching answers.";
    }
    return `Could not connect to AI Coach. Error: ${error.message}`;
  }
};

