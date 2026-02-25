<script lang="ts" setup>
import { authClient } from '~/lib/auth-client'

const session = authClient.useSession()
</script>

<template>
  <AuthLoadingView v-if="session.isPending" />
  <AuthUnauhenticView v-else-if="!session.data" />
  <div
    v-show="!session.isPending && !!session.data"
    class="contents"
  >
    <slot />
  </div>
</template>
