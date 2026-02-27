import { EventSchemas } from 'inngest'

interface DemoGenerateEvent {
  name: 'demo/generate'
  data: {
    prompt: string
  }
}

interface MessageCancelEvent {
  name: 'message/cancel'
  data: {
    messageId: string
  }
}

interface MessageSentEvent {
  name: 'message/sent'
  data: {
    messageId: string
    conversationId: string
    projectId: string
    message: string
  }
}

export const schemas = new EventSchemas().fromUnion<
  DemoGenerateEvent
  | MessageCancelEvent
  | MessageSentEvent
>()
