# API Dashboard with UI

This is an API website with a modern user interface. The dashboard comes with several example endpoints pre-configured, and you can easily extend it with additional endpoints as needed. The UI includes real-time visitor tracking, request counting, and a clean dashboard interface.

## Features

- 🎨 Modern, responsive dashboard UI
- 📊 Real-time statistics tracking
- 🔄 Live request counter
- 👥 Visitor tracking
- 🤖 AI integration with Google's Gemini
- 📱 Mobile-friendly design
- 🌐 Multiple example API endpoints
- 🗄️ MongoDB integration
- ⚡ Fast and lightweight

## Setup Instructions

### 1. Configure Base URL

In `html/index.html`, locate and update the following lines with your domain:

```html
// Line 235
xhr.open("GET", "https://your-domain.com/visit");

// Line 260
xhr.open("GET", "https://your-domain.com/count");

```

### 2. Configure API Settings

In `api.js`, update the following configurations:

```javascript
// Line 7 - Add your Gemini API key from Google AI Studio
// Get it from: https://aistudio.google.com/u/4/apikey
const genAI = new GoogleGenerativeAI('your-gemini-api-key');

// Line 22 - Add your MongoDB connection URL
// Get it from: https://www.mongodb.com/
const url = 'your-mongodb-connection-string';

```

## Default Endpoints

The dashboard comes with several example endpoints:

- `/visit` - Track visitor count
- `/count` - Track total API requests
- `/ai` - AI-powered endpoints using Gemini
- `/tools` - Utility endpoints
- `/downloader` - Media download endpoints

## Running the Project

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Access the dashboard at:

```
http://localhost:3000
```

## Deploy to Vercel

You can deploy this project to Vercel for free and host it with ease. Click the button below to deploy:



### Steps to Deploy

1. Make sure you have a [Vercel account](https://vercel.com/signup).
2. Click the "Deploy with Vercel" button above.
3. Your project will be deployed, and you will get a live URL.

## Important Notes

- Make sure to keep your API keys secure
- Update MongoDB connection string in a secure way (use environment variables in production)
- The visitor and request counting features require a working MongoDB connection
- The AI features require a valid Gemini API key

## Contributing

Feel free to fork this project and add your own endpoints or improvements. Pull requests are welcome!

## License

This project is open source and available under the MIT License.

