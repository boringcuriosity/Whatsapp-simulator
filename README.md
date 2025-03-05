# WhatsApp Chat Simulator

A sophisticated WhatsApp chat simulator built with React, TypeScript, and Vite that allows you to create and preview realistic WhatsApp conversations.

## Features

- 📱 Realistic WhatsApp UI with phone frame
- 💬 Multiple message types support:
  - Text messages
  - Business messages with interactive buttons
  - Image messages with captions
  - Links and highlighted text
- ⚡ Interactive conversation flows
- 🎭 Dual sender support (you and contact)
- 🔄 Message status indicators (sending, sent, delivered, read)
- ⌨️ Contact typing indicators
- ⏱️ Customizable message delays
- 📝 Visual and JSON editors for conversation flows
- 🔍 Live preview functionality
- 📱 Responsive design

## Tech Stack

- React 19
- TypeScript
- Vite
- Styled Components
- date-fns
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Basic Controls

- **Contact Settings**: Customize the contact's name, avatar, and status
- **Message Types**:
  - Text Message: Simple text messages from either sender
  - Business Message: Interactive messages with buttons and highlighted text
  - Conversation Flow: Create complex message sequences with timing

### Creating Conversation Flows

1. Switch to the "Conversation Flow" tab
2. Use either the Visual Editor or JSON Editor
3. Add messages with customizable:
   - Sender
   - Message type (text/button/image)
   - Delay timing
   - Business message formatting
4. Preview your flow before running
5. Start the conversation to see it play out

### Message Features

- Highlight text using asterisks (*text*)
- Add clickable buttons with custom actions
- Include images with optional captions
- Set custom delays between messages
- Control message delivery status

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build

### Project Structure

```
src/
├── components/
│   ├── ControlPanel.tsx    # Message control interface
│   └── PhonePreview.tsx    # WhatsApp UI simulator
├── types.ts                # TypeScript definitions
├── App.tsx                # Main application component
└── main.tsx              # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- WhatsApp for UI inspiration
- React team for the amazing framework
- All contributors and users of this project
