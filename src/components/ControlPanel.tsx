import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Copy, Trash2, ArrowUp, ArrowDown, HelpCircle, PlusCircle, Image, MessageSquare, Clock, UserCircle } from 'lucide-react'
import { Message, Contact, MessageStatus, ContactStatus, ConversationStep, MessageButton } from '../types'
import PhonePreview from './PhonePreview'
import SavedConversations from './SavedConversations'
import { SavedConversation } from '../services/conversationStorage'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  position: relative; // Added position relative to establish a positioning context

  @media (max-width: 768px) {
    gap: 16px;
    padding-bottom: 60px; // Add space for mobile browser bars
  }
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`

const SectionTitle = styled.h2`
display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 4px;
    padding-bottom: 4px;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
`

const Input = styled.input`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--whatsapp-green);
  }
`

const Select = styled.select`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--whatsapp-green);
  }
`

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--whatsapp-green);
  }
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'link' }>`
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  background-color: ${props => {
    if (props.variant === 'primary') return 'var(--whatsapp-green)';
    if (props.variant === 'danger') return '#f44336';
    if (props.variant === 'link') return 'transparent';
    return '#f0f2f5';
  }};
  
  color: ${props => {
    if (props.variant === 'primary' || props.variant === 'danger') return 'white';
    if (props.variant === 'link') return 'var(--whatsapp-blue)';
    return 'var(--text-primary)';
  }};
  
  border: ${props => props.variant === 'link' ? 'none' : '1px solid transparent'};
  text-decoration: ${props => props.variant === 'link' ? 'underline' : 'none'};
  
  &:hover {
    opacity: 0.9;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    
    button {
      width: 100%;
    }
  }
`

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
`

const MessageItem = styled.div<{ sender: 'me' | 'them' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background-color: ${props => props.sender === 'me' ? 'rgba(37, 211, 102, 0.1)' : 'rgba(52, 183, 241, 0.1)'};
`

const MessageContent = styled.div`
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const MessageActions = styled.div`
  display: flex;
  gap: 8px;
`

const Collapsible = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 8px;
  position: relative;
  margin-bottom: 16px;
  max-width: 480px;
  min-width: 380px;
  align-self: flex-start;

  @media (max-width: 768px) {
    max-width: 95%;
    min-width: unset;
    width: 95%;
    margin-left: auto;
    margin-right: auto;
  }
`

const CollapsibleHeader = styled.div`
  padding: 12px;
  background-color: #f0f2f5;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  border-radius: 8px;
  z-index: 5;
  position: relative;
`

const CollapsibleContent = styled.div<{ isOpen: boolean }>`
  padding: ${props => props.isOpen ? '16px' : '0'};
  height: ${props => props.isOpen ? 'auto' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background-color: white;
  border-radius: 0 0 8px 8px;
  box-shadow: ${props => props.isOpen ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  z-index: 4;
  position: ${props => props.isOpen ? 'absolute' : 'static'};
  width: 100%;
`

const MessageInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: #f9f9f9;

  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;
  }
`

const MessageTypeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`

const MessageTypeButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => props.active ? 'var(--whatsapp-green)' : '#f0f2f5'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  border: none;
  
  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 15px;
  }
`

const BusinessOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
`

const OptionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const OptionButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const OptionInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--whatsapp-green);
  }
`

const RemoveButton = styled.button`
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
`

const ConversationFlowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: #f9f9f9;
`

const ConversationTextArea = styled.textarea`
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  min-height: 200px;
  resize: vertical;
  font-family: monospace;
  
  &:focus {
    outline: none;
    border-color: var(--whatsapp-green);
  }
`

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  border-left: 3px solid #f44336;
`

const ConversationStepForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 12px;
`

const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    div:last-child {
      width: 100%;
      justify-content: space-between;
    }
  }
`

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
`

const StepForm = styled(ConversationStepForm)`
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  margin: 0 0 16px 0;
  padding: 16px;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  scroll-margin: 20px; // Add scroll margin for smoother scrolling
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 12px;
    margin: 0 0 12px 0;
  }
`

const StepIndexBadge = styled.div`
  background-color: var(--whatsapp-teal);
  color: white;
  font-size: 13px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 12px;
  margin-right: 10px;
  min-width: 30px;
  text-align: center;
`

const QuickActionsBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  align-items: center;
`

const TemplateButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;

  &::before {
    content: '+';
    font-weight: bold;
  }
`

const EditorTabs = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
`

const EditorTab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => props.active ? 'white' : '#f5f5f5'};
  color: ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--text-secondary)'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? 'var(--whatsapp-teal)' : 'transparent'};
  flex: 1;
  
  &:hover {
    background-color: ${props => props.active ? 'white' : '#efefef'};
  }
`

const ActionBar = styled.div`
  display: flex;
  position: sticky;
  bottom: 0;
  padding: 16px;
  background: white;
  border-top: 1px solid var(--border-color);
  gap: 8px;
  margin-top: 16px;
  z-index: 10;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 12px;
    flex-direction: column;
    gap: 8px;

    button {
      width: 100%;
    }
  }
`

const ActionButton = styled(Button)`
  transition: all 0.2s ease;
  min-width: 120px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 2px dashed var(--border-color);
  margin: 20px 0;
  text-align: center;
`

const DelayInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const DelaySlider = styled.input`
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: #ddd;
  border-radius: 2px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--whatsapp-teal);
    cursor: pointer;
  }
`

const DelayPreset = styled.button<{ active?: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid var(--whatsapp-teal);
  background: ${props => props.active ? 'var(--whatsapp-teal)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--whatsapp-teal)'};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.active ? 'var(--whatsapp-teal)' : 'rgba(37, 211, 102, 0.1)'};
  }
`

const PreviewOverlay = styled.div<{ show: boolean }>`
  display: ${props => props.show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0;
  }
`

const PreviewContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;

  @media (max-width: 768px) {
    height: 100%;
    padding: 16px;
    border-radius: 0;
    overflow-y: auto;
  }
`

const StepTypeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
`

const TypeSelectorButton = styled(Button)<{ active: boolean }>`
  flex: 1;
  background: ${props => props.active ? 'var(--whatsapp-teal)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  border: 1px solid ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--border-color)'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`

const StepFormContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`

const IconButton = styled(Button)`
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background: ${props => props.variant === 'danger' ? '#ffebee' : '#e3f2fd'};
    color: ${props => props.variant === 'danger' ? '#f44336' : '#2196f3'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`

const ImagePreview = styled.div`
  position: relative;
  margin: 16px 0;
  
  img {
    width: 100%;
    max-width: 300px;
    border-radius: 8px;
    display: block;
  }
`

const ImageUploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f0f2f5;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-primary);
  border: 1px dashed var(--border-color);
  transition: all 0.2s;
  
  &:hover {
    background: #e8eaed;
  }
  
  input[type="file"] {
    display: none;
  }
`

const RemoveImageButton = styled(IconButton)`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  
  &:hover {
    background: rgba(244, 67, 54, 0.8);
    color: white;
  }
`

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f7f7f7;
  border-radius: 8px;
  margin-top: 8px;
`

const StyledRadioLabel = styled.label<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
  background: ${props => props.isSelected ? 'white' : 'transparent'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.isSelected ? 'var(--whatsapp-teal)' : '#ddd'};
  
  &:hover {
    background: ${props => props.isSelected ? 'white' : '#f0f0f0'};
  }
`

const RadioButton = styled.input`
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid ${props => props.checked ? 'var(--whatsapp-teal)' : '#999'};
  border-radius: 50%;
  margin: 0;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &:checked {
    border-color: var(--whatsapp-teal);
    &:after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--whatsapp-teal);
    }
  }

  &:hover {
    border-color: var(--whatsapp-teal);
  }
`

const RadioText = styled.span<{ isSelected: boolean }>`
  color: ${props => props.isSelected ? 'var(--whatsapp-teal)' : 'var(--text-primary)'};
  font-weight: ${props => props.isSelected ? '500' : 'normal'};
  font-size: 14px;
`

const STEP_TEMPLATES = [
  {
    name: 'Question with Yes/No',
    template: {
      text: 'Do you want to proceed?',
      sender: 'them' as const,
      delay: 1000,
      isBusinessMessage: true,
      type: 'text' as const,
    },
    buttons: ['Yes', 'No']
  },
  {
    name: 'Information Message',
    template: {
      text: 'Here is some important information.',
      sender: 'them' as const,
      delay: 1500,
      type: 'text' as const,
    }
  },
  {
    name: 'Action Button',
    template: {
      text: 'Click here',
      sender: 'them' as const,
      type: 'button' as const,
      isBusinessMessage: true,
      delay: 0,
      buttonText: 'Click here'
    }
  }
];

type EditorMode = 'visual' | 'json' | 'saved';

interface ControlPanelProps {
  contact: Contact;
  messages: Message[];
  onUpdateContact: (contact: Partial<Contact>) => void;
  onAddMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
  onUpdateMessage: (id: string, updates: Partial<Message>) => void;
  onDeleteMessage: (id: string) => void;
  onClearMessages: () => void;
  onStartConversation: (steps: ConversationStep[]) => void;
  // New props for lifted state
  contactSettingsOpen: boolean;
  setContactSettingsOpen: (open: boolean) => void;
  messageType: 'text' | 'business' | 'conversation';
  setMessageType: (type: 'text' | 'business' | 'conversation') => void;
  newTextMessage: { text: string; sender: 'me' | 'them' };
  setNewTextMessage: (message: { text: string; sender: 'me' | 'them' }) => void;
  businessMessage: {
    text: string;
    options: string[];
    phoneNumber: string;
    highlightedText: string;
    sender: 'me' | 'them';
  };
  setBusinessMessage: (message: {
    text: string;
    options: string[];
    phoneNumber: string;
    highlightedText: string;
    sender: 'me' | 'them';
  }) => void;
  conversationFlow: string;
  setConversationFlow: (flow: string) => void;
  steps: ConversationStep[];
  setSteps: (steps: ConversationStep[]) => void;
  showJsonPreview: boolean;
  setShowJsonPreview: (show: boolean) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  previewMessages: Message[];
  setPreviewMessages: (messages: Message[]) => void;
  conversationError: string;
  setConversationError: (error: string) => void;
  savedConversations: SavedConversation[];
  onLoadSavedConversation: (conversation: SavedConversation) => void;
  onDeleteSavedConversation: (id: string) => void;
  onSaveCurrentConversation: () => void;
}

const ControlPanel = ({
  contact,
  messages,
  onUpdateContact,
  onAddMessage,
  onUpdateMessage,
  onDeleteMessage,
  onClearMessages,
  onStartConversation,
  // New props
  contactSettingsOpen,
  setContactSettingsOpen,
  messageType,
  setMessageType,
  newTextMessage,
  setNewTextMessage,
  businessMessage,
  setBusinessMessage,
  conversationFlow,
  setConversationFlow,
  steps,
  setSteps,
  showJsonPreview,
  setShowJsonPreview,
  showPreview,
  setShowPreview,
  previewMessages,
  setPreviewMessages,
  conversationError,
  setConversationError,
  savedConversations,
  onLoadSavedConversation,
  onDeleteSavedConversation,
  onSaveCurrentConversation
}: ControlPanelProps) => {
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [linkOpeningBehavior, setLinkOpeningBehavior] = useState<'webview' | 'newtab'>('webview');
  const [editorMode, setEditorMode] = useState<EditorMode>('visual');
  const [showHelp, setShowHelp] = useState(false); // Changed from true to false
  
  // Force set the message type to conversation flow
  useEffect(() => {
    if (messageType !== 'conversation') {
      setMessageType('conversation');
    }
  }, [messageType, setMessageType]);

  const updateStep = (index: number, updates: Partial<ConversationStep>) => {
    setSteps(steps.map((step, i) => 
      i === index ? { 
        ...step, 
        ...updates,
        // Ensure openLinkInWebView is properly set when updating a step with a link
        ...(updates.link && typeof updates.openLinkInWebView === 'undefined' ? 
          { openLinkInWebView: linkOpeningBehavior === 'webview' } : {})
      } : step
    ));
  };

  // Function to add a button to the message
  const addButtonToMessage = (stepIndex: number, buttonText: string = '', url: string = '') => {
    const step = steps[stepIndex];
    if (!step) return;
    
    // Initialize buttons array if it doesn't exist
    const buttons = step.buttons || [];
    
    // Limit to 5 buttons
    if (buttons.length >= 5) {
      alert("Maximum 5 buttons allowed per message");
      return;
    }
    
    // Add a new button
    const updatedButtons = [
      ...buttons,
      { text: buttonText, url, openInWebView: true }
    ];
    
    // Update the step with new buttons
    updateStep(stepIndex, { buttons: updatedButtons });
  };
  
  // Function to update a button's properties
  const updateMessageButton = (
    stepIndex: number, 
    buttonIndex: number, 
    updates: Partial<MessageButton>
  ) => {
    const step = steps[stepIndex];
    if (!step || !step.buttons) return;
    
    // Create a new array with the updated button
    const updatedButtons = step.buttons.map((btn, idx) => 
      idx === buttonIndex ? { ...btn, ...updates } : btn
    );
    
    // Update the step with modified buttons
    updateStep(stepIndex, { buttons: updatedButtons });
  };
  
  // Function to remove a button from a message
  const removeButtonFromMessage = (stepIndex: number, buttonIndex: number) => {
    const step = steps[stepIndex];
    if (!step || !step.buttons) return;
    
    // Filter out the button to remove
    const updatedButtons = step.buttons.filter((_, idx) => idx !== buttonIndex);
    
    // Update the step with filtered buttons
    updateStep(stepIndex, { buttons: updatedButtons.length > 0 ? updatedButtons : undefined });
  };
  
  // Toggle image on message
  const toggleImageOnMessage = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) return;
    
    // If image already exists, remove it
    if (step.imageUrl) {
      updateStep(stepIndex, { 
        imageUrl: undefined, 
        caption: undefined 
      });
      return;
    }
    
    // Add placeholder for image
    updateStep(stepIndex, { 
      imageUrl: '', 
      caption: ''
    });
  };
  
  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  // Add new step with default values based on sender
  const addStepBySender = (sender: 'me' | 'them') => {
    setSteps([...steps, {
      text: '',
      sender,
      delay: 1000, // Default to 1 second delay
      type: 'text',
      isBusinessMessage: sender === 'them' // Set business message only for "them" sender
    }]);
    
    // Scroll to the newly added step after render
    setTimeout(() => {
      const newIndex = steps.length;
      stepRefs.current[newIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  // Handle form submission - start conversation
  const handleFormSubmit = () => {
    if (steps.length === 0) {
      setConversationError('Please add at least one step to the conversation');
      return;
    }
    
    // Process steps to create proper conversation flow
    const processedSteps = processStepsForConversation(steps);
    onStartConversation(processedSteps);
    setConversationError('');
  };

  // Process steps to extract buttons as separate message steps
  const processStepsForConversation = (stepsToProcess: ConversationStep[]): ConversationStep[] => {
    const processedSteps: ConversationStep[] = [];
    
    stepsToProcess.forEach(step => {
      // Add the main message step (without buttons property)
      const { buttons, ...mainStep } = step;
      
      // Ensure imageUrl and caption are preserved in the processed step
      const processedStep = {
        ...mainStep,
        type: mainStep.imageUrl ? 'image' : mainStep.type || 'text'
      };
      
      processedSteps.push(processedStep);
      
      // Add button steps if present
      if (buttons && buttons.length > 0) {
        buttons.forEach(button => {
          processedSteps.push({
            text: button.text,
            sender: step.sender,
            type: 'button',
            buttonText: button.text,
            isBusinessMessage: true,
            delay: 0,
            link: button.url,
            openLinkInWebView: button.openInWebView
          });
        });
      }
    });
    
    return processedSteps;
  };

  // ... existing message handlers ...

  const handleTemplateAdd = (template: typeof STEP_TEMPLATES[number]) => {
    // Create main message with buttons attached
    const mainMessage: ConversationStep = {
      ...template.template,
      text: template.template.text
    };
    
    // If template has buttons, add them to the main message as buttons array
    if (template.buttons) {
      mainMessage.buttons = template.buttons.map(text => ({
        text,
        openInWebView: true
      }));
    }
    
    // Add the new message to steps
    setSteps([...steps, mainMessage]);
  };

  // ... other existing functions ...

  const duplicateStep = (index: number) => {
    const newSteps = [...steps];
    const duplicatedStep = { ...newSteps[index] };
    newSteps.splice(index + 1, 0, duplicatedStep);
    setSteps(newSteps);
  };

  // ... other existing editor functions ...

  const handlePreview = () => {
    if (steps.length === 0) {
      setConversationError('Add some steps to preview the conversation');
      return;
    }
    
    // Process steps to create preview messages
    const previewMsgs = processStepsForPreview(steps);
    setPreviewMessages(previewMsgs);
    setShowPreview(true);
  };
  
  // Process steps to create preview messages
  const processStepsForPreview = (stepsToPreview: ConversationStep[]): Message[] => {
    const previewMsgs: Message[] = [];
    
    stepsToPreview.forEach((step, index) => {
      // Create the main message
      const mainMessage: Message = {
        id: `preview-${index}`,
        timestamp: new Date(),
        status: 'sent',
        text: step.text,
        sender: step.sender,
        type: step.imageUrl ? 'image' : 'text',
        isBusinessMessage: step.sender === 'them' && (step.isBusinessMessage !== false),
        imageUrl: step.imageUrl,
        caption: step.caption
      };
      
      previewMsgs.push(mainMessage);
      
      // If the message has buttons, add them as separate messages
      if (step.buttons && step.buttons.length > 0) {
        step.buttons.forEach((button, btnIndex) => {
          const buttonMessage: Message = {
            id: `preview-${index}-btn-${btnIndex}`,
            timestamp: new Date(),
            status: 'sent',
            text: button.text,
            buttonText: button.text,
            sender: step.sender,
            type: 'button',
            isBusinessMessage: true,
            link: button.url,
            openLinkInWebView: button.openInWebView
          };
          
          previewMsgs.push(buttonMessage);
        });
      }
    });
    
    return previewMsgs;
  };

  // ... existing move functions ...

  const handleSwitchToVisualView = () => {
    try {
      const parsed = JSON.parse(conversationFlow);
      setSteps(parsed);
      setConversationError('');
    } catch (error) {
      setConversationError('Invalid JSON format - please fix before switching views');
      return;
    }
  };

  const handleSwitchToJsonView = () => {
    setConversationFlow(JSON.stringify(steps, null, 2));
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    setSteps(newSteps);
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    setSteps(newSteps);
  };

  return (
    <Container>
      <Collapsible>
        <CollapsibleHeader onClick={() => setContactSettingsOpen(!contactSettingsOpen)}>
          Contact Settings
          <span>{contactSettingsOpen ? '▲' : '▼'}</span>
        </CollapsibleHeader>
        <CollapsibleContent isOpen={contactSettingsOpen}>
          <FormGroup>
            <Label htmlFor="contactName">Name</Label>
            <Input
              id="contactName"
              value={contact.name}
              onChange={(e) => onUpdateContact({ name: e.target.value })}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="contactAvatar">Avatar URL</Label>
            <Input
              id="contactAvatar"
              value={contact.avatar}
              onChange={(e) => onUpdateContact({ avatar: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="contactStatus">Status</Label>
            <Select
              id="contactStatus"
              value={contact.status}
              onChange={(e) => onUpdateContact({ status: e.target.value as ContactStatus })}
            >
              <option value="online">Online</option>
              <option value="typing">Typing...</option>
              <option value="offline">Offline</option>
            </Select>
          </FormGroup>
        </CollapsibleContent>
      </Collapsible>
      
      <Section>
        <SectionTitle>
          Create Conversation
          <IconButton 
            onClick={() => setShowHelp(!showHelp)} 
            title="Show/hide help"
            style={{ marginLeft: '8px', background: 'transparent', padding: '0' }}
          >
            <HelpCircle size={16} />
          </IconButton>
        </SectionTitle>
        
        {showHelp && (
          <HelpPanel>
            <p>
              Create a WhatsApp conversation by adding messages below. Enter your text first, then optionally add buttons or an image. 
              Choose who sends the message using the sender toggle in the top right of each message card.
            </p>
            <Button variant="link" onClick={() => setShowHelp(false)}>Hide help</Button>
          </HelpPanel>
        )}
        
        <ConversationFlowContainer>
          <EditorTabs>
            <EditorTab 
              active={editorMode === 'visual'} 
              onClick={() => {
                if (editorMode === 'json') {
                  handleSwitchToVisualView();
                }
                setEditorMode('visual');
              }}
            >
              Visual Editor
            </EditorTab>
            <EditorTab 
              active={editorMode === 'json'} 
              onClick={() => {
                handleSwitchToJsonView();
                setEditorMode('json');
              }}
            >
              JSON Editor
            </EditorTab>
            <EditorTab
              active={editorMode === 'saved'}
              onClick={() => setEditorMode('saved')}
            >
              Saved Conversations
            </EditorTab>
          </EditorTabs>
          
          {editorMode === 'saved' ? (
            <SavedConversations
              conversations={savedConversations}
              onSelect={onLoadSavedConversation}
              onDelete={onDeleteSavedConversation}
              onSaveCurrent={onSaveCurrentConversation}
            />
          ) : editorMode === 'json' ? (
            <FormGroup>
              <Label>JSON Editor</Label>
              <ConversationTextArea
                value={conversationFlow}
                onChange={(e) => {
                  setConversationFlow(e.target.value);
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setSteps(parsed);
                    setConversationError('');
                  } catch (error) {
                    setConversationError('Invalid JSON format');
                  }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                {conversationError && <ErrorMessage>{conversationError}</ErrorMessage>}
                <ActionButton 
                  variant="primary" 
                  onClick={handleFormSubmit}
                  style={{ marginLeft: 'auto' }}
                  disabled={!!conversationError}
                >
                  Start Conversation
                </ActionButton>
              </div>
            </FormGroup>
          ) : (
            <>
              <QuickActionsBar>
                <Label>Quick Add Template:</Label>
                {STEP_TEMPLATES.map((template, index) => (
                  <TemplateButton
                    key={index}
                    variant="secondary"
                    onClick={() => handleTemplateAdd(template)}
                  >
                    {template.name}
                  </TemplateButton>
                ))}
              </QuickActionsBar>
              
              {steps.length === 0 ? (
                <EmptyState>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                  <h3>Create your WhatsApp conversation</h3>
                  <p style={{ margin: '8px 0 24px 0', color: 'var(--text-secondary)' }}>
                    Start by adding your first message:
                  </p>
                  <ButtonGroup>
                    <ActionButton variant="secondary" onClick={() => addStepBySender('them')}>
                      Add Message from {contact.name}
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={() => addStepBySender('me')}>
                      Add My Message
                    </ActionButton>
                  </ButtonGroup>
                </EmptyState>
              ) : (
                <StepsContainer className="steps-container">
                  {steps.map((step, index) => (
                    <StepForm 
                      key={index}
                      ref={(el: HTMLDivElement | null) => {
                        stepRefs.current[index] = el;
                      }}
                    >
                      <StepHeader>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <StepIndexBadge>{index + 1}</StepIndexBadge>
                          {step.type === 'button' ? 'Button' : 'Message'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <IconButton 
                            onClick={() => moveStepUp(index)}
                            title="Move Up"
                            disabled={index === 0}
                          >
                            <ArrowUp />
                          </IconButton>
                          <IconButton 
                            onClick={() => moveStepDown(index)}
                            title="Move Down"
                            disabled={index === steps.length - 1}
                          >
                            <ArrowDown />
                          </IconButton>
                          <IconButton 
                            onClick={() => duplicateStep(index)}
                            title="Duplicate"
                          >
                            <Copy />
                          </IconButton>
                          <IconButton 
                            variant="danger" 
                            onClick={() => removeStep(index)}
                            title="Delete"
                          >
                            <Trash2 />
                          </IconButton>
                        </div>
                      </StepHeader>
                      
                      <StepFormContent>
                        {/* Sender toggle in top right corner */}
                        <MessageSenderToggle>
                          <UserCircle size={14} />
                          <SenderOption 
                            active={step.sender === 'me'}
                            onClick={() => updateStep(index, { sender: 'me' })}
                          >
                            Me
                          </SenderOption>
                          <SenderOption 
                            active={step.sender === 'them'} 
                            onClick={() => updateStep(index, { sender: 'them' })}
                          >
                            {contact.name}
                          </SenderOption>
                        </MessageSenderToggle>
                        
                        {/* Always show text field first regardless of type */}
                        <FormGroup>
                          <Label>Message</Label>
                          <TextArea
                            value={step.text}
                            onChange={(e) => updateStep(index, { text: e.target.value })}
                            placeholder="Enter your message text here..."
                            style={{ minHeight: '100px' }}
                          />
                        </FormGroup>

                        {/* Attachment options below text */}
                        <AttachmentOptions>
                          <AttachmentButton 
                            onClick={() => toggleImageOnMessage(index)}
                            active={!!step.imageUrl}
                          >
                            <Image size={16} /> 
                            {step.imageUrl ? 'Remove Image' : 'Add Image'}
                          </AttachmentButton>
                          
                          <AttachmentButton
                            onClick={() => addButtonToMessage(index)}
                            active={step.buttons && step.buttons.length > 0}
                          >
                            <PlusCircle size={16} /> 
                            Add Button {step.buttons ? `(${step.buttons.length}/5)` : '(0/5)'}
                          </AttachmentButton>
                        </AttachmentOptions>
                        
                        {/* Show image section if image toggled on */}
                        {step.imageUrl !== undefined && (
                          <ImageSection>
                            <Label>Image</Label>
                            <ImageUploadButton>
                              <span>{step.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      // Use the message text as caption and store image URL
                                      updateStep(index, { 
                                        imageUrl: event.target?.result as string,
                                        caption: step.text // Use message text as caption
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </ImageUploadButton>
                            
                            {step.imageUrl && (
                              <ImagePreview>
                                <img src={step.imageUrl} alt="Preview" />
                                <RemoveImageButton
                                  variant="danger"
                                  onClick={() => updateStep(index, { imageUrl: undefined })}
                                  title="Remove Image"
                                >
                                  ✕
                                </RemoveImageButton>
                              </ImagePreview>
                            )}
                            
                            {/* Caption note - no separate input needed */}
                            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                              <i>The message text above will be used as the image caption</i>
                            </div>
                          </ImageSection>
                        )}
                        
                        {/* Show buttons section if any buttons added */}
                        {step.buttons && step.buttons.length > 0 && (
                          <ButtonSection>
                            <Label>Buttons</Label>
                            <ButtonList>
                              {step.buttons.map((button, btnIndex) => (
                                <ButtonItem key={btnIndex}>
                                  <ButtonCount>{btnIndex + 1}</ButtonCount>
                                  <div style={{ flex: 1 }}>
                                    <Input
                                      placeholder="Button text"
                                      value={button.text}
                                      onChange={(e) => updateMessageButton(
                                        index,
                                        btnIndex,
                                        { text: e.target.value }
                                      )}
                                      style={{ marginBottom: '8px' }}
                                    />
                                    <Input
                                      placeholder="URL (optional)"
                                      value={button.url || ''}
                                      onChange={(e) => updateMessageButton(
                                        index,
                                        btnIndex,
                                        { url: e.target.value }
                                      )}
                                    />
                                    
                                    {button.url && (
                                      <div style={{ 
                                        marginTop: '8px', 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                        fontSize: '13px'
                                      }}>
                                        <label style={{ marginRight: '16px' }}>
                                          <input
                                            type="radio"
                                            name={`button-${index}-${btnIndex}-target`}
                                            checked={button.openInWebView}
                                            onChange={() => updateMessageButton(
                                              index,
                                              btnIndex,
                                              { openInWebView: true }
                                            )}
                                            style={{ marginRight: '4px' }}
                                          />
                                          Open in WhatsApp
                                        </label>
                                        <label>
                                          <input
                                            type="radio"
                                            name={`button-${index}-${btnIndex}-target`}
                                            checked={!button.openInWebView}
                                            onChange={() => updateMessageButton(
                                              index,
                                              btnIndex,
                                              { openInWebView: false }
                                            )}
                                            style={{ marginRight: '4px' }}
                                          />
                                          Open in new tab
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                  <IconButton
                                    variant="danger"
                                    onClick={() => removeButtonFromMessage(index, btnIndex)}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </ButtonItem>
                              ))}
                            </ButtonList>
                            
                            {step.buttons.length < 5 && (
                              <div style={{ marginTop: '12px', textAlign: 'right' }}>
                                <Button 
                                  onClick={() => addButtonToMessage(index)}
                                  variant="secondary"
                                >
                                  Add Another Button
                                </Button>
                              </div>
                            )}
                          </ButtonSection>
                        )}
                        
                        {/* Simplified delay selector */}
                        <DelaySelector>
                          <Clock size={14} style={{ marginRight: '4px' }} />
                          <span>Delay:</span>
                          <DelayOption 
                            active={step.delay === 0}
                            onClick={() => updateStep(index, { delay: 0 })}
                          >
                            0ms
                          </DelayOption>
                          <DelayOption 
                            active={step.delay === 1000}
                            onClick={() => updateStep(index, { delay: 1000 })}
                          >
                            1s (default)
                          </DelayOption>
                          <DelayOption 
                            active={step.delay === 2000}
                            onClick={() => updateStep(index, { delay: 2000 })}
                          >
                            2s
                          </DelayOption>
                          <span>or</span>
                          <Input
                            type="number"
                            value={step.delay ?? 0}
                            onChange={(e) => updateStep(index, { delay: Math.max(0, Number(e.target.value)) })}
                            min="0"
                            step="100"
                            style={{ width: '70px', padding: '4px', fontSize: '13px' }}
                          />
                          <span>ms</span>
                        </DelaySelector>
                      </StepFormContent>
                    </StepForm>
                  ))}
                </StepsContainer>
              )}
              
              <ActionBar>
                <ButtonGroup>
                  <ActionButton variant="secondary" onClick={() => addStepBySender('them')}>
                    + Message from {contact.name}
                  </ActionButton>
                  <ActionButton variant="secondary" onClick={() => addStepBySender('me')}>
                    + My Message
                  </ActionButton>
                </ButtonGroup>
                <ButtonGroup>
                  <ActionButton 
                    variant="secondary" 
                    onClick={handlePreview}
                  >
                    Preview Flow
                  </ActionButton>
                  <ActionButton variant="primary" onClick={handleFormSubmit}>
                    Start Conversation
                  </ActionButton>
                </ButtonGroup>
              </ActionBar>
              
              <PreviewOverlay show={showPreview}>
                <PreviewContainer>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2>Conversation Preview</h2>
                    <Button variant="secondary" onClick={() => setShowPreview(false)}>
                      Close Preview
                    </Button>
                  </div>
                  <PhonePreview
                    contact={contact}
                    messages={previewMessages}
                    onUpdateMessage={onUpdateMessage}
                  />
                </PreviewContainer>
              </PreviewOverlay>
            </>
          )}
        </ConversationFlowContainer>
      </Section>
      
      <Section>
        <SectionTitle>Message History</SectionTitle>
        {messages.length > 0 ? (
          <div>
            <MessageList>
              {messages.map((message) => (
                <MessageItem key={message.id} sender={message.sender}>
                  <MessageContent>
                    {message.text} {message.type === 'button' ? '(Button)' : ''}
                  </MessageContent>
                  <MessageActions>
                    {message.sender === 'me' && (
                      <Select
                        value={message.status}
                        onChange={(e) => onUpdateMessage(message.id, { status: e.target.value as MessageStatus })}
                        style={{ padding: '4px', fontSize: '12px' }}
                      >
                        <option value="sending">Sending</option>
                        <option value="sent">Sent</option>
                        <option value="delivered">Delivered</option>
                        <option value="read">Read</option>
                      </Select>
                    )}
                    <Button 
                      variant="danger" 
                      onClick={() => onDeleteMessage(message.id)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Delete
                    </Button>
                  </MessageActions>
                </MessageItem>
              ))}
            </MessageList>
            <Button variant="danger" onClick={onClearMessages}>
              Clear All Messages
            </Button>
          </div>
        ) : (
          <p>No messages yet. Add some messages above.</p>
        )}
      </Section>
    </Container>
  );
};

// Add this new styled component for the help panel
const HelpPanel = styled.div`
  background-color: #f0f9ff;
  border-left: 4px solid var(--whatsapp-blue);
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 14px;
  
  p {
    margin: 0 0 8px 0;
    color: var(--text-secondary);
    line-height: 1.5;
  }
`;

const MessageTypeCard = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 8px;
  background-color: ${props => props.active ? 'rgba(37, 211, 102, 0.1)' : 'white'};
  border: 1px solid ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--border-color)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  
  svg {
    margin-bottom: 8px;
    color: ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--text-secondary)'};
  }
`

const MessageTypeTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
`

const MessageTypeDescription = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 4px;
`

const DelayPresetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
`

const DelayPresetRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const DelayOption = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--border-color)'};
  background: ${props => props.active ? 'var(--whatsapp-teal)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.active ? 'var(--whatsapp-teal)' : 'rgba(37, 211, 102, 0.1)'};
  }
`

const ButtonOptions = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid var(--border-color);
`

const ButtonOptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const ButtonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`

const ButtonItem = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
`

const ButtonCount = styled.div`
  background-color: var(--whatsapp-teal);
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 500;
`

const MessageSenderToggle = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const SenderOption = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'var(--whatsapp-teal)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--border-color)'};
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'var(--whatsapp-teal)' : 'rgba(0,0,0,0.05)'};
  }
`;

const AttachmentOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const AttachmentButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.active ? 'rgba(37, 211, 102, 0.1)' : 'transparent'};
  border: 1px solid ${props => props.active ? 'var(--whatsapp-teal)' : 'var(--border-color)'};
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0,0,0,0.05);
  }
`;

const ImageSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
`;

const ButtonSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
`;

const DelaySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
`;

export default ControlPanel;