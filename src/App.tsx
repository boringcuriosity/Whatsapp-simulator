import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import PhonePreview from './components/PhonePreview'
import ControlPanel from './components/ControlPanel'
import { Message, Contact, ConversationStep } from './types'

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
`

const PreviewSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f0f2f5;
  overflow: auto;

  @media (max-width: 768px) {
    padding: 10px;
    min-height: 100vh;
  }
`

const ControlSection = styled.div<{ isCollapsed: boolean }>`
  flex: ${props => props.isCollapsed ? '0' : '1'};
  width: ${props => props.isCollapsed ? '48px' : 'auto'};
  min-width: ${props => props.isCollapsed ? '48px' : '500px'};
  padding: ${props => props.isCollapsed ? '10px' : '20px'};
  background-color: white;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  max-height: 100vh;
  transition: all 0.3s ease;
  position: relative;

  @media (max-width: 768px) {
    min-width: 100%;
    max-height: none;
    order: 1;
    box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.05);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ToggleButton = styled.button<{ isCollapsed: boolean }>`
  position: ${props => props.isCollapsed ? 'static' : 'absolute'};
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--whatsapp-teal);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  padding: 0;
  
  img {
    width: 20px;
    height: 20px;
    transform: rotate(${props => props.isCollapsed ? '0deg' : '180deg'});
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: scale(1.1);
    background: var(--whatsapp-green);
  }
`

const ManualControls = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  z-index: 1000;

  @media (max-width: 768px) {
    bottom: auto;
    top: 20px;
    right: 10px;
  }
`

const ArrowButton = styled.button<{ disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--whatsapp-teal);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.1)'};
    background: var(--whatsapp-green);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const PlayPauseButton = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #128C7E;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  padding: 0;

  @media (max-width: 768px) {
    bottom: auto;
    top: 20px;
    left: 10px;
  }

  img {
    width: 24px;
    height: 24px;
  }

  &:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
  }
`

function App() {
  const [contact, setContact] = useState<Contact>({
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'online',
    lastSeen: new Date()
  });
  const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Lifted state from ControlPanel
  const [contactSettingsOpen, setContactSettingsOpen] = useState(false);
  const [messageType, setMessageType] = useState<'text' | 'business' | 'conversation'>('conversation');
  const [newTextMessage, setNewTextMessage] = useState({
    text: '',
    sender: 'me' as 'me' | 'them'
  });
  const [businessMessage, setBusinessMessage] = useState({
    text: '',
    options: ['Yes', 'No'],
    phoneNumber: '+91 984XXXXX34',
    highlightedText: '',
    sender: 'them' as 'me' | 'them'
  });
  const [conversationFlow, setConversationFlow] = useState(`[
    {
      "text": "Is +91 984XXXXX34 linked to your business bank accounts?",
      "sender": "them",
      "isBusinessMessage": true,
      "delay": 1000
    },
    {
      "text": "Yes",
      "sender": "them",
      "type": "button",
      "isBusinessMessage": true,
      "delay": 0
    },
    {
      "text": "No",
      "sender": "them",
      "type": "button",
      "isBusinessMessage": true,
      "delay": 0
    },
    {
      "text": "Yes",
      "sender": "me",
      "delay": 2000
    },
    {
      "text": "We will now take your bank account, PAN & GST details via an RBI licensed Account Aggregator.",
      "sender": "them",
      "delay": 1500
    },
    {
      "text": "This will allow us to underwrite you and give you your loan offer!",
      "sender": "them",
      "delay": 1000
    },
    {
      "text": "Please click on this link to share consent",
      "sender": "them",
      "delay": 1000
    },
    {
      "text": "Share consent",
      "sender": "them",
      "type": "button",
      "isBusinessMessage": true,
      "delay": 0,
      "link": "#"
    }
  ]`);
  const [steps, setSteps] = useState<ConversationStep[]>(() => {
    try {
      return JSON.parse(conversationFlow);
    } catch {
      return [];
    }
  });

  // For conversation playback
  const [isPlayingConversation, setIsPlayingConversation] = useState(false);
  const [conversationQueue, setConversationQueue] = useState<ConversationStep[]>([]);
  const [savedConversation, setSavedConversation] = useState<ConversationStep[]>([]);

  // Lift remaining local states from ControlPanel
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
  const [conversationError, setConversationError] = useState('');

  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  // Add a useEffect to automatically update savedConversation when steps change
  useEffect(() => {
    if (steps.length > 0) {
      setSavedConversation(steps);
      // If we're already displaying messages, keep them
      // Otherwise initialize currentStepIndex to -1 to start fresh
      if (messages.length === 0) {
        setCurrentStepIndex(-1);
      }
    }
  }, [steps]);

  // Add these new functions for manual control
  const handlePreviousStep = () => {
    // Allow going back if there are messages
    if (messages.length === 0) return;
    
    // Ensure savedConversation is populated if not already
    if (savedConversation.length === 0 && steps.length > 0) {
      setSavedConversation(steps);
    }
    
    // Remove the last message
    setMessages(prev => prev.slice(0, -1));
    setCurrentStepIndex(prev => Math.max(-1, prev - 1));
  };

  const handleNextStep = () => {
    // If we have steps, use them directly
    if (steps.length > 0) {
      // If no messages yet, start with first message
      if (messages.length === 0) {
        const firstMessage = steps[0];
        addMessageImmediately(firstMessage);
        setCurrentStepIndex(0);
        return;
      }

      // If we haven't started yet
      if (currentStepIndex === -1) {
        const firstMessage = steps[0];
        addMessageImmediately(firstMessage);
        setCurrentStepIndex(0);
        return;
      }

      // If we're not at the end
      if (currentStepIndex < steps.length - 1) {
        const nextStep = steps[currentStepIndex + 1];
        addMessageImmediately(nextStep);
        setCurrentStepIndex(prev => prev + 1);
      }
    }
  };

  // Helper function to add message immediately without delays
  const addMessageImmediately = (step: ConversationStep) => {
    // Reset any previous typing indicators
    if (contact.status === 'typing') {
      setContact(prev => ({ ...prev, status: 'online' }));
    }

    // Show typing indicator only briefly for visual feedback
    if (step.sender === 'them' && step.type !== 'button') {
      setContact(prev => ({ ...prev, status: 'typing' }));
      // Reset status after a very short delay
      setTimeout(() => {
        setContact(prev => ({ ...prev, status: 'online' }));
      }, 200);
    }

    // Format and add the message immediately
    let formattedText = step.text;
    if (step.highlightedText) {
      formattedText = formattedText.replace(
        step.highlightedText,
        `*${step.highlightedText}*`
      );
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: formattedText,
      sender: step.sender,
      timestamp: new Date(),
      status: 'sent',
      type: step.type || 'text',
      isBusinessMessage: step.isBusinessMessage,
      buttonText: step.buttonText,
      link: step.link,
      imageUrl: step.imageUrl,
      caption: step.caption
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const updateContact = (updatedContact: Partial<Contact>) => {
    setContact(prev => ({ ...prev, ...updatedContact }))
  }

  const addMessage = (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'sent',
      type: message.type || 'text',
      ...message
    }
    
    setMessages(prev => [...prev, newMessage])
  }

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
    )
  }

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const clearAllMessages = () => {
    setMessages([])
  }

  // Modified startConversation to handle the current step index properly
  const startConversation = (steps: ConversationStep[]) => {
    setSavedConversation(steps);
    setIsPlayingConversation(true);
    setConversationQueue(steps);
    setCurrentStepIndex(-1);
    setMessages([]); // Clear messages when starting new conversation
  }

  const handlePlayConversation = () => {
    // If currently playing, pause the conversation
    if (isPlayingConversation) {
      setIsPlayingConversation(false);
      return;
    }

    // If there's an existing queue but paused, resume it
    if (conversationQueue.length > 0) {
      setIsPlayingConversation(true);
      return;
    }

    // Clear existing messages when starting a new conversation from the sidebar
    // Only do this when explicitly starting from scratch, not when resuming
    setMessages([]);

    // If there's a saved conversation, start it from the beginning
    if (savedConversation.length > 0) {
      // Create a fresh copy of the saved conversation
      setConversationQueue([...savedConversation]);
      setIsPlayingConversation(true);
      return;
    }

    // Only use default conversation if no saved conversation exists
    const defaultConversation: ConversationStep[] = [
      {
        text: "Is +91 984XXXXX34 linked to your business bank accounts?",
        sender: "them",
        isBusinessMessage: true,
        delay: 1000
      },
      {
        text: "Yes",
        sender: "them",
        type: "button",
        isBusinessMessage: true,
        delay: 0
      },
      {
        text: "No",
        sender: "them",
        type: "button",
        isBusinessMessage: true,
        delay: 0
      }
    ];
    
    setSavedConversation(defaultConversation);
    // Create a fresh copy of the default conversation
    setConversationQueue([...defaultConversation]);
    setIsPlayingConversation(true);
  };

  // Update useEffect to work better with manual controls
  useEffect(() => {
    if (!isPlayingConversation || conversationQueue.length === 0) return;

    const nextStep = conversationQueue[0];
    const delay = nextStep.delay ?? 1000;
    
    if (nextStep.sender === 'them' && nextStep.type !== 'button') {
      setContact(prev => ({ ...prev, status: 'typing' }));
    }
    
    const timer = setTimeout(() => {
      if (nextStep.sender === 'them') {
        setContact(prev => ({ ...prev, status: 'online' }));
      }
      
      let formattedText = nextStep.text;
      if (nextStep.highlightedText) {
        formattedText = formattedText.replace(
          nextStep.highlightedText,
          `*${nextStep.highlightedText}*`
        );
      }
      
      const newMessage: Message = {
        id: Date.now().toString(),
        text: formattedText,
        sender: nextStep.sender,
        timestamp: new Date(),
        status: 'sent',
        type: nextStep.type || 'text',
        isBusinessMessage: nextStep.isBusinessMessage,
        buttonText: nextStep.buttonText,
        link: nextStep.link,
        imageUrl: nextStep.imageUrl,
        caption: nextStep.caption
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentStepIndex(prev => prev + 1);
      setConversationQueue(prev => prev.slice(1));
    }, delay);
    
    return () => clearTimeout(timer);
  }, [isPlayingConversation, conversationQueue]);

  return (
    <AppContainer>
      <PreviewSection>
        <PhonePreview 
          contact={contact}
          messages={messages}
        />
      </PreviewSection>
      <ControlSection isCollapsed={isControlPanelCollapsed}>
        {isControlPanelCollapsed ? (
          <ButtonGroup>
            <ToggleButton 
              isCollapsed={isControlPanelCollapsed}
              onClick={() => setIsControlPanelCollapsed(false)}
              title="Show message controls"
            >
              <img src="/settings icon.svg" alt="Toggle controls" />
            </ToggleButton>
          </ButtonGroup>
        ) : (
          <>
            <ToggleButton 
              isCollapsed={isControlPanelCollapsed}
              onClick={() => setIsControlPanelCollapsed(true)}
              title="Hide message controls"
            >
              <img src="/settings icon.svg" alt="Toggle controls" />
            </ToggleButton>
            <ControlPanel
              contact={contact}
              messages={messages}
              onUpdateContact={updateContact}
              onAddMessage={addMessage}
              onUpdateMessage={updateMessage}
              onDeleteMessage={deleteMessage}
              onClearMessages={clearAllMessages}
              onStartConversation={startConversation}
              // Pass down lifted state
              contactSettingsOpen={contactSettingsOpen}
              setContactSettingsOpen={setContactSettingsOpen}
              messageType={messageType}
              setMessageType={setMessageType}
              newTextMessage={newTextMessage}
              setNewTextMessage={setNewTextMessage}
              businessMessage={businessMessage}
              setBusinessMessage={setBusinessMessage}
              conversationFlow={conversationFlow}
              setConversationFlow={setConversationFlow}
              steps={steps}
              setSteps={setSteps}
              // New lifted state
              showJsonPreview={showJsonPreview}
              setShowJsonPreview={setShowJsonPreview}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              previewMessages={previewMessages}
              setPreviewMessages={setPreviewMessages}
              conversationError={conversationError}
              setConversationError={setConversationError}
            />
          </>
        )}
      </ControlSection>
      <PlayPauseButton
        onClick={handlePlayConversation}
        title={isPlayingConversation ? "Pause conversation" : "Start/Resume conversation"}
      >
        <img 
          src={isPlayingConversation ? "/pause icon.svg" : "/play icon.svg"} 
          alt={isPlayingConversation ? "Pause" : "Play"} 
        />
      </PlayPauseButton>
      <ManualControls>
        <ArrowButton 
          onClick={handlePreviousStep}
          disabled={messages.length === 0}
          title="Previous message"
        >
          <ArrowLeft />
        </ArrowButton>
        <ArrowButton 
          onClick={handleNextStep}
          disabled={
            steps.length === 0 || // No conversation flow available
            (currentStepIndex >= steps.length - 1 && messages.length > 0) // At the end of conversation
          }
          title="Next message"
        >
          <ArrowRight />
        </ArrowButton>
      </ManualControls>
    </AppContainer>
  );
}

export default App;