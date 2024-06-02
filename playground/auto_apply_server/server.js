const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./logger');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 3000;
const prompt = `
You are a helpful assistant in filling out job application form.
Given an application html, you will return in kv dictionary in json format that indicates which dom element (queried by id or name) should set what information. 
Below is the applicant personal information
- first name: Carlos
- last name: Martinez
- email: carlos.martinez@gmail.com
- phone: 6503829190
- resume url: http://localhost:3000/uploads/resume.pdf

For example, given html snippet that looks like below

<div class="css-gagzqb e3fv9vj3"><span class="css-1fwfv3z e3fv9vj16">* Required</span>
    <div class="css-1q1iwny ehzq0h31"><input type="text" id="first_name" name="first_name" placeholder="Sabrina"
            autocomplete="off" class="css-1ltm62a ehzq0h32 invalid" value=""><label for="first_name" required=""
            class="css-1jnsje2 ehzq0h30">First Name *</label></div>
    <div class="css-1q1iwny ehzq0h31"><input type="text" id="last_name" name="last_name" placeholder="Spellman"
            autocomplete="off" class="css-1ltm62a ehzq0h32" value=""><label for="last_name" required=""
            class="css-1jnsje2 ehzq0h30">Last Name *</label></div>
    <div class="css-vr4639 e1mp8doj2"><input type="file" name="resume" id="resume"
            accept="application/pdf, .doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain"
            tabindex="-1" class="css-tgm4fq e1mp8doj0"><label for="resume" class="css-rkxwfy e1mp8doj1">Resume*<label
                class="css-v81dp0 e3fv9vj7">(.pdf, .doc, .docx, .txt)</label><button class="css-d91bjd e3fv9vj5">Upload
                Resume</button></label></div>            
</div>

you would return json dict below
{
    "first_name": "Carlos",
    "last_name": "Martinez",
    "resume": "http://localhost:3000/uploads/resume.pdf"
}
`;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Use morgan to log requests
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

const openaiApiKey = process.env.OPENAI_API_KEY;

const makeOpenAIRequest = async (data, retries = 5) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', data, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            }
        });
        logger.info(`OpenAI Response: ${JSON.stringify(response.data)}`);
        return response.data;
    } catch (error) {
        logger.error(`OpenAI Error: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
        if (error.response && error.response.status === 429 && retries > 0) {
            logger.warn(`Rate limit hit. Retrying in ${2 ** (5 - retries)} seconds...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** (5 - retries)));
            return makeOpenAIRequest(data, retries - 1);
        } else {
            throw error;
        }
    }
};

app.post('/parse-form', async (req, res) => {
    const { formHtml } = req.body;
    logger.info(`Received form HTML: ${formHtml}`);
    const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: prompt
            },
            {
                role: 'user',
                content: `Please help with this application form html: ${formHtml}`
            }
        ],
        max_tokens: 1500
    };

    try {
        const openAIResponse = await makeOpenAIRequest(requestData);
        // Ensure the response is a JSON object
        const filledFormData = JSON.parse(openAIResponse.choices[0].message.content);
        res.json(filledFormData);
    } catch (error) {
        logger.error(`Error processing form: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
        res.status(500).send('Error processing the form');
    }
});

app.listen(port, () => {
    logger.info(`Backend server is running at http://localhost:${port}`);
});
