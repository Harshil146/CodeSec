# Phainance - Finance Management App

Phainance is a comprehensive finance management app built with React Native and Expo that helps users manage their personal and group finances efficiently. The app provides features for expense tracking, group expense management, and AI-powered financial insights.

## Features

- **Authentication**
  - Secure login and registration
  - Profile management with customizable settings

- **Personal Finance Management**
  - Track individual expenses and income
  - Categorize transactions
  - View spending patterns and history

- **Group Finance Management**
  - Create and manage expense groups
  - Split bills among group members
  - Automatic expense settlement calculations
  - Group chat for financial discussions

- **AI-Powered Insights**
  - Smart analysis of spending patterns
  - Personalized financial recommendations
  - Monthly trend analysis
  - Export financial reports

## Tech Stack

- **Frontend**: React Native (Expo)
- **UI Components**: React Native Paper
- **Navigation**: React Navigation
- **State Management**: React Context
- **AI Integration**: Google Gemini AI
- **File Export**: react-native-excel-export

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- Google Gemini AI API Key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/phainance.git
   cd phainance
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your API keys:
   ```
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npx expo start
   ```

## Environment Setup

1. Install Expo Go on your mobile device
2. Scan the QR code from the terminal with:
   - iOS: Camera app
   - Android: Expo Go app

## Project Structure

```
phainance/
├── app/                    # Main application code
│   ├── components/         # Reusable components
│   ├── hooks/             # Custom hooks
│   ├── context/           # React Context providers
│   ├── utils/             # Helper functions
│   └── types/             # TypeScript type definitions
├── assets/                # Static assets
└── docs/                  # Documentation
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## Development Guidelines

- Follow the established code style
- Write meaningful commit messages
- Add appropriate documentation
- Test your changes thoroughly

## Available Scripts

- `npm start`: Start the Expo development server
- `npm run android`: Start the app in Android emulator
- `npm run ios`: Start the app in iOS simulator
- `npm run web`: Start the app in web browser
- `npm test`: Run tests
- `npm run lint`: Run ESLint

## Troubleshooting

Common issues and their solutions:

1. **Metro bundler issues**
   ```bash
   npm start -- --reset-cache
   ```

2. **Dependencies issues**
   ```bash
   npm install --force
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For support or queries, contact us at:
- Email: support@phainance.app
- GitHub: [Project Repository](https://github.com/yourusername/phainance)

## Acknowledgments

- React Native community
- Expo team
- Google Gemini AI team
- All contributors and supporters

