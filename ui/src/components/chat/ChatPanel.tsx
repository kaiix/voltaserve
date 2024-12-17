import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChatMessage } from '@/types/chat'
import { apiFetcher } from '@/client/fetcher'
import ReactMarkdown from 'react-markdown'

interface Props {
  fileId: string
}

export default function ChatPanel({ fileId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = async () => {
    if (!question.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setQuestion('')
    setIsLoading(true)

    try {
      // Get AI response
      const response = await apiFetcher<ChatMessage>({
        url: '/chat',
        method: 'POST',
        body: JSON.stringify({
          fileId,
          message: question,
        }),
      })

      console.log('response', response)

      // Add AI response to messages
      setMessages((prev) => [...prev, response!])
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box h="100%" display="flex" flexDirection="column">
      <Flex p={4} borderBottomWidth={1} borderColor={borderColor}>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage()
            }
          }}
          mr={2}
        />
        <Button
          colorScheme="blue"
          onClick={handleSendMessage}
          isLoading={isLoading}
        >
          Send
        </Button>
      </Flex>
      <VStack
        flex="1"
        overflowY="auto"
        spacing={4}
        p={4}
        alignItems="stretch"
        maxH="calc(100vh - 180px)"
      >
        <div ref={messagesEndRef} />
        {messages.map((message) => (
          <Box
            key={message.id}
            alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
            bg={message.role === 'user' ? 'blue.500' : bgColor}
            color={message.role === 'user' ? 'white' : 'inherit'}
            borderRadius="lg"
            px={4}
            py={2}
            maxW="80%"
            borderWidth={message.role === 'assistant' ? 1 : 0}
            borderColor={borderColor}
          >
            {message.role === 'assistant' ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              <Text>{message.content}</Text>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  )
}
