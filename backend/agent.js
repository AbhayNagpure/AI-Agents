import {GoogleGenAI, Type} from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai =  new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

function get_weather(location){
    console.log(`[nodejs] executing get_weather for ${location}...`);
    //  In a real app, you'd fetch from a weather api.
    return { temperature: 72, unit: "F", conditions: "Sunny" };
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
    

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash-lite',
        config: {
            tools: [{functionDeclarations: [getWeatherDeclaration]}]
        }
    });

    console.log("User: What is the weather like in tokyo right now?");

    //4. send the initial message
    let response = await chat.sendMessage({ message: "What is the weather like in Tokyo right now? "});

    //5. THE AGENTIC LOOP: keep looping as long as the LLM asks to call a function
    while(response.functionCalls && response.functionCalls.length>0){
        const call = response.functionCalls[0]; //Get the first tool call
        
        if(call.name === 'get_weather'){
            //A. Execute out node js function with the argiments the LLM provided.
            const apiResult = get_weather(call.args.location);

            //B. Send the result back to the LLM;
            console.log(`[Node js] Sending result back to LLM: ${apiResult}`);

            response = await chat.sendMessage({
                message: [{
                    functionResponse: {
                        name: call.name,
                        response: {result: apiResult}
                    }
                }]
            })
        }
    }

    console.log("Agent Final Answer:", response.text);
}
run();