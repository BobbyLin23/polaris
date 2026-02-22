<script lang="ts" setup>
import { LogOutIcon } from 'lucide-vue-next'
import { authClient } from '~/lib/auth-client'

const session = authClient.useSession()

async function handleSignOut() {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        navigateTo('/sign-in')
      },
    },
  })
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Avatar>
        <div v-if="session.isPending" class="flex items-center justify-center rounded-full size-8 bg-muted">
          <Spinner class="size-4" />
        </div>
        <template v-else>
          <AvatarImage :src="session.data?.user?.image || ''"  alt="User avatar" />
          <AvatarFallback>
            {{ session.data?.user?.name?.slice(0, 2).toUpperCase() }}
          </AvatarFallback>
        </template>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuItem @click="handleSignOut">
        <LogOutIcon class="mr-2 size-4" />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
