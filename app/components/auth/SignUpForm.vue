<script setup lang="ts">
import { toast } from 'vue-sonner'
import { authClient } from '~/lib/auth-client'

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)

async function onSubmit() {
  if (form.value.password !== form.value.confirmPassword) {
    return
  }

  loading.value = true

  await authClient.signUp.email({
    email: form.value.email,
    password: form.value.password,
    name: form.value.name,
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
  <Card>
    <CardHeader>
      <CardTitle>Create an account</CardTitle>
      <CardDescription>
        Enter your information below to create your account
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="onSubmit">
        <FieldGroup>
          <Field>
            <FieldLabel for="name">
              Full Name
            </FieldLabel>
            <Input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="John Doe"
              required
              :disabled="loading"
            />
          </Field>
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
            <FieldLabel for="password">
              Password
            </FieldLabel>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              required
              :disabled="loading"
            />
            <FieldDescription>Must be at least 8 characters long.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel for="confirm-password">
              Confirm Password
            </FieldLabel>
            <Input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              required
              :disabled="loading"
            />
            <FieldDescription>Please confirm your password.</FieldDescription>
          </Field>
          <FieldGroup>
            <Field>
              <Button type="submit" :disabled="loading">
                <Spinner v-if="loading" class="mr-2" />
                Create Account
              </Button>
              <Button variant="outline" type="button" :disabled="loading">
                Sign up with Google
              </Button>
              <FieldDescription class="px-6 text-center">
                Already have an account?
                <NuxtLink to="/sign-in">
                  Sign in
                </NuxtLink>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</template>
