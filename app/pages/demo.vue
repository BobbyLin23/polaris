<script lang="ts" setup>
const { execute, status } = await useFetch('/api/demo/background', {
  immediate: false,
})
</script>

<template>
  <div>
    <Button :disabled="status === 'pending'" @click="execute()">
      <template v-if="status === 'pending'">
        <Spinner />
      </template>
      Start Background Job
    </Button>
  </div>
</template>
