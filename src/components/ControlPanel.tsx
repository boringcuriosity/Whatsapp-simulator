import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Message, Contact, MessageStatus, ContactStatus, ConversationStep } from '../types'
import PhonePreview from './PhonePreview'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  position: relative; // Added position relative to establish a positioning context
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
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
`

const MessageTypeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
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
`

const PreviewContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
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

interface ControlPanelProps {
  contact: Contact;
  messages: Message[];
  onUpdateContact: (contact: Partial<Contact>) => void;
  onAddMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
  onUpdateMessage: (id: string, updates: Partial<Message>) => void;
  onDeleteMessage: (id: string) => void;
  onClearMessages: () => void;
  onStartConversation: (steps: ConversationStep[]) => void;
}

const ControlPanel = ({
  contact,
  messages,
  onUpdateContact,
  onAddMessage,
  onUpdateMessage,
  onDeleteMessage,
  onClearMessages,
  onStartConversation
}: ControlPanelProps) => {
  const [contactSettingsOpen, setContactSettingsOpen] = useState(false);
  const [messageType, setMessageType] = useState<'text' | 'business' | 'conversation'>('conversation');
  const [newTextMessage, setNewTextMessage] = useState({
    text: '',
    sender: 'me' as 'me' | 'them'
  });
  
  const [businessMessage, setBusinessMessage] = useState({
    text: '',
    options: ['Yes', 'No'],
    phoneNumber: '+91 9849364734',
    highlightedText: '',
    sender: 'them' as 'me' | 'them'
  });

  const [conversationFlow, setConversationFlow] = useState(`[
  {
    "text": "Is +91 9849364734 linked to your business bank accounts?",
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
    "text": "Share consent ↗",
    "sender": "them",
    "type": "button",
    "isBusinessMessage": true,
    "delay": 0
  }
]`);

  const [conversationError, setConversationError] = useState('');

  const [steps, setSteps] = useState<ConversationStep[]>(() => {
    try {
      return JSON.parse(conversationFlow);
    } catch {
      return [];
    }
  });
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);

  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  const updateStep = (index: number, updates: Partial<ConversationStep>) => {
    setSteps(steps.map((step, i) => 
      i === index ? { ...step, ...updates } : step
    ));
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleFormSubmit = () => {
    if (steps.length === 0) {
      setConversationError('Please add at least one step to the conversation');
      return;
    }
    onStartConversation(steps);
    setConversationError('');
  };

  const handleAddTextMessage = () => {
    if (newTextMessage.text.trim()) {
      onAddMessage({
        text: newTextMessage.text,
        sender: newTextMessage.sender,
        type: 'text'
      });
      setNewTextMessage({ ...newTextMessage, text: '' });
    }
  };

  const handleAddBusinessMessage = () => {
    if (businessMessage.text.trim()) {
      // Format the business message with phone number highlight if needed
      let formattedText = businessMessage.text;
      
      if (businessMessage.highlightedText) {
        formattedText = formattedText.replace(
          businessMessage.highlightedText, 
          `*${businessMessage.highlightedText}*`
        );
      }
      
      // Add the main message
      onAddMessage({
        text: formattedText,
        sender: businessMessage.sender,
        type: 'text',
        isBusinessMessage: true
      });
      
      // Add option buttons as separate messages if there are any
      if (businessMessage.options.length > 0) {
        businessMessage.options.forEach(option => {
          onAddMessage({
            text: option,
            sender: businessMessage.sender,
            type: 'button',
            buttonText: option,
            isBusinessMessage: true
          });
        });
      }
      
      // Clear the input
      setBusinessMessage({
        ...businessMessage,
        text: ''
      });
    }
  };

  const addOption = () => {
    setBusinessMessage({
      ...businessMessage,
      options: [...businessMessage.options, '']
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...businessMessage.options];
    newOptions[index] = value;
    setBusinessMessage({
      ...businessMessage,
      options: newOptions
    });
  };

  const removeOption = (index: number) => {
    setBusinessMessage({
      ...businessMessage,
      options: businessMessage.options.filter((_, i) => i !== index)
    });
  };

  const handleTemplateAdd = (template: typeof STEP_TEMPLATES[number]) => {
    const newSteps = [...steps];
    
    // Add the main message
    newSteps.push({
      ...template.template,
      text: template.template.text
    });
    
    // Add buttons if they exist
    if (template.buttons) {
      template.buttons.forEach(buttonText => {
        newSteps.push({
          text: buttonText,
          sender: 'them',
          type: 'button',
          isBusinessMessage: true,
          delay: 0,
          buttonText
        });
      });
    }
    
    setSteps(newSteps);
  };

  useEffect(() => {
    if (showJsonPreview) {
      setConversationFlow(JSON.stringify(steps, null, 2));
    }
  }, [steps, showJsonPreview]);

  const addStepBySender = (sender: 'me' | 'them') => {
    setSteps([...steps, {
      text: '',
      sender,
      delay: 1000,
      type: 'text',
      isBusinessMessage: false
    }]);
  };

  const duplicateStep = (index: number) => {
    const newSteps = [...steps];
    const duplicatedStep = { ...newSteps[index] };
    newSteps.splice(index + 1, 0, duplicatedStep);
    setSteps(newSteps);
  };

  const handleSwitchToJsonView = () => {
    try {
      setConversationFlow(JSON.stringify(steps, null, 2));
      setShowJsonPreview(true);
      setConversationError('');
    } catch (error) {
      setConversationError('Error converting steps to JSON');
    }
  };

  const handleSwitchToVisualView = () => {
    try {
      const parsed = JSON.parse(conversationFlow);
      setSteps(parsed);
      setShowJsonPreview(false);
      setConversationError('');
    } catch (error) {
      setConversationError('Invalid JSON format. Fix the errors before switching to Visual Editor.');
    }
  };

  const handlePreview = () => {
    if (steps.length === 0) {
      setConversationError('Add some steps to preview the conversation');
      return;
    }
    
    const previewMessages = steps.map((step, index) => ({
      id: `preview-${index}`,
      ...step,
      timestamp: new Date(),
      status: 'sent' as const
    }));
    
    setPreviewMessages(previewMessages);
    setShowPreview(true);
  };

  const moveStepUp = (index: number) => {
    if (index > 0) {
      const newSteps = [...steps];
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      setSteps(newSteps);
      
      // Scroll the moved message into view after state update
      setTimeout(() => {
        stepRefs.current[index - 1]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 0);
    }
  };

  const moveStepDown = (index: number) => {
    if (index < steps.length - 1) {
      const newSteps = [...steps];
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      setSteps(newSteps);
      
      // Scroll the moved message into view after state update
      setTimeout(() => {
        stepRefs.current[index + 1]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 0);
    }
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
        <SectionTitle>Add New Message</SectionTitle>
        
        <MessageTypeSelector>
          <MessageTypeButton 
            active={messageType === 'text'} 
            onClick={() => setMessageType('text')}
          >
            Text Message
          </MessageTypeButton>
          <MessageTypeButton 
            active={messageType === 'business'} 
            onClick={() => setMessageType('business')}
          >
            Business Message
          </MessageTypeButton>
          <MessageTypeButton 
            active={messageType === 'conversation'} 
            onClick={() => setMessageType('conversation')}
          >
            Conversation Flow
          </MessageTypeButton>
        </MessageTypeSelector>
        
        {messageType === 'text' ? (
          <MessageInputContainer>
            <FormGroup>
              <Label htmlFor="messageText">Message Text</Label>
              <TextArea
                id="messageText"
                value={newTextMessage.text}
                onChange={(e) => setNewTextMessage({ ...newTextMessage, text: e.target.value })}
                placeholder="Type your message here..."
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Sender</Label>
              <ButtonGroup>
                <Button 
                  variant={newTextMessage.sender === 'me' ? 'primary' : 'secondary'}
                  onClick={() => setNewTextMessage({ ...newTextMessage, sender: 'me' })}
                >
                  Me
                </Button>
                <Button 
                  variant={newTextMessage.sender === 'them' ? 'primary' : 'secondary'}
                  onClick={() => setNewTextMessage({ ...newTextMessage, sender: 'them' })}
                >
                  {contact.name}
                </Button>
              </ButtonGroup>
            </FormGroup>
            
            <Button variant="primary" onClick={handleAddTextMessage}>
              Add Message
            </Button>
          </MessageInputContainer>
        ) : messageType === 'business' ? (
          <MessageInputContainer>
            <FormGroup>
              <Label htmlFor="businessMessageText">Business Message Text</Label>
              <TextArea
                id="businessMessageText"
                value={businessMessage.text}
                onChange={(e) => setBusinessMessage({ ...businessMessage, text: e.target.value })}
                placeholder="Type your business message here..."
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="phoneNumber">Phone Number to Highlight (optional)</Label>
              <Input
                id="phoneNumber"
                value={businessMessage.phoneNumber}
                onChange={(e) => setBusinessMessage({ ...businessMessage, phoneNumber: e.target.value })}
                placeholder="+91 9849364734"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="highlightedText">Text to Highlight (optional)</Label>
              <Input
                id="highlightedText"
                value={businessMessage.highlightedText}
                onChange={(e) => setBusinessMessage({ ...businessMessage, highlightedText: e.target.value })}
                placeholder="Text to make bold"
              />
            </FormGroup>
            
            <BusinessOptionsContainer>
              <Label>Interactive Buttons</Label>
              <OptionButtonsContainer>
                {businessMessage.options.map((option, index) => (
                  <OptionButton key={index}>
                    <OptionInput
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Button ${index + 1}`}
                    />
                    <RemoveButton onClick={() => removeOption(index)}>
                      Remove
                    </RemoveButton>
                  </OptionButton>
                ))}
              </OptionButtonsContainer>
              
              <Button variant="secondary" onClick={addOption}>
                Add Button
              </Button>
            </BusinessOptionsContainer>
            
            <FormGroup>
              <Label>Sender</Label>
              <ButtonGroup>
                <Button 
                  variant={businessMessage.sender === 'me' ? 'primary' : 'secondary'}
                  onClick={() => setBusinessMessage({ ...businessMessage, sender: 'me' })}
                >
                  Me
                </Button>
                <Button 
                  variant={businessMessage.sender === 'them' ? 'primary' : 'secondary'}
                  onClick={() => setBusinessMessage({ ...businessMessage, sender: 'them' })}
                >
                  {contact.name}
                </Button>
              </ButtonGroup>
            </FormGroup>
            
            <Button variant="primary" onClick={handleAddBusinessMessage}>
              Add Business Message
            </Button>
          </MessageInputContainer>
        ) : (
          <ConversationFlowContainer>
            <EditorTabs>
              <EditorTab 
                active={!showJsonPreview} 
                onClick={handleSwitchToVisualView}
              >
                Visual Editor
              </EditorTab>
              <EditorTab 
                active={showJsonPreview} 
                onClick={handleSwitchToJsonView}
              >
                JSON Editor
              </EditorTab>
            </EditorTabs>

            {!showJsonPreview ? (
              <>
                <QuickActionsBar>
                  <Label>Add Template:</Label>
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
                    <h3>No conversation steps yet</h3>
                    <p style={{ margin: '8px 0 24px 0', color: 'var(--text-secondary)' }}>
                      Add steps to create your conversation flow
                    </p>
                    <ButtonGroup>
                      <ActionButton variant="secondary" onClick={() => addStepBySender('them')}>
                        Add Message from Them
                      </ActionButton>
                      <ActionButton variant="secondary" onClick={() => addStepBySender('me')}>
                        Add Message from Me
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
                          <StepTypeSelector>
                            <Label style={{ marginRight: '8px', alignSelf: 'center' }}>Message from:</Label>
                            <TypeSelectorButton 
                              active={step.sender === 'me'}
                              onClick={() => updateStep(index, { sender: 'me' })}
                            >
                              Me
                            </TypeSelectorButton>
                            <TypeSelectorButton 
                              active={step.sender === 'them'}
                              onClick={() => updateStep(index, { sender: 'them' })}
                            >
                              {contact.name}
                            </TypeSelectorButton>
                          </StepTypeSelector>

                          <StepTypeSelector>
                            <Label style={{ marginRight: '8px', alignSelf: 'center' }}>Type:</Label>
                            <TypeSelectorButton 
                              active={step.type !== 'image'}
                              onClick={() => updateStep(index, { 
                                type: 'text',
                                imageUrl: undefined,
                                caption: undefined
                              })}
                            >
                              Message
                            </TypeSelectorButton>
                            <TypeSelectorButton 
                              active={step.type === 'image'}
                              onClick={() => updateStep(index, { 
                                type: 'image',
                                text: ''
                              })}
                            >
                              Image
                            </TypeSelectorButton>
                            <TypeSelectorButton 
                              active={step.type === 'button'}
                              onClick={() => updateStep(index, { 
                                type: 'button',
                                isBusinessMessage: true
                              })}
                            >
                              Button
                            </TypeSelectorButton>
                          </StepTypeSelector>

                          {step.type === 'image' ? (
                            <>
                              <FormGroup>
                                <ImageUploadButton>
                                  <span>📷 {step.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          updateStep(index, { 
                                            imageUrl: event.target?.result as string,
                                            text: file.name
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
                                      onClick={() => updateStep(index, { 
                                        imageUrl: undefined,
                                        text: '',
                                        caption: undefined
                                      })}
                                      title="Remove Image"
                                    >
                                      ✕
                                    </RemoveImageButton>
                                  </ImagePreview>
                                )}
                              </FormGroup>
                              
                              <FormGroup>
                                <Label>Caption (optional)</Label>
                                <Input
                                  value={step.caption || ''}
                                  onChange={(e) => updateStep(index, { 
                                    caption: e.target.value,
                                    text: e.target.value // Keep text in sync for compatibility
                                  })}
                                  placeholder="Add a caption..."
                                />
                              </FormGroup>
                            </>
                          ) : step.type === 'button' ? (
                            <>
                              <FormGroup>
                                <Label>Button Text</Label>
                                <Input
                                  value={step.buttonText || step.text}
                                  onChange={(e) => updateStep(index, { 
                                    text: e.target.value,
                                    buttonText: e.target.value 
                                  })}
                                  placeholder="Enter button text..."
                                />
                              </FormGroup>
                              <FormGroup>
                                <Label>Link URL (optional)</Label>
                                <Input
                                  value={step.link || ''}
                                  onChange={(e) => updateStep(index, { link: e.target.value })}
                                  placeholder="https://..."
                                  type="url"
                                />
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                  If provided, clicking the button will open this link in a new tab
                                </p>
                              </FormGroup>
                            </>
                          ) : (
                            <FormGroup>
                              <Label>Message Text</Label>
                              <TextArea
                                value={step.text}
                                onChange={(e) => updateStep(index, { text: e.target.value })}
                                placeholder="Enter your message..."
                                style={{ minHeight: '100px' }}
                              />
                            </FormGroup>
                          )}

                          <FormGroup>
                            <Label>Delay before showing</Label>
                            <DelayInput>
                              <DelaySlider
                                type="range"
                                min="0"
                                max="3000"
                                step="100"
                                value={step.delay ?? 0}
                                onChange={(e) => updateStep(index, { delay: Number(e.target.value) })}
                              />
                              <Input
                                type="number"
                                value={step.delay ?? 0}
                                onChange={(e) => updateStep(index, { delay: Math.max(0, Number(e.target.value)) })}
                                min="0"
                                step="100"
                                style={{ width: '80px' }}
                              />
                              <Label>ms</Label>
                            </DelayInput>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                              {[0, 500, 1000, 1500, 2000].map(delay => (
                                <DelayPreset
                                  key={delay}
                                  active={step.delay === delay}
                                  onClick={() => updateStep(index, { delay })}
                                >
                                  {delay}ms
                                </DelayPreset>
                              ))}
                            </div>
                          </FormGroup>

                          {step.sender === 'them' && (
                            <label style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
                              <input
                                type="checkbox"
                                checked={step.isBusinessMessage || false}
                                onChange={(e) => updateStep(index, { isBusinessMessage: e.target.checked })}
                                style={{ marginRight: '8px' }}
                              />
                              Show as business message
                            </label>
                          )}
                        </StepFormContent>
                      </StepForm>
                    ))}
                  </StepsContainer>
                )}

                <ActionBar>
                  <ButtonGroup>
                    <ActionButton variant="secondary" onClick={() => addStepBySender('them')}>
                      + Message from Them
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={() => addStepBySender('me')}>
                      + Message from Me
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
                    />
                  </PreviewContainer>
                </PreviewOverlay>
              </>
            ) : (
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
            )}
          </ConversationFlowContainer>
        )}
      </Section>
      
      <Section>
        <SectionTitle>Message History</SectionTitle>
        {messages.length > 0 ? (
          <>
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
          </>
        ) : (
          <p>No messages yet. Add some messages above.</p>
        )}
      </Section>
    </Container>
  );
};

export default ControlPanel;