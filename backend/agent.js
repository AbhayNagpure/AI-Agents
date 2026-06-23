import {GoogleGenAI, Type} from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai =  new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function run(){
    //1. define the menu(schema) of our tool.
    const getWeatherDeclaration = {
        name: 'get_weather',
        description: 'get the current weather for a given location',
        parameters: {
            type: Type.OBJECT,
            properties: {
                location: {
                    type: Type.STRING,
                    description: 'The city name eg. paris', 
                },
            },
            required: ['location'],
        },
    };

    //2. Ask the llm a question and provide the tool in the config.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "What is the weather like in Tokyo right now",
        config: {
            tools: [{functionDeclarations: [getWeatherDeclaration]}]
        }
    })

    ///3. look at what the llm returned
    console.log("Did the LLM returned text?", response.text);
    console.log("Did the LLM ask to call a function?", JSON.stringify(response.functionCalls, null, 2));
}
run();