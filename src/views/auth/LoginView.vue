<script lang="ts" setup>
import { useValidation } from '@/composables/useValidation'
import { IconEye, IconEyeClosed } from '@tabler/icons-vue'

const auth = useAuthStore()
const { loading } = storeToRefs(auth)

const { emailRule, passwordRule } = useValidation()
const { t } = useI18n()

const { handleSubmit, errors } = useForm()

const { value: email } = useField('email', emailRule, { initialValue: 'masweb@me.com' })
const { value: password } = useField('password', passwordRule, { initialValue: 'Admin123!' })

const showPassword = ref(false)

const emailInput = ref<HTMLInputElement>()

onMounted(() => {
  emailInput.value?.focus()
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const onSubmit = handleSubmit((values: { email: string; password: string }) => {
  auth.login(values.email, values.password)
})
</script>

<template>
  <div class="h100 d-flex flex-column justify-content-center align-items-center">
    <div class="logo text-center mb-5 mt-5">w a x p</div>
    <div class="card" style="width: 310px">
      <div class="card-header text-center">{{ t('login') }}</div>
      <div class="card-body">
        <form @submit.prevent="onSubmit">
          <div class="mb-3">
            <input
              ref="emailInput"
              v-model="email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              id="email"
              :placeholder="t('email')"
            />
            <div v-if="errors.email" class="invalid-feedback">
              {{ errors.email }}
            </div>
          </div>
          <div class="mb-3">
            <div class="position-relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                id="password"
                :placeholder="t('password')"
                style="padding-right: 45px"
              />
              <button
                type="button"
                class="btn btn-link position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                @click="togglePasswordVisibility"
                style="z-index: 5; padding: 0.375rem 0.75rem"
              >
                <IconEye v-if="!showPassword" size="18" />
                <IconEyeClosed v-else size="18" />
              </button>
            </div>
            <div v-if="errors.password" class="invalid-feedback d-block">
              {{ errors.password }}
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-100">
            <span style="width: 70px">
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status">
                <span class="visually-hidden">{{ t('loading') }}...</span>
              </span>
            </span>
            {{ t('submit') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
