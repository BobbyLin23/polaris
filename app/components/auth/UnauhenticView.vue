<script lang="ts" setup>
import { ShieldAlertIcon } from 'lucide-vue-next'
</script>

<template>
  <div class="flex items-center justify-center h-screen bg-background">
    <div class="w-full max-w-lg bg-muted">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <ShieldAlertIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Unauthorized Access</ItemTitle>
          <ItemDescription>
            You are not authorized to access this resource.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm" as-child>
            <NuxtLink href="/sign-in">
              Sign in
            </NuxtLink>
          </Button>
        </ItemActions>
      </Item>
    </div>
  </div>
</template>
