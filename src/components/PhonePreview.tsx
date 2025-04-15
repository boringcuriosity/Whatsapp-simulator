import styled, { keyframes, css } from 'styled-components'
import { format } from 'date-fns'
import { Message, Contact } from '../types'
import { useEffect, useRef, useState } from 'react'

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
  width: 360px;  /* Adjusted base width */
  height: 740px; /* Adjusted height to maintain aspect ratio */
  background-color: #111;
  border-radius: 40px;
  padding: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  transform-origin: center center; /* Center the scaling origin */

  /* Media queries for better responsiveness */
  @media (max-width: 768px) {
    width: 100%;
    max-width: 360px; /* Prevent phone from getting too large */
    height: calc(100vh - 40px); /* Account for some padding */
    max-height: 740px; /* Maintain max height */
    margin: 20px auto;
    border-radius: 20px;
    transform: scale(0.95); /* Slightly reduce size on mobile */
  }

  /* Fix for Windows laptops with lower height */
  @media (min-width: 769px) and (max-height: 800px) {
    transform: scale(0.85); /* More aggressive scaling for smaller screens */
    margin: -40px auto; /* Adjust vertical position to prevent cutting */
  }
  
  /* Medium height screens */
  @media (min-width: 769px) and (min-height: 801px) and (max-height: 900px) {
    transform: scale(0.9);
    margin: -20px auto;
  }
  
  /* Handle taller screens */
  @media (min-width: 769px) and (min-height: 901px) {
    transform: scale(1);
    margin: 0 auto;
  }
`

const PhoneScreen = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 34px;  /* Increased from 30px to 34px to match the reduced padding */
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    border-radius: 16px; /* Reduced border radius for mobile */
  }

  @media (min-width: 769px) and (max-height: 800px) {
    border-radius: 30px; /* Slightly reduce border radius for smaller screens */
  }
`

const ChatHeader = styled.div`
  background-color: var(--whatsapp-header);
  color: white;
  padding: 10px;
  display: flex;
  align-items: center;
  height: 60px;

  @media (max-width: 768px) {
    height: 56px;
    padding: 8px 16px;
  }
`

const BackButton = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  
  img {
    width: 18px;
    height: 18px;
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
  gap: 4px;
  
  & > div {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  img {
    width: 18px;
    height: 18px;
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
  background-image: url('/Whatsapp-chat-backgroung.png');
  background-size: cover;
  background-position: center;

  /* Hide the vertical scroll bar */
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */
  &::-webkit-scrollbar {
    display: none; /* For Chrome, Safari, and Opera */
  }

  @media (max-width: 768px) {
    padding: 8px;
  }
`

const TimestampDivider = styled.div`
  align-self: center;
  background-color: #D5EAF7;
  color: rgba(0, 0, 0, 0.7);
  font-size: 12.5px;
  padding: 5px 12px;
  border-radius: 7px;
  margin: 10px 0;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
`

const MessageBubble = styled.div<{ sender: 'me' | 'them', isNew?: boolean, isBusinessMessage?: boolean, isClickable?: boolean }>`
  max-width: 70%;
  padding: 8px 12px;
  position: relative;
  word-wrap: break-word;
  align-self: ${props => props.sender === 'me' ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.sender === 'me' ? 'var(--whatsapp-light-green)' : 'white'};
  
  /* Apply specific border-radius to each corner */
  border-radius: 8px;
  ${props => props.sender === 'me' 
    ? 'border-top-right-radius: 2px;' /* Reduce top-right radius for 'me' messages */
    : 'border-top-left-radius: 2px;'  /* Reduce top-left radius for 'them' messages */
  }
  
  ${props => props.isNew && css`
    animation: ${fadeIn} 0.3s ease-out;
  `}

  @media (max-width: 768px) {
    max-width: 85%;
    padding: 6px 10px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0px;
    width: 0;
    height: 0;
    ${props => props.sender === 'me' 
      ? `
        right: -8px;
        border-left: 8px solid var(--whatsapp-light-green);
        border-bottom: 8px solid transparent;
      ` 
      : `
        left: -8px;
        border-right: 8px solid white;
        border-bottom: 8px solid transparent;
      `
    }
  }
  
  cursor: ${props => props.isClickable ? 'pointer' : 'default'};
  &:hover {
    ${props => props.isClickable && `
      background-color: ${props.sender === 'me' ? '#c8e6c9' : '#f5f5f5'};
      
      &::before {
        ${props.sender === 'me'
          ? 'border-left-color: #c8e6c9;'
          : 'border-right-color: #f5f5f5;'
        }
      }
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

const MessageText = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.4;
  white-space: pre-wrap;  // Add this to preserve newlines
  
  b, strong {
    font-weight: 600;
  }
`

const ImageCaption = styled(MessageText)`
  padding: 8px 4px 4px 4px;
  color: var(--text-primary); /* Changed from var(--text-secondary) to primary for darker color */
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

  @media (max-width: 768px) {
    padding: 8px 12px;
    gap: 12px;
  }
`

const EmojiButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  img {
    width: 24px;
    height: 24px;
  }
`

const AttachButton = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  img {
    width: 24px;
    height: 24px;
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--whatsapp-teal);
  
  img {
    width: 32px;
    height: 32px;
  }
`

// Business message components
const BusinessButton = styled.div`
  width: 100%;
  padding: 12px 16px;
  margin: 4px 0;
  background-color: white;
  border-radius: 8px;
  text-align: center;
  color: #128C7E;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background-color: #f5f5f5;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 14px;
  }
`

const UrlIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  
  img {
    width: 18px; /* Increased from 14px to 18px to make the icon bigger */
    height: 18px; /* Increased from 14px to 18px to make the icon bigger */
  }
`

const BusinessMessageContainer = styled.div<{ sender?: 'me' | 'them' | null }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 70%;
  align-self: ${props => props.sender === 'me' ? 'flex-end' : 'flex-start'};
  margin-bottom: 8px;

  @media (max-width: 768px) {
    max-width: 85%;
  }
`

const WebViewContainer = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 10;
  display: ${props => props.isVisible ? 'flex' : 'none'};
  flex-direction: column;
  border-radius: 34px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    border-radius: 0;
  }
`

const WebViewHeader = styled.div`
  background-color: var(--whatsapp-header);
  color: white;
  padding: 10px;
  display: flex;
  align-items: center;
  height: 60px;

  @media (max-width: 768px) {
    height: 56px;
    padding: 8px 16px;
  }
`

const WebViewTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 10px;
`

const WebViewIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`

interface PhonePreviewProps {
  contact: Contact;
  messages: Message[];
  onUpdateMessage: (id: string, updates: Partial<Message>) => void;
}

const PhonePreview = ({ contact, messages }: PhonePreviewProps) => {
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [webViewTitle, setWebViewTitle] = useState<string>('');
  
  // Function to handle opening a link
  const handleOpenLink = (url: string, title: string = 'Web View', openInNewTab: boolean = false) => {
    if (openInNewTab || !url.startsWith('http')) {
      // Always use window.open directly for new tab or non-http links
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Use web view only for http(s) links when not opening in new tab
      setWebViewUrl(url);
      setWebViewTitle(title);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to close the web view
  const handleCloseWebView = () => {
    setWebViewUrl(null);
  };

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
          <BusinessMessageContainer key={`business-group-${currentBusinessGroup[0].id}`} sender={businessGroupSender}>
            {currentBusinessGroup.map((buttonMsg) => (
              <BusinessButton 
                key={buttonMsg.id}
                onClick={() => {
                  if (buttonMsg.link) {
                    // Use openLinkInWebView property directly
                    handleOpenLink(
                      buttonMsg.link, 
                      buttonMsg.buttonText || buttonMsg.text, 
                      buttonMsg.openLinkInWebView === false
                    );
                  }
                }}
              >
                {buttonMsg.buttonText || buttonMsg.text}
                {buttonMsg.link && <UrlIconWrapper><img src="/url icon.svg" alt="Link" /></UrlIconWrapper>}
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
      } else if (message.type === 'button') {
        // This is a button but not a business message, render it as a standalone button
        result.push(
          <BusinessMessageContainer key={`button-${message.id}`} sender={message.sender}>
            <BusinessButton 
              key={message.id}
              onClick={() => {
                if (message.link) {
                  // Use openLinkInWebView property directly
                  handleOpenLink(
                    message.link, 
                    message.buttonText || message.text, 
                    message.openLinkInWebView === false
                  );
                }
              }}
            >
              {message.buttonText || message.text}
              {message.link && <UrlIconWrapper><img src="/url icon.svg" alt="Link" /></UrlIconWrapper>}
            </BusinessButton>
          </BusinessMessageContainer>
        );
      } else {
        // Regular message - use dangerouslySetInnerHTML only if message contains asterisks
        // Otherwise, directly render the text
        const containsFormatting = message.text.includes('*');
        
        const messageContent = (
          <>
            {message.type === 'image' ? (
              <>
                <img src={message.imageUrl} alt={message.caption || 'Image message'} />
                {message.caption && (
                  <ImageCaption>{message.caption}</ImageCaption>
                )}
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
        
        // For regular messages with links
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
                  // Use openLinkInWebView property directly
                  handleOpenLink(
                    message.link, 
                    'Web View', 
                    message.openLinkInWebView === false
                  );
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
        <BusinessMessageContainer key={`business-group-${currentBusinessGroup[0].id}`} sender={businessGroupSender}>
          {currentBusinessGroup.map((buttonMsg) => (
            <BusinessButton 
              key={buttonMsg.id}
              onClick={() => {
                if (buttonMsg.link) {
                  // Use openLinkInWebView property directly
                  handleOpenLink(
                    buttonMsg.link, 
                    buttonMsg.buttonText || buttonMsg.text, 
                    buttonMsg.openLinkInWebView === false
                  );
                }
              }}
            >
              {buttonMsg.buttonText || buttonMsg.text}
              {buttonMsg.link && <UrlIconWrapper><img src="/url icon.svg" alt="Link" /></UrlIconWrapper>}
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
          <BackButton>
            <img src="/left arrow icon.svg" alt="Back" />
          </BackButton>
          <Avatar src={contact.avatar} alt={contact.name} />
          <ContactInfo>
            <ContactName>{contact.name}</ContactName>
            <ContactStatus>{getStatusDisplay()}</ContactStatus>
          </ContactInfo>
          <HeaderIcons>
            <div>
              <img src="/call icon.svg" alt="Call" />
            </div>
            <div>
              <img src="/Business icon.svg" alt="Business" />
            </div>
            <div>
              <img src="/3 dots.svg" alt="More" />
            </div>
          </HeaderIcons>
        </ChatHeader>
        
        <ChatBody ref={chatBodyRef}>
          <TimestampDivider>Today</TimestampDivider>
          {renderMessages()}
        </ChatBody>
        
        <ChatFooter>
          <EmojiButton>
            <img src="/stickers icon.svg" alt="Stickers" />
          </EmojiButton>
          <AttachButton>
            <img src="/Attach icon.svg" alt="Attach" />
          </AttachButton>
          <InputField />
          <MicButton>
            <img src="/Voice recording icon.svg" alt="Voice Recording" />
          </MicButton>
        </ChatFooter>

        {/* Add WebView Container */}
        <WebViewContainer isVisible={!!webViewUrl}>
          <WebViewHeader>
            <BackButton onClick={handleCloseWebView}>
              <img src="/left arrow icon.svg" alt="Back" />
            </BackButton>
            <WebViewTitle>{webViewTitle}</WebViewTitle>
          </WebViewHeader>
          {webViewUrl && (
            <WebViewIframe 
              src={webViewUrl} 
              title="Web View"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          )}
        </WebViewContainer>
      </PhoneScreen>
    </PhoneFrame>
  );
};

export default PhonePreview;