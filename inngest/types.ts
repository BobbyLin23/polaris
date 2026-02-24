import { EventSchemas } from 'inngest'

interface DemoGenerateEvent {
  name: 'demo/generate'
}

export const schemas = new EventSchemas().fromUnion<DemoGenerateEvent>()
