<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { toast } from 'vue-sonner'
import { cn } from '@/lib/utils'
import { authClient } from '~/lib/auth-client'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const form = ref({
  email: '',
  password: '',
})

const loading = ref(false)

async function onSubmit() {
  loading.value = true
  await authClient.signIn.email({
    email: form.value.email,
    password: form.value.password,
  }, {
    onSuccess: () => {
      navigateTo('/')
    },
    onError: (ctx) => {
      toast.error(ctx.error.message)
    },
    onResponse: () => {
      loading.value = false
    },
  })
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit">
          <FieldGroup>
            <Field>
              <FieldLabel for="email">
                Email
              </FieldLabel>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="m@example.com"
                required
                :disabled="loading"
              />
            </Field>
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password">
                  Password
                </FieldLabel>
              </div>
              <Input id="password" v-model="form.password" type="password" required :disabled="loading" />
            </Field>
            <Field>
              <Button type="submit" :disabled="loading">
                <Spinner v-if="loading" class="mr-2" />
                Login
              </Button>
              <Button variant="outline" type="button" :disabled="loading">
                Login with Google
              </Button>
              <FieldDescription class="text-center">
                Don't have an account?
                <NuxtLink href="/sign-up">
                  Sign up
                </NuxtLink>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
