
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Code } from '@/components/ui/code';

const ApiIntegrationGuide = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">API Integration Guide</h1>
      <p className="text-slate-600 mb-6">Connect your backend to the TeX Thesis Navigator application</p>
      
      <Tabs defaultValue="overview" className="w-full mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="rewrite">Text Rewriting</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Basic requirements for connecting your backend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The TeX Thesis Navigator application is designed to connect with a backend API for searching through thesis content and 
                providing text rewriting capabilities. This guide will help you implement the necessary endpoints.
              </p>
              
              <h3 className="text-lg font-medium mt-4">Configuration</h3>
              <p>Users can set the API URL in the API Settings dialog:</p>
              <ol className="list-decimal ml-6 space-y-2">
                <li>Click the "API Settings" button in the top-right corner</li>
                <li>Enter your backend API URL (e.g., <code>http://your-api-server.com</code>)</li>
                <li>Click "Save changes"</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Required API Endpoints</CardTitle>
              <CardDescription>
                Endpoints your backend needs to implement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-slate-50 p-4 border border-slate-200">
                <h3 className="font-medium">Search Functionality</h3>
                <ul className="ml-4 list-disc space-y-2 mt-2">
                  <li><code>GET /chapters</code> - Retrieve thesis chapters</li>
                  <li><code>GET /stats</code> - Retrieve document statistics</li>
                  <li><code>POST /search</code> - Search thesis content</li>
                </ul>
              </div>
              
              <div className="rounded-md bg-slate-50 p-4 border border-slate-200">
                <h3 className="font-medium">Text Rewriting</h3>
                <ul className="ml-4 list-disc space-y-2 mt-2">
                  <li><code>POST /rewrite-text</code> - Process and rewrite selected text</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rewrite">
          <Card>
            <CardHeader>
              <CardTitle>Text Rewriting API</CardTitle>
              <CardDescription>
                Implementation details for the text rewriting endpoint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Endpoint Specification</h3>
              <p><strong>URL:</strong> <code>/rewrite-text</code></p>
              <p><strong>Method:</strong> POST</p>
              <p><strong>Content-Type:</strong> application/json</p>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium">Request Payload</h3>
              <pre className="bg-slate-800 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
{`{
  "selectedText": "The text that was selected by the user",
  "beforeText": "Text appearing before the selection for context",
  "afterText": "Text appearing after the selection for context",
  "userInput": "User's instructions for rewriting (e.g., 'Make this more formal')"
}`}
              </pre>
              
              <h3 className="text-lg font-medium mt-4">Expected Response</h3>
              <pre className="bg-slate-800 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
{`{
  "rewrittenText": "The rewritten version of the selected text"
}`}
              </pre>
              
              <h3 className="text-lg font-medium mt-4">Status Codes</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>200: Success</li>
                <li>400: Bad request (invalid parameters)</li>
                <li>500: Server error</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="implementation">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Example</CardTitle>
              <CardDescription>
                How to implement the backend for text rewriting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your backend implementation will need to process the text rewriting requests and return the rewritten text.
                Here's a basic example using Python with Flask:
              </p>
              
              <pre className="bg-slate-800 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
{`from flask import Flask, request, jsonify
from flask_cors import CORS
import openai  # or any other AI service you prefer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/rewrite-text', methods=['POST'])
def rewrite_text():
    data = request.json
    
    # Extract data from request
    selected_text = data.get('selectedText', '')
    before_text = data.get('beforeText', '')
    after_text = data.get('afterText', '')
    user_input = data.get('userInput', '')
    
    # Use your preferred AI service to rewrite the text
    # This is just a placeholder implementation
    rewritten_text = process_rewrite_request(
        selected_text, 
        before_text, 
        after_text, 
        user_input
    )
    
    return jsonify({"rewrittenText": rewritten_text})

def process_rewrite_request(selected_text, before_text, after_text, user_input):
    # Implement your text rewriting logic here
    # This could use OpenAI, a custom model, or other NLP approaches
    
    # Example with OpenAI (you would need to add your API key)
    prompt = f"""
    I need to rewrite the following text according to these instructions: {user_input}
    
    CONTEXT BEFORE: {before_text}
    TEXT TO REWRITE: {selected_text}
    CONTEXT AFTER: {after_text}
    
    Rewritten version:
    """
    
    # Call your AI service here
    # response = openai.Completion.create(engine="text-davinci-003", prompt=prompt, max_tokens=500)
    # return response.choices[0].text.strip()
    
    # Placeholder return for demonstration
    return f"AI rewritten version of: {selected_text}"

if __name__ == '__main__':
    app.run(debug=True, port=8000)
`}
              </pre>
              
              <p className="text-sm text-slate-500 mt-2">
                Note: This is a simplified example. Your implementation may require additional error handling, 
                authentication, and other features depending on your requirements.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">Frontend Integration Flow</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <ol className="list-decimal ml-6 space-y-4">
          <li>User selects text in the search results area</li>
          <li>User right-clicks and selects "Rewrite Selected Text"</li>
          <li>The dialog shows the selected text in context</li>
          <li>User enters instructions for rewriting</li>
          <li>Frontend sends a request to your <code>/rewrite-text</code> endpoint</li>
          <li>Backend processes the request and returns rewritten text</li>
          <li>Frontend displays the rewritten text for user review</li>
          <li>User can edit the rewritten text if needed</li>
          <li>User clicks "Apply Changes" to confirm</li>
        </ol>
      </div>
      
      <h2 className="text-2xl font-semibold mt-8 mb-4">Testing Your Integration</h2>
      <Card>
        <CardContent className="pt-6">
          <ol className="list-decimal ml-6 space-y-2">
            <li>Set the API URL to your backend server</li>
            <li>Select some text in the search results</li>
            <li>Right-click and choose "Rewrite Selected Text"</li>
            <li>Enter rewriting instructions</li>
            <li>Check that your backend receives the request with correct parameters</li>
            <li>Verify that the dialog shows the rewritten text from your backend</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiIntegrationGuide;
