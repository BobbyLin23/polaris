<script lang="ts" setup>
import { authClient } from '~/lib/auth-client'

const session = authClient.useSession()
</script>

<template>
  <template v-if="session.isPending">
    <AuthLoadingView />
  </template>
  <template v-else-if="session.data">
    <slot />
  </template>
  <template v-else>
    <AuthUnauhenticView />
  </template>
</template>
