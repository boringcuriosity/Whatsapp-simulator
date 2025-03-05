import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { MessageSquarePlus, Play, Pause } from 'lucide-react'
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
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--whatsapp-teal);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  padding: 0;
  
  &:hover {
    transform: scale(1.1);
    background: var(--whatsapp-green);
  }

  svg {
    width: 18px;
    height: 18px;
    transform: ${props => props.isCollapsed ? 'rotate(0deg)' : 'rotate(45deg)'};
    transition: transform 0.3s ease;
  }
`

const PlayButton = styled(ToggleButton)<{ isPlaying?: boolean }>`
  margin-top: 8px;
  background: ${props => props.isPlaying ? 'var(--whatsapp-teal)' : 'var(--whatsapp-green)'};
  transform: rotate(0deg) !important;
  
  svg {
    transform: rotate(0deg) !important;
  }

  &:hover {
    background: ${props => props.isPlaying ? 'var(--whatsapp-green)' : 'var(--whatsapp-teal)'};
  }
`

function App() {
  const [contact, setContact] = useState<Contact>({
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'online',
    lastSeen: new Date()
  })
  const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey there! How are you?',
      sender: 'them',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'read',
      type: 'text'
    },
    {
      id: '2',
      text: 'I\'m good, thanks! How about you?',
      sender: 'me',
      timestamp: new Date(Date.now() - 1000 * 60 * 14),
      status: 'read',
      type: 'text'
    },
    {
      id: '3',
      text: 'I\'m doing well. Just wanted to check in.',
      sender: 'them',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      status: 'read',
      type: 'text'
    }
  ])

  // For conversation playback
  const [isPlayingConversation, setIsPlayingConversation] = useState(false);
  const [conversationQueue, setConversationQueue] = useState<ConversationStep[]>([]);
  const [savedConversation, setSavedConversation] = useState<ConversationStep[]>([]);

  useEffect(() => {
    // Process the next message in the conversation queue
    if (isPlayingConversation && conversationQueue.length > 0) {
      const nextStep = conversationQueue[0];
      const delay = nextStep.delay ?? 1000; // Default delay of 1 second if not specified
      
      // Show typing indicator for the sender if it's not a button and it's from "them"
      if (nextStep.sender === 'them' && nextStep.type !== 'button') {
        setContact(prev => ({ ...prev, status: 'typing' }));
      }
      
      const timer = setTimeout(() => {
        // Reset typing indicator
        if (nextStep.sender === 'them') {
          setContact(prev => ({ ...prev, status: 'online' }));
        }
        
        // Format text with highlighted text if needed
        let formattedText = nextStep.text;
        if (nextStep.highlightedText) {
          formattedText = formattedText.replace(
            nextStep.highlightedText,
            `*${nextStep.highlightedText}*`
          );
        }
        
        // Add the message
        const newMessage: Message = {
          id: Date.now().toString(),
          text: formattedText,
          sender: nextStep.sender,
          timestamp: new Date(),
          status: 'sent',
          type: nextStep.type || 'text',
          isBusinessMessage: nextStep.isBusinessMessage,
          buttonText: nextStep.buttonText,
          link: nextStep.link, // Add the link property
          imageUrl: nextStep.imageUrl,
          caption: nextStep.caption
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Remove this step from the queue
        setConversationQueue(prev => prev.slice(1));
      }, delay);
      
      return () => clearTimeout(timer);
    } else if (isPlayingConversation && conversationQueue.length === 0) {
      // Conversation playback is complete
      setIsPlayingConversation(false);
    }
  }, [isPlayingConversation, conversationQueue]);

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

  const startConversation = (steps: ConversationStep[]) => {
    // Save the conversation for later use
    setSavedConversation(steps);
    setIsPlayingConversation(true);
    setConversationQueue(steps);
    // Don't clear messages when starting new conversation
    // setMessages([]); - Remove this line
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

    // If there's a saved conversation, start it
    if (savedConversation.length > 0) {
      setConversationQueue(savedConversation);
      setIsPlayingConversation(true);
      return;
    }

    // If nothing is saved or queued, start with default conversation
    const defaultConversation: ConversationStep[] = [
      {
        text: "Is +91 9849364734 linked to your business bank accounts?",
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
    setConversationQueue(defaultConversation);
    setIsPlayingConversation(true);
  };

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
              onClick={() => setIsControlPanelCollapsed(!isControlPanelCollapsed)}
              title="Show message controls"
            >
              <MessageSquarePlus />
            </ToggleButton>
            <PlayButton
              isCollapsed={true}
              isPlaying={isPlayingConversation}
              onClick={handlePlayConversation}
              title={isPlayingConversation ? "Pause conversation" : "Start/Resume conversation"}
            >
              {isPlayingConversation ? <Pause /> : <Play />}
            </PlayButton>
          </ButtonGroup>
        ) : (
          <>
            <ToggleButton 
              isCollapsed={isControlPanelCollapsed}
              onClick={() => setIsControlPanelCollapsed(!isControlPanelCollapsed)}
              title="Hide message controls"
            >
              <MessageSquarePlus />
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
            />
          </>
        )}
      </ControlSection>
    </AppContainer>
  )
}

export default App