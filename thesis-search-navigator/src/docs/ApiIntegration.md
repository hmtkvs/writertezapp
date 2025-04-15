
# API Integration Guide

This document explains how to connect your backend to the TeX Thesis Navigator application, particularly for the text rewriting functionality.

## Backend Requirements

Your backend should expose the following endpoints:

1. Search API endpoint to retrieve thesis content
2. Text rewriting API endpoint to process and rewrite selected text

## Configuration

The application is already set up to connect to your backend via the API Settings dialog. Users can configure the backend URL through the UI.

### Setting the API URL

1. Click the "API Settings" button in the top-right corner of the application
2. Enter your backend API URL (e.g., `http://your-api-server.com`)
3. Click "Save changes"

## Backend API Endpoints Implementation

### Search Functionality Endpoints

These endpoints are mocked in the frontend for development purposes but should be implemented in your backend:

- `GET /chapters` - Retrieve thesis chapters
- `GET /stats` - Retrieve document statistics
- `POST /search` - Search thesis content based on query parameters

### Text Rewriting Endpoint

To implement the text rewriting functionality, create an endpoint with the following specifications:

#### Endpoint: `/rewrite-text`

- **Method**: POST
- **Content-Type**: application/json

**Request Payload**:
```json
{
  "selectedText": "The text that was selected by the user",
  "beforeText": "Text appearing before the selection for context",
  "afterText": "Text appearing after the selection for context",
  "userInput": "User's instructions for rewriting (e.g., 'Make this more formal')"
}
```

**Expected Response**:
```json
{
  "rewrittenText": "The rewritten version of the selected text"
}
```

**Status Codes**:
- 200: Success
- 400: Bad request (invalid parameters)
- 500: Server error

## Integration in the Frontend

The application already contains the necessary code to communicate with your backend. Here's an overview of how the text rewriting feature works:

1. User selects text in the search results area
2. User right-clicks and selects "Rewrite Selected Text"
3. The dialog shows the selected text in context
4. User enters instructions for rewriting
5. Frontend sends a request to your `/rewrite-text` endpoint
6. Backend processes the request and returns rewritten text
7. Frontend displays the rewritten text for user review
8. User can edit the rewritten text if needed
9. User clicks "Apply Changes" to confirm

## Code Example

Here's how the request to your backend will be formed in the application:

```typescript
// This is already implemented in TextHighlighter.tsx
const handleRewriteRequest = async () => {
  if (!selectionData) return;
  
  try {
    setIsProcessing(true);
    
    // Convert selection data to JSON
    const payload = {
      selectedText: selectionData.selectedText,
      beforeText: selectionData.beforeText,
      afterText: selectionData.afterText,
      userInput: userCommand
    };
    
    // This is the actual request to your backend
    const response = await fetch(`${apiUrl}/rewrite-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    // The rewritten text from your backend
    setRewrittenText(data.rewrittenText);
    
  } catch (error) {
    console.error('Error rewriting text:', error);
    // Error handling...
  } finally {
    setIsProcessing(false);
  }
};
```

## Testing Your Integration

1. Set the API URL to your backend server
2. Select some text in the search results
3. Right-click and choose "Rewrite Selected Text"
4. Enter rewriting instructions
5. Check that your backend receives the request with correct parameters
6. Verify that the dialog shows the rewritten text from your backend

## Customizing the UI

If you need to customize the rewriting interface, you can modify these key files:

- `src/components/TextHighlighter.tsx` - Handles the text selection and context menu
- `src/components/RewriteConfirmDialog.tsx` - The dialog that displays the original text, rewriting instructions, and the result

## Additional Notes

- The application currently includes mocked functionality for development purposes
- Error handling is implemented to display toast notifications when API communication fails
- All communication with your backend will be through the API URL configured in the settings
