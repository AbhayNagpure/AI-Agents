import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type} from '@google/genai';
import dotenv from 'dotenv';
import { getUserById, getUsersByPlan } from './database.js'; //Import our fake database

dotenv.config();

const app = express();
const PORT = 3000;

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY });

//1. Define our databse tools;
const getUserByIdDeclaration = {
    name: 'getUserById',
    description: 'Get a specific user from the database by their ID number.',
    parameters: {
        type: Type.OBJECT,
        properties: { id: { type: Type.STRING, description: "The ID of the user" } },
        required: ['id'],
    },
};

const getUsersByPlanDeclaration= {
    name: 'getUsersByPlan',
    description: 'get a list of all users subscribed to a specific plan',
    parameters: {
        type: Type.OBJECT,
        properties: { plan : {
            type: Type.STRING,
            description: "The plan name",
        }},
        required: ['plan'],

    },
}


//we will server out frontend HTML from a folder called 'public' later
app.use(express.static('public'));

//TODO: we will build our Agentic endpoint here in step 5.3
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        //setup AI agent
        const chat = await ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: "You are a helpful Database Assistant. Use your tools to query the database and answer user questions. Always summarize the data nicely",

                tools: [{ functionDeclarations: [getUserByIdDeclaration, getUsersByPlanDeclaration]}]
            }
        });

        //send the users message to llm
        let response = await chat.sendMessage({
            message: userMessage
        });


         // C. The Agentic Loop
        while (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0]; 
            let apiResult;
            
            if (call.name === 'getUserById') {
                apiResult = getUserById(call.args.id);
            } else if (call.name === 'getUsersByPlan') {
                apiResult = getUsersByPlan(call.args.plan);
            }
            // Send raw data back to LLM
            response = await chat.sendMessage({
                 message: [{
                     functionResponse: { name: call.name, response: { result: apiResult } }
                 }]
            });
        }
        // D. Send the final generated sentence back to the Frontend client!
        res.json({ reply: response.text });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Agent encountered an error." });
    }
});

//start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

