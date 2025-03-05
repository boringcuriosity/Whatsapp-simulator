import styled, { keyframes, css } from 'styled-components'
import { format } from 'date-fns'
import { Message, Contact } from '../types'
import { useEffect, useRef } from 'react'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const PhoneFrame = styled.div`
  width: 375px;
  height: 667px;
  background-color: #111;
  border-radius: 40px;
  padding: 15px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
`

const PhoneScreen = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 30px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const ChatHeader = styled.div`
  background-color: var(--whatsapp-header);
  color: white;
  padding: 10px;
  display: flex;
  align-items: center;
  height: 60px;
`

const BackButton = styled.div`
  margin-right: 10px;
  font-size: 20px;
  display: flex;
  align-items: center;
  
  &::before {
    content: '←';
  }
`

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
`

const ContactInfo = styled.div`
  flex: 1;
`

const ContactName = styled.div`
  font-weight: 600;
  font-size: 16px;
`

const ContactStatus = styled.div`
  font-size: 12px;
  opacity: 0.8;
`

const HeaderIcons = styled.div`
  display: flex;
  gap: 15px;
  
  & > div {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const ChatBody = styled.div`
  flex: 1;
  background-color: var(--whatsapp-chat-bg);
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
`

const MessageBubble = styled.div<{ sender: 'me' | 'them', isNew?: boolean, isBusinessMessage?: boolean, isClickable?: boolean }>`
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 8px;
  position: relative;
  word-wrap: break-word;
  align-self: ${props => props.sender === 'me' ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.sender === 'me' ? 'var(--whatsapp-light-green)' : 'white'};
  
  ${props => props.isNew && css`
    animation: ${fadeIn} 0.3s ease-out;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    width: 12px;
    height: 12px;
    ${props => props.sender === 'me' 
      ? 'right: -6px; background: radial-gradient(circle at top left, transparent 70%, var(--whatsapp-light-green) 0);' 
      : 'left: -6px; background: radial-gradient(circle at top right, transparent 70%, white 0);'
    }
  }
  cursor: ${props => props.isClickable ? 'pointer' : 'default'};

  &:hover {
    ${props => props.isClickable && `
      background-color: ${props.sender === 'me' ? '#c8e6c9' : '#f5f5f5'};
    `}
  }
`

const ImageMessageBubble = styled(MessageBubble)`
  padding: 4px;
  background: white;
  
  img {
    width: 100%;
    max-width: 300px;
    border-radius: 4px;
    display: block;
  }
`

const ButtonLink = styled.a`
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
  height: 100%;
  
  &:hover {
    text-decoration: none;
  }
`

const MessageText = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.4;
  
  b, strong {
    font-weight: 600;
  }
`

const ImageCaption = styled(MessageText)`
  padding: 8px 4px 4px 4px;
  color: var(--text-secondary);
`

const MessageMeta = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
`

const MessageTime = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
`

const MessageStatus = styled.span<{ status: string }>`
  display: inline-block;
  width: 16px;
  height: 12px;
  position: relative;
  
  &::before {
    content: '✓';
    font-size: 11px;
    position: absolute;
    right: 0;
  }
  
  &::after {
    content: ${props => props.status === 'read' ? "'✓'" : "''"};
    font-size: 11px;
    position: absolute;
    right: 4px;
    color: ${props => props.status === 'read' ? '#53bdeb' : 'inherit'};
  }
`

const ChatFooter = styled.div`
  background-color: #f0f2f5;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const EmojiButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  &::before {
    content: '😊';
    font-size: 20px;
  }
`

const AttachButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  &::before {
    content: '📎';
    font-size: 20px;
  }
`

const InputField = styled.div`
  flex: 1;
  background-color: white;
  border-radius: 20px;
  padding: 9px 12px;
  font-size: 15px;
  color: var(--text-secondary);
  
  &::before {
    content: 'Type a message';
    opacity: 0.6;
  }
`

const MicButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--whatsapp-teal);
  
  &::before {
    content: '🎤';
    font-size: 20px;
  }
`

// Business message components
const BusinessButton = styled.div`
  width: 100%;
  padding: 12px;
  margin: 4px 0;
  background-color: white;
  border-radius: 8px;
  text-align: center;
  color: var(--whatsapp-blue);
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

const BusinessMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 70%;
  align-self: flex-start;
  margin-bottom: 8px;
`

interface PhonePreviewProps {
  contact: Contact;
  messages: Message[];
}

const PhonePreview = ({ contact, messages }: PhonePreviewProps) => {
  const chatBodyRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const formatMessageTime = (date: Date) => {
    return format(date, 'HH:mm');
  };
  
  const getStatusDisplay = () => {
    if (contact.status === 'online') {
      return 'online';
    } else if (contact.status === 'typing') {
      return 'typing...';
    } else {
      return `last seen ${format(contact.lastSeen, 'HH:mm')}`;
    }
  };

  // Group messages for business message display
  const renderMessages = () => {
    const result = [];
    let currentBusinessGroup: Message[] = [];
    let businessGroupSender: 'me' | 'them' | null = null;
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const isNew = i === messages.length - 1;
      
      // If this is a business message button and we have a current group with the same sender
      if (message.type === 'button' && message.isBusinessMessage && businessGroupSender === message.sender) {
        currentBusinessGroup.push(message);
        continue;
      }
      
      // If we have a business group and the current message doesn't belong to it
      if (currentBusinessGroup.length > 0 && (message.sender !== businessGroupSender || !message.isBusinessMessage || message.type !== 'button')) {
        // Render the business group
        result.push(
          <BusinessMessageContainer key={`business-group-${currentBusinessGroup[0].id}`}>
            {currentBusinessGroup.map((buttonMsg) => (
              <BusinessButton 
                key={buttonMsg.id}
                onClick={() => {
                  if (buttonMsg.link) {
                    window.open(buttonMsg.link, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                {buttonMsg.text}
                {buttonMsg.link && ' ↗'}
              </BusinessButton>
            ))}
          </BusinessMessageContainer>
        );
        
        // Reset the business group
        currentBusinessGroup = [];
        businessGroupSender = null;
      }
      
      // If this is a new business button message
      if (message.type === 'button' && message.isBusinessMessage) {
        businessGroupSender = message.sender;
        currentBusinessGroup.push(message);
      } else {
        // Regular message - use dangerouslySetInnerHTML only if message contains asterisks
        // Otherwise, directly render the text
        const containsFormatting = message.text.includes('*');
        
        const messageContent = (
          <>
            {message.type === 'image' ? (
              <>
                <img src={message.imageUrl} alt={message.caption || 'Image message'} />
                {message.caption && <ImageCaption>{message.caption}</ImageCaption>}
              </>
            ) : (
              <MessageText>
                {containsFormatting ? (
                  <span dangerouslySetInnerHTML={{ 
                    __html: message.text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>') 
                  }} />
                ) : message.text}
              </MessageText>
            )}
            <MessageMeta>
              <MessageTime>{formatMessageTime(message.timestamp)}</MessageTime>
              {message.sender === 'me' && (
                <MessageStatus status={message.status} />
              )}
            </MessageMeta>
          </>
        );

        result.push(
          message.type === 'image' ? (
            <ImageMessageBubble
              key={message.id} 
              sender={message.sender}
              isNew={isNew}
              isBusinessMessage={message.isBusinessMessage}
            >
              {messageContent}
            </ImageMessageBubble>
          ) : (
            <MessageBubble 
              key={message.id} 
              sender={message.sender}
              isNew={isNew}
              isBusinessMessage={message.isBusinessMessage}
              isClickable={!!message.link}
              onClick={() => {
                if (message.link) {
                  window.open(message.link, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {messageContent}
            </MessageBubble>
          )
        );
      }
    }
    
    // Don't forget to render any remaining business group
    if (currentBusinessGroup.length > 0) {
      result.push(
        <BusinessMessageContainer key={`business-group-${currentBusinessGroup[0].id}`}>
          {currentBusinessGroup.map((buttonMsg) => (
            <BusinessButton 
              key={buttonMsg.id}
              onClick={() => {
                if (buttonMsg.link) {
                  window.open(buttonMsg.link, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              {buttonMsg.buttonText || buttonMsg.text}
              {buttonMsg.link && ' ↗'}
            </BusinessButton>
          ))}
        </BusinessMessageContainer>
      );
    }
    
    return result;
  };

  return (
    <PhoneFrame>
      <PhoneScreen>
        <ChatHeader>
          <BackButton />
          <Avatar src={contact.avatar} alt={contact.name} />
          <ContactInfo>
            <ContactName>{contact.name}</ContactName>
            <ContactStatus>{getStatusDisplay()}</ContactStatus>
          </ContactInfo>
          <HeaderIcons>
            <div>📞</div>
            <div>📹</div>
            <div>⋮</div>
          </HeaderIcons>
        </ChatHeader>
        
        <ChatBody ref={chatBodyRef}>
          {renderMessages()}
        </ChatBody>
        
        <ChatFooter>
          <EmojiButton />
          <AttachButton />
          <InputField />
          <MicButton />
        </ChatFooter>
      </PhoneScreen>
    </PhoneFrame>
  );
};

export default PhonePreview;