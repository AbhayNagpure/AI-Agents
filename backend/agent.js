import {GoogleGenAI, Type} from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai =  new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

function get_weather(location){
    console.log(`[nodejs] executing get_weather for ${location}...`);
    //  In a real app, you'd fetch from a weather api.
    return { temperature: 72, unit: "F", conditions: "Sunny" };
}

function get_capital(country){
    console.log(`Node JS executing get_capital for ${country}...`);
    if(country.toLowerCase() === 'japan') return "Tokyo";
    if(country.toLowerCase() === 'france') return "Paris";
    return 'Unknown';
}

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
    
    //2. for country capital
    const getCapitalDeclaration = {
        name: 'get_capital',
        description: 'Get the capital city of a given country.',
        parameters: {
            type: Type.OBJECT,
            properties: {country: { type: Type.STRING }},
            required: ['country'], 
        },
    }



    const chat = ai.chats.create({
        model: 'gemini-2.5-flash-lite',
        config: {
            systemInstruction: "You are a helpful assistant with access to tools. Use your tools to answer the users question",
            tools: [{functionDeclarations: [getWeatherDeclaration, getCapitalDeclaration]}]
        }
    });


    //4. send the initial message
    let response = await chat.sendMessage({ message: "What is the weather like in the capital of Japan? "});

    //5. THE AGENTIC LOOP: keep looping as long as the LLM asks to call a function
    while(response.functionCalls && response.functionCalls.length>0){
        const call = response.functionCalls[0]; //Get the first tool call
        let apiResult;

        if(call.name === 'get_weather'){
            apiResult = get_weather(call.args.location);
        }
        else if(call.name === 'get_capital'){
            apiResult = get_capital(call.args.country);
        }

        console.log(`Node js sending result back to LLM:`, apiResult);

        response = await chat.sendMessage({
            message: [{
                functionResponse: { name: call.name, response: {result: apiResult }}
            }]
        });
    }

    console.log("Agent Final Answer:", response.text);
}
run();