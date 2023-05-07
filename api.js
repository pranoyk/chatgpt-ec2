import { Configuration, OpenAIApi } from "openai";
import express from "express";
import AWS from 'aws-sdk';
import {createInstance} from "./createInstance.js"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();

app.use(express.json());

let prompt = `Run the following as a conversation to capture all the needed data.
Return a request body assuming the api call is from a javascript sdk.
Provide the method that needs to be called in 'Method: "methodName"' format.
Close the conversation if the human is satisfied.

Human: Can you help me with creating an ec2 instance?
AI: Sure! Firstly, which region do you want to launch the instance in? Some common regions are US East (N. Virginia), US West (Oregon), EU (Ireland), and Asia Pacific (Singapore), among others. 
Human: I would like to launch it in US East
AI: Sure! The next thing I need to know is what type of instance you want to create. EC2 instances come in different sizes and specifications, depending on your needs. For example, you can choose an instance optimized for compute, memory, storage, or GPU workloads.
Human: Can you give me a examples of micro or nano instances
AI: Sure! Here are some examples of micro instances t3.micro, t2.micro and nano instances t4d.nano, t3.nano
Human: I want any micro instance
AI: Great! To create an EC2 instance using the Amazon EC2 API, you will need to make a request to the Amazon EC2 service with the necessary parameters. Here is the request body:
Region: us-east-1
{
  "ImageId": "ami-02858011c7df8d87e", 
  "InstanceType": "t3.micro",
  "MinCount": 1,
  "MaxCount": 1
}
Human: i-097c35391326756a1
AI: We have created an instance as requested with instance id - i-097c35391326756a1
`

app.post('/chat', async (req, res) => {
  const { input } = req.body;

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: generatePrompt(input),
      temperature: 0.6,
      max_tokens: 200
    });

    let message = response.data.choices[0].text;
    prompt = `${prompt} \nHuman: ${input} ${message}`
    console.log(message)
    if (message.includes(`"ImageId": `)) {
      let open = message.indexOf('{')
	    let close = message.lastIndexOf('}')
      let request = message.substring(open, close + 1)
      let region = message.match(/Region: .*/g)[0].split(': ')[1]
      try {
        const data = await createInstance(region, request)
        console.log(data);
        let instanceId = data.Instances[0].InstanceId;
        console.log("Created instance", instanceId);
        // Add tags to the instance
        let tagParams = {Resources: [instanceId], Tags: [
          {
              Key: 'Name',
              Value: 'GPT sample'
          }
        ]};
        // Create a promise on an EC2 service object
        var tagPromise = new AWS.EC2({apiVersion: '2016-11-15'}).createTags(tagParams).promise();
        // Handle promise's fulfilled/rejected states
        tagPromise.then(
          function(data) {
            console.log("Instance tagged");
          }).catch(
            function(err) {
            console.error(err, err.stack);
          }); 
        try {
          const resp = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: generatePrompt(instanceId),
            temperature: 0.6,
            max_tokens: 200
          });
          message = resp.data.choices[0].text;
          prompt = `${prompt} \nHuman: ${instanceId} ${message}`;
          console.log(" -- >> ", message);
          res.send({ message })
          return
        } catch (error) {
          console.log(error);
          res.sendStatus(500);
          return
        }
      } catch (err) {
        console.error(err, err.stack);
        res.sendStatus(500);
        return
      }
    } else {
    // console.log("\n\n\n", prompt)
    res.send({ message });
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

function generatePrompt(input) {
  return `${prompt}
Human:${input}`;
}

app.listen(3000, () => console.log('Server listening on port 3000'));
