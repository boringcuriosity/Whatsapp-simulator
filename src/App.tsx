import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import PhonePreview from './components/PhonePreview'
import ControlPanel from './components/ControlPanel'
import { Message, Contact, ConversationStep, MessageType } from './types'
import SaveConversationModal from './components/SaveConversationModal';
import { conversationStorage, SavedConversation } from './services/conversationStorage';

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
  min-height: 100%;

  @media (max-width: 768px) {
    padding: 10px 0;
    align-items: flex-start;
    min-height: calc(100vh - 60px);
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

const CollapsedSidebarButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin: 10px auto;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--whatsapp-teal);
  }
  
  img {
    width: 18px;
    height: 18px;
    transform: rotate(180deg);
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
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(18, 140, 126, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  // Initialize default state
  const [contact, setContact] = useState<Contact>({
    name: 'Business',
    avatar: 'https://www.pppacademygroup.com/wp-content/uploads/2024/05/whatsapp-logo-0DBD89C8E2-seeklogo.com_.png',
    status: 'online',
    lastSeen: new Date()
  });

  const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // State for message type and settings
  const [contactSettingsOpen, setContactSettingsOpen] = useState(false); // Closed by default
  const [messageType, setMessageType] = useState<'text' | 'business' | 'conversation'>('conversation');
  
  // State for conversation flow
  const [conversationFlow, setConversationFlow] = useState<string>('[]');
  const [steps, setSteps] = useState<ConversationStep[]>([]);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
  const [conversationError, setConversationError] = useState('');
  
  // Playback state
  const [isPlayingConversation, setIsPlayingConversation] = useState(false);
  const [conversationQueue, setConversationQueue] = useState<ConversationStep[]>([]);
  const [savedConversation, setSavedConversation] = useState<ConversationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  
  // Saved conversations state
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Add a ref to track if an operation is in progress
  const isProcessingRef = useRef(false);

  // Load saved conversations on mount
  useEffect(() => {
    try {
      const saved = conversationStorage.getAll();
      setSavedConversations(saved);
    } catch (error) {
      console.error("Error loading saved conversations:", error);
    }
  }, []);
  
  const handleSaveConversation = (name: string, description: string) => {
    try {
      const newConversation = conversationStorage.save({
        name,
        description,
        steps: steps,
        contact: {
          name: contact.name,
          avatar: contact.avatar
        }
      });
      setSavedConversations(prev => [...prev, newConversation]);
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const handleLoadSavedConversation = (conversation: SavedConversation) => {
    try {
      setSteps(conversation.steps);
      setShowJsonPreview(false);
      setConversationFlow(JSON.stringify(conversation.steps, null, 2));
      // Update contact info when loading saved conversation
      updateContact({
        name: conversation.contact.name,
        avatar: conversation.contact.avatar
      });
      // Clear any existing conversation state
      setMessages([]);
      setCurrentStepIndex(-1);
      setConversationQueue([]);
      setIsPlayingConversation(false);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleDeleteSavedConversation = (id: string) => {
    try {
      const deleted = conversationStorage.delete(id);
      if (deleted) {
        setSavedConversations(prev => prev.filter(conv => conv.id !== id));
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

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

  const handlePreviousStep = () => {
    // Allow going back if there are messages
    if (messages.length === 0) return;
    
    // Check if there are grouped buttons we need to handle specially
    const lastMessages = messages.slice(-3); // Check last few messages
    const lastButtonGroup = lastMessages.filter(msg => msg.type === 'button');
    
    // If the last message was part of a button group, remove the entire group
    if (lastButtonGroup.length > 0 && lastMessages[lastMessages.length - 1].type === 'button') {
      // Find all consecutive buttons at the end
      let buttonCount = 0;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].type === 'button') {
          buttonCount++;
        } else {
          break;
        }
      }
      
      // Remove all buttons in the group
      setMessages(prev => prev.slice(0, prev.length - buttonCount));
      setCurrentStepIndex(prev => Math.max(-1, prev - buttonCount));
    } else {
      // Just remove the last message
      setMessages(prev => prev.slice(0, -1));
      setCurrentStepIndex(prev => Math.max(-1, prev - 1));
    }
  };

  const handleNextStep = () => {
    // If we're already processing a step, don't allow another click
    if (isProcessingRef.current) return;

    try {
      // If we have no steps at all, do nothing
      if (steps.length === 0) return;

      // Mark that we're processing a step
      isProcessingRef.current = true;

      // Process steps to make them consistent with how the play button works
      if (savedConversation.length === 0) {
        // Process steps to extract buttons as separate steps (same as startConversation)
        const processedSteps: ConversationStep[] = [];
        
        steps.forEach(step => {
          if (!step) return; // Skip undefined steps
          
          // Add the main message step (without buttons property)
          const { buttons, ...mainStep } = step;
          
          // Ensure type is properly set based on content
          const processedStep: ConversationStep = {
            ...mainStep,
            type: mainStep.imageUrl ? 'image' : (mainStep.type as MessageType || 'text')
          };
          
          processedSteps.push(processedStep);
          
          // Add button steps if present
          if (buttons && buttons.length > 0) {
            buttons.forEach(button => {
              if (button && typeof button === 'object') {
                const buttonStep: ConversationStep = {
                  text: button.text || "",
                  sender: step.sender,
                  type: 'button',
                  buttonText: button.text || "",
                  isBusinessMessage: true,
                  delay: 0,
                  link: button.url,
                  openLinkInWebView: button.openInWebView
                };
                processedSteps.push(buttonStep);
              }
            });
          }
        });
        
        setSavedConversation(processedSteps);
      }

      // Use processed steps for consistency
      const stepsToUse = savedConversation.length > 0 ? savedConversation : steps;
      
      // If no messages yet, start with first message
      if (messages.length === 0) {
        const firstMessage = stepsToUse[0];
        
        // Add the first message immediately
        addMessageImmediately(firstMessage);

        // Now update the current index synchronously to avoid race conditions
        let newCurrentIndex = 0;
        setCurrentStepIndex(newCurrentIndex);
        
        // If the first message has buttons in the original steps, handle them
        const originalStep = steps[0];
        if (originalStep && originalStep.buttons && originalStep.buttons.length > 0) {
          const buttonMessages: Message[] = [];
          
          originalStep.buttons.forEach((button, idx) => {
            if (button && typeof button === 'object') {
              const buttonMessage: Message = {
                id: `${Date.now().toString()}-btn-${idx}`,
                text: button.text || '',
                buttonText: button.text || '',
                sender: originalStep.sender,
                timestamp: new Date(),
                status: 'sent',
                type: 'button',
                isBusinessMessage: true,
                link: button.url,
                openLinkInWebView: button.openInWebView
              };
              buttonMessages.push(buttonMessage);
              newCurrentIndex++;
            }
          });
          
          // Update messages with all buttons at once to prevent race conditions
          if (buttonMessages.length > 0) {
            setMessages(prev => [...prev, ...buttonMessages]);
            setCurrentStepIndex(newCurrentIndex);
          }
        }
        
        // Release processing lock
        isProcessingRef.current = false;
        return;
      }
      
      // If we're still within bounds of the steps array
      if (currentStepIndex < stepsToUse.length - 1) {
        const nextStep = stepsToUse[currentStepIndex + 1];
        
        // For messages with grouped buttons, we need special handling
        const currentMessage = messages[messages.length - 1];
        
        // If current message is a regular message and next step is a button,
        // check if there are multiple buttons to add at once
        if (nextStep.type === 'button' && currentMessage.type !== 'button') {
          // Find all consecutive buttons
          const buttonsToAdd: ConversationStep[] = [];
          let idx = currentStepIndex + 1;
          
          // Collect all consecutive button messages
          while (idx < stepsToUse.length && stepsToUse[idx].type === 'button') {
            buttonsToAdd.push(stepsToUse[idx]);
            idx++;
          }
          
          // Add all button messages at once rather than with delays
          const allButtonMessages: Message[] = [];
          let newCurrentIndex = currentStepIndex;
          
          // Add the first button message
          const firstButton = buttonsToAdd[0];
          const firstButtonMsg = createMessageFromStep(firstButton);
          allButtonMessages.push(firstButtonMsg);
          newCurrentIndex++;
          
          // Add remaining buttons if any
          if (buttonsToAdd.length > 1) {
            for (let i = 1; i < buttonsToAdd.length; i++) {
              const buttonMessage = createMessageFromStep(buttonsToAdd[i]);
              allButtonMessages.push(buttonMessage);
              newCurrentIndex++;
            }
          }
          
          // Update messages and step index at once to prevent race conditions
          setMessages(prev => [...prev, ...allButtonMessages]);
          setCurrentStepIndex(newCurrentIndex);
        } else {
          // Regular case - just add next message
          addMessageImmediately(nextStep);
          setCurrentStepIndex(currentStepIndex + 1);
        }
      }
      
      // Release processing lock after a short delay to prevent double-clicks
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 100);
    } catch (error) {
      console.error("Error adding next step:", error);
      isProcessingRef.current = false;
    }
  };

  // Helper function to create a message object from a conversation step
  const createMessageFromStep = (step: ConversationStep): Message => {
    let formattedText = step.text || '';
    if (step.highlightedText) {
      formattedText = formattedText.replace(
        step.highlightedText,
        `*${step.highlightedText}*`
      );
    }
    
    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // Ensure unique ID
      text: formattedText,
      sender: step.sender,
      timestamp: new Date(),
      status: 'sent',
      type: (step.type as MessageType) || 'text',
      isBusinessMessage: step.isBusinessMessage,
      buttonText: step.buttonText,
      link: step.link,
      openLinkInWebView: step.openLinkInWebView,
      imageUrl: step.imageUrl,
      caption: step.caption
    };
  };

  // Helper function to add message immediately without delays
  const addMessageImmediately = (step: ConversationStep) => {
    try {
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
      
      const newMessage = createMessageFromStep(step);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error("Error adding message immediately:", error);
    }
  };

  const updateContact = (updatedContact: Partial<Contact>) => {
    setContact(prev => ({ ...prev, ...updatedContact }));
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        timestamp: new Date(),
        status: 'sent',
        type: message.type || 'text',
        openLinkInWebView: message.openLinkInWebView,
        ...message
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(msg => msg.id === id ? { ...msg, ...updates } : msg)
    );
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearAllMessages = () => {
    setMessages([]);
  };

  const startConversation = (steps: ConversationStep[]) => {
    try {
      // Process steps to extract buttons as separate steps
      const processedSteps: ConversationStep[] = [];
      
      steps.forEach(step => {
        if (!step) return; // Skip undefined steps
        
        // Add the main message step (without buttons property)
        const { buttons, ...mainStep } = step;
        
        // Ensure type is properly set based on content
        const processedStep: ConversationStep = {
          ...mainStep,
          type: mainStep.imageUrl ? 'image' : (mainStep.type as MessageType || 'text')
        };
        
        processedSteps.push(processedStep);
        
        // Add button steps if present
        if (buttons && buttons.length > 0) {
          buttons.forEach(button => {
            if (button && typeof button === 'object') {
              const buttonStep: ConversationStep = {
                text: button.text || "",
                sender: step.sender,
                type: 'button',
                buttonText: button.text || "",
                isBusinessMessage: true,
                delay: 0,
                link: button.url,
                openLinkInWebView: button.openInWebView
              };
              processedSteps.push(buttonStep);
            }
          });
        }
      });
      
      setSavedConversation(processedSteps);
      setIsPlayingConversation(true);
      setConversationQueue(processedSteps);
      setCurrentStepIndex(-1);
      setMessages([]); // Clear messages when starting new conversation
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handlePlayConversation = () => {
    try {
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
      setMessages([]);
      
      // Use the steps from the control panel only if they exist
      if (steps.length > 0) {
        // Process steps to extract buttons as separate steps (same as startConversation)
        const processedSteps: ConversationStep[] = [];
        
        steps.forEach(step => {
          if (!step) return; // Skip undefined steps
          
          // Add the main message step (without buttons property)
          const { buttons, ...mainStep } = step;
          
          // Ensure type is properly set based on content
          const processedStep: ConversationStep = {
            ...mainStep,
            type: mainStep.imageUrl ? 'image' : (mainStep.type as MessageType || 'text')
          };
          
          processedSteps.push(processedStep);
          
          // Add button steps if present
          if (buttons && buttons.length > 0) {
            buttons.forEach(button => {
              if (button && typeof button === 'object') {
                const buttonStep: ConversationStep = {
                  text: button.text || "",
                  sender: step.sender,
                  type: 'button',
                  buttonText: button.text || "",
                  isBusinessMessage: true,
                  delay: 0,
                  link: button.url,
                  openLinkInWebView: button.openInWebView
                };
                processedSteps.push(buttonStep);
              }
            });
          }
        });
        
        setSavedConversation(processedSteps);
        setConversationQueue([...processedSteps]);
        setCurrentStepIndex(-1);
        setIsPlayingConversation(true);
        return;
      }
      else {
        // Don't show any default conversation if no steps exist
        // Just inform the user that they need to add steps first
        setConversationError("Please add conversation steps in the control panel first.");
        return;
      }
    } catch (error) {
      console.error("Error handling play conversation:", error);
    }
  };

  useEffect(() => {
    if (!isPlayingConversation || conversationQueue.length === 0) return;
    
    try {
      const nextStep = conversationQueue[0];
      if (!nextStep) return; // Skip if step is undefined
      
      const delay = nextStep.delay ?? 1000;
      
      if (nextStep.sender === 'them' && nextStep.type !== 'button') {
        setContact(prev => ({ ...prev, status: 'typing' }));
      }
      
      const timer = setTimeout(() => {
        if (nextStep.sender === 'them') {
          setContact(prev => ({ ...prev, status: 'online' }));
        }
        
        let formattedText = nextStep.text || '';
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
          type: (nextStep.type as MessageType) || 'text',
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
        
        // If this was a message with buttons in the original steps, add them immediately
        // This is only needed for the manual next button, auto-play will handle them correctly
        if (!isPlayingConversation && nextStep.buttons && nextStep.buttons.length > 0) {
          nextStep.buttons.forEach(button => {
            if (button && typeof button === 'object') {
              const buttonMessage: Message = {
                id: `${Date.now().toString()}-btn-${button.text || ''}`,
                text: button.text || '',
                buttonText: button.text || '',
                sender: nextStep.sender,
                timestamp: new Date(),
                status: 'sent',
                type: 'button',
                isBusinessMessage: true,
                link: button.url,
                openLinkInWebView: button.openInWebView
              };
              
              setMessages(prev => [...prev, buttonMessage]);
            }
          });
        }
      }, delay);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error in conversation effect:", error);
    }
  }, [isPlayingConversation, conversationQueue]);

  return (
    <AppContainer>
      <PreviewSection>
        <PhonePreview 
          contact={contact}
          messages={messages}
          onUpdateMessage={updateMessage}
        />
      </PreviewSection>
      
      <ControlSection isCollapsed={isControlPanelCollapsed}>
        {isControlPanelCollapsed ? (
          <CollapsedSidebarButton 
            onClick={() => setIsControlPanelCollapsed(false)}
            title="Show message controls"
          >
            <img src="/sidebar_icon.svg" alt="Show controls" />
          </CollapsedSidebarButton>
        ) : (
          <ControlPanel
            contact={contact}
            messages={messages}
            onUpdateContact={updateContact}
            onAddMessage={addMessage}
            onUpdateMessage={updateMessage}
            onDeleteMessage={deleteMessage}
            onClearMessages={clearAllMessages}
            onStartConversation={startConversation}
            contactSettingsOpen={contactSettingsOpen}
            setContactSettingsOpen={setContactSettingsOpen}
            messageType={messageType}
            setMessageType={setMessageType}
            conversationFlow={conversationFlow}
            setConversationFlow={setConversationFlow}
            steps={steps}
            setSteps={setSteps}
            showJsonPreview={showJsonPreview}
            setShowJsonPreview={setShowJsonPreview}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            previewMessages={previewMessages}
            setPreviewMessages={setPreviewMessages}
            conversationError={conversationError}
            setConversationError={setConversationError}
            savedConversations={savedConversations}
            onLoadSavedConversation={handleLoadSavedConversation}
            onDeleteSavedConversation={handleDeleteSavedConversation}
            onSaveCurrentConversation={() => setIsSaveModalOpen(true)}
            isControlPanelCollapsed={isControlPanelCollapsed}
            setIsControlPanelCollapsed={setIsControlPanelCollapsed}
          />
        )}
      </ControlSection>
      
      {/* Playback controls */}
      <PlayPauseButton
        onClick={handlePlayConversation}
        title={isPlayingConversation ? "Pause conversation" : "Start/Resume conversation"}
      >
        <img 
          src={isPlayingConversation ? "/pause-icon.svg" : "/play-icon.svg"} 
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
            steps.length === 0 || 
            (savedConversation.length > 0 && currentStepIndex >= savedConversation.length - 1) ||
            (savedConversation.length === 0 && currentStepIndex >= steps.length - 1)
          }
          title="Next message"
        >
          <ArrowRight />
        </ArrowButton>
      </ManualControls>
      
      {/* Save conversation modal */}
      <SaveConversationModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveConversation}
      />
    </AppContainer>
  );
}

export default App;