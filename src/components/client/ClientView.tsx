import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import PhonePreview from '../PhonePreview';
import { Contact, Message, ConversationStep, SavedConversation } from '../../types';
import './ClientView.css';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Styled components for the client view
const ClientContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PhoneSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f0f2f5;
  overflow: auto;
  min-height: 100%;

  @media (max-width: 768px) {
    padding: 0;
    align-items: flex-start;
    min-height: calc(100vh - 60px); /* Account for any headers */
  }

  /* Add specific adjustments for Windows devices with different heights */
  @media (min-width: 769px) and (max-height: 800px) {
    padding: 10px;
    align-items: center; /* Center vertically on smaller height screens */
  }
`;

const ConversationList = styled.div`
  width: 300px;
  background-color: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 1rem;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
`;

const ConversationListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
`;

const ConversationListTitle = styled.h2`
  margin: 0;
  color: #128C7E;
  font-size: 1.2rem;
`;

const ConversationCard = styled.div<{ isActive: boolean }>`
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  cursor: pointer;
  background-color: ${props => props.isActive ? 'rgba(18, 140, 126, 0.1)' : 'white'};
  border: 1px solid ${props => props.isActive ? '#128C7E' : '#e0e0e0'};
  transition: all 0.2s ease;
  box-shadow: ${props => props.isActive ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    background-color: ${props => props.isActive ? 'rgba(18, 140, 126, 0.1)' : '#f5f5f5'};
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
`;

const ConversationTitle = styled.h3`
  margin: 0 0 0.3rem 0;
  font-size: 1rem;
  color: #333;
`;

const ConversationDescription = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 0.8rem;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.6rem;
    z-index: 100;
  }
`;

const ArrowButton = styled.button<{ disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--whatsapp-teal, #128C7E);
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
    background: var(--whatsapp-green, #25D366);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const PlayPauseButton = styled.button<{ isPlaying: boolean }>`
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
  
  &:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
  }
  
  img {
    width: 24px;
    height: 24px;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.2rem;
  
  span {
    margin-left: 0.5rem;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  font-size: 1.2rem;
  color: #128C7E;
`;

const ErrorMessage = styled.div`
  padding: 2rem;
  margin: 2rem auto;
  max-width: 500px;
  text-align: center;
  color: #e74c3c;
  background-color: #fdeaea;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ClientView = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [activeConversationIndex, setActiveConversationIndex] = useState<number>(0);
  
  // State for conversation playback
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact>({
    name: '',
    avatar: '',
    status: 'online',
    lastSeen: new Date()
  });
  const [isPlayingConversation, setIsPlayingConversation] = useState<boolean>(false);
  const [conversationQueue, setConversationQueue] = useState<ConversationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  
  // Load conversations from the client-specific JSON file
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/${clientId}-conversations.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load conversations for client: ${clientId}`);
        }
        
        const data = await response.json();
        setConversations(data);
        
        // Set initial conversation and contact
        if (data.length > 0) {
          setContact({
            name: data[0].contact.name,
            avatar: data[0].contact.avatar,
            status: 'online',
            lastSeen: new Date()
          });
        }
        
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error loading conversations:', err);
      }
    };

    if (clientId) {
      loadConversations();
    }
  }, [clientId]);

  // Select a conversation
  const selectConversation = (index: number) => {
    if (index >= 0 && index < conversations.length) {
      setActiveConversationIndex(index);
      const conversation = conversations[index];
      
      // Reset conversation state
      setMessages([]);
      setCurrentStepIndex(-1);
      setIsPlayingConversation(false);
      setConversationQueue([]);
      
      // Set contact information
      setContact({
        name: conversation.contact.name,
        avatar: conversation.contact.avatar,
        status: 'online',
        lastSeen: new Date()
      });
    }
  };

  // Play/pause conversation
  const togglePlayConversation = () => {
    if (isPlayingConversation) {
      setIsPlayingConversation(false);
      return;
    }
    
    // If there's an existing queue but paused, resume it
    if (conversationQueue.length > 0) {
      setIsPlayingConversation(true);
      return;
    }
    
    // Start from beginning with fresh queue
    if (conversations[activeConversationIndex]) {
      setConversationQueue([...conversations[activeConversationIndex].steps]);
      setIsPlayingConversation(true);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    // Allow going back if there are messages
    if (messages.length === 0) return;
    
    // Remove the last message
    setMessages(prev => prev.slice(0, -1));
    setCurrentStepIndex(prev => Math.max(-1, prev - 1));
  };

  // Handle next step
  const handleNextStep = () => {
    if (!conversations[activeConversationIndex]) return;
    const steps = conversations[activeConversationIndex].steps;
    
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
  };

  // Helper function to add message immediately
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
      openLinkInWebView: step.openLinkInWebView,
      imageUrl: step.imageUrl,
      caption: step.caption
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // Update message handler
  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
    );
  };

  // Effect for playing conversation steps with delays
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
        openLinkInWebView: nextStep.openLinkInWebView,
        imageUrl: nextStep.imageUrl,
        caption: nextStep.caption
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentStepIndex(prev => prev + 1);
      setConversationQueue(prev => prev.slice(1));
    }, delay);
    
    return () => clearTimeout(timer);
  }, [isPlayingConversation, conversationQueue]);

  if (loading) {
    return <LoadingIndicator>Loading conversations...</LoadingIndicator>;
  }

  if (error) {
    return <ErrorMessage>
      <h2>Error Loading Conversations</h2>
      <p>{error}</p>
      <p>Please check that the client ID is correct and the conversation file exists.</p>
    </ErrorMessage>;
  }

  return (
    <ClientContainer>
      <MainContent>
        <PhoneSection>
          <PhonePreview 
            contact={contact}
            messages={messages}
            onUpdateMessage={updateMessage}
          />
        </PhoneSection>
        
        <ConversationList>
          <ConversationListHeader>
            <ConversationListTitle>Conversations</ConversationListTitle>
          </ConversationListHeader>
          
          {conversations.map((conversation, index) => (
            <ConversationCard 
              key={conversation.id} 
              isActive={index === activeConversationIndex}
              onClick={() => selectConversation(index)}
            >
              <ConversationTitle>{conversation.name}</ConversationTitle>
              {conversation.description && (
                <ConversationDescription>{conversation.description}</ConversationDescription>
              )}
              {index === activeConversationIndex && currentStepIndex >= 0 && (
                <StatusIndicator>
                  <div className="progress-dot" />
                  <span>{currentStepIndex + 1} of {conversations[activeConversationIndex].steps.length} messages</span>
                </StatusIndicator>
              )}
            </ConversationCard>
          ))}
        </ConversationList>
      </MainContent>
      
      <ControlBar>
        <ArrowButton 
          onClick={handlePreviousStep}
          disabled={messages.length === 0}
          title="Previous message"
        >
          <ArrowLeft />
        </ArrowButton>
        
        <PlayPauseButton 
          onClick={togglePlayConversation}
          isPlaying={isPlayingConversation}
          title={isPlayingConversation ? "Pause conversation" : "Play conversation"}
        >
          <img 
            src={isPlayingConversation ? "/pause icon.svg" : "/play icon.svg"} 
            alt={isPlayingConversation ? "Pause" : "Play"} 
          />
        </PlayPauseButton>
        
        <ArrowButton 
          onClick={handleNextStep}
          disabled={
            !conversations[activeConversationIndex] || 
            (currentStepIndex >= conversations[activeConversationIndex].steps.length - 1 && 
             messages.length > 0)
          }
          title="Next message"
        >
          <ArrowRight />
        </ArrowButton>
      </ControlBar>
    </ClientContainer>
  );
};

export default ClientView;