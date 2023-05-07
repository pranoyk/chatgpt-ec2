## chatgpt-ec2

This repo contains code to run ec2 commands with prompts for chatgpt where chatgpt provides only the request body to make the requests

### Create a .envrc file and the below details and add relevant values

```
export OPENAI_API_KEY="<open-ai-secret-key>"
export AWS_ACCESS_KEY_ID="<access-key>"
export AWS_SECRET_ACCESS_KEY="<secret-access-key>"
export AWS_SESSION_TOKEN="<session-token>"
```

### To run the code

```
npm install
```
```
node api.js
```