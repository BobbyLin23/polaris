import { EventSchemas } from 'inngest'

interface DemoGenerateEvent {
  name: 'demo/generate'
  data: {
    prompt: string
  }
}

export const schemas = new EventSchemas().fromUnion<DemoGenerateEvent>()
