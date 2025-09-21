<script setup lang="ts">
import * as z from "zod";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  layout: "dashboard", // This will use layouts/admin.vue
});

// Enhanced password schema with confirmation
const passwordSchema = z
  .object({
    current: z.string().min(8, "Must be at least 8 characters"),
    new: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/(?=.*[a-z])/, "Must contain at least one lowercase letter")
      .regex(/(?=.*[A-Z])/, "Must contain at least one uppercase letter")
      .regex(/(?=.*\d)/, "Must contain at least one number"),
    confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

type PasswordSchema = z.output<typeof passwordSchema>;

const password = reactive<Partial<PasswordSchema>>({
  current: undefined,
  new: undefined,
  confirm: undefined,
});

// Loading and notification states
const isLoading = ref(false);
const toast = useToast();

// Validation function
const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = [];

  // Check if new password is same as current
  if (state.current && state.new && state.current === state.new) {
    errors.push({
      name: "new",
      message: "New password must be different from current password",
    });
  }

  return errors;
};

// Enhanced password change function with current password verification
async function changePasswordWithVerification(
  currentPassword: string,
  newPassword: string
) {
  try {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();

    if (!user.value?.email) throw new Error("User not authenticated");

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error("Current password is incorrect");
    }

    // Update to new password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error: any) {
    console.error("Password change error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Form submission handler
async function onSubmit(event: FormSubmitEvent<PasswordSchema>) {
  isLoading.value = true;

  try {
    const { current, new: newPassword } = event.data;

    const result = await changePasswordWithVerification(current, newPassword);

    if (result.success) {
      toast.add({
        title: "Success",
        description: result.message,
        color: "success",
      });

      // Reset form
      password.current = undefined;
      password.new = undefined;
      password.confirm = undefined;
    } else {
      toast.add({
        title: "Error",
        description: result.error,
        color: "warning",
      });
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: "An unexpected error occurred",
      color: "warning",
    });
  } finally {
    isLoading.value = false;
  }
}

// Password strength calculator
const getPasswordStrength = (
  password: string
): { strength: "weak" | "medium" | "strong"; score: number } => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  if (score < 3) return { strength: "weak", score };
  if (score < 5) return { strength: "medium", score };
  return { strength: "strong", score };
};

// Computed password strength
const passwordStrength = computed(() => {
  if (!password.new || password.new.length === 0) return null;
  return getPasswordStrength(password.new);
});

// Delete account function
const showDeleteConfirmation = ref(false);

async function deleteAccount() {
  // Implementation for account deletion
  toast.add({
    title: "Account Deletion",
    description: "Account deletion functionality would be implemented here",
    color: "yellow",
  });
}
</script>

<template>
  <UPageCard
    title="Change Password"
    description="Confirm your current password before setting a new one."
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      @submit="onSubmit"
      class="flex flex-col gap-4 max-w-sm"
    >
      <UFormField name="current" label="Current Password">
        <UInput
          v-model="password.current"
          type="password"
          placeholder="Enter current password"
          class="w-full"
          :disabled="isLoading"
        />
      </UFormField>

      <UFormField name="new" label="New Password">
        <UInput
          v-model="password.new"
          type="password"
          placeholder="Enter new password"
          class="w-full"
          :disabled="isLoading"
        />

        <!-- Password strength indicator -->
        <div v-if="passwordStrength" class="mt-2">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="text-gray-500">Password strength:</span>
            <span
              :class="{
                'text-red-500': passwordStrength.strength === 'weak',
                'text-yellow-500': passwordStrength.strength === 'medium',
                'text-green-500': passwordStrength.strength === 'strong',
              }"
            >
              {{
                passwordStrength.strength.charAt(0).toUpperCase() +
                passwordStrength.strength.slice(1)
              }}
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div
              class="h-1.5 rounded-full transition-all duration-300"
              :class="{
                'bg-red-500 w-1/3': passwordStrength.strength === 'weak',
                'bg-yellow-500 w-2/3': passwordStrength.strength === 'medium',
                'bg-green-500 w-full': passwordStrength.strength === 'strong',
              }"
            ></div>
          </div>
        </div>
      </UFormField>

      <UFormField name="confirm" label="Confirm New Password">
        <UInput
          v-model="password.confirm"
          type="password"
          placeholder="Confirm new password"
          class="w-full"
          :disabled="isLoading"
        />
      </UFormField>

      <!-- Password requirements -->
      <div class="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <p class="font-medium mb-1">Password requirements:</p>
        <ul class="space-y-1">
          <li class="flex items-center gap-2">
            <UIcon
              :name="
                password.new && password.new.length >= 8
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-x-circle'
              "
              :class="
                password.new && password.new.length >= 8
                  ? 'text-green-500'
                  : 'text-gray-400'
              "
              size="14"
            />
            At least 8 characters
          </li>
          <li class="flex items-center gap-2">
            <UIcon
              :name="
                password.new && /(?=.*[a-z])/.test(password.new)
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-x-circle'
              "
              :class="
                password.new && /(?=.*[a-z])/.test(password.new)
                  ? 'text-green-500'
                  : 'text-gray-400'
              "
              size="14"
            />
            One lowercase letter
          </li>
          <li class="flex items-center gap-2">
            <UIcon
              :name="
                password.new && /(?=.*[A-Z])/.test(password.new)
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-x-circle'
              "
              :class="
                password.new && /(?=.*[A-Z])/.test(password.new)
                  ? 'text-green-500'
                  : 'text-gray-400'
              "
              size="14"
            />
            One uppercase letter
          </li>
          <li class="flex items-center gap-2">
            <UIcon
              :name="
                password.new && /(?=.*\d)/.test(password.new)
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-x-circle'
              "
              :class="
                password.new && /(?=.*\d)/.test(password.new)
                  ? 'text-green-500'
                  : 'text-gray-400'
              "
              size="14"
            />
            One number
          </li>
        </ul>
      </div>

      <UButton
        label="Update Password"
        class="w-fit"
        type="submit"
        :loading="isLoading"
        :disabled="isLoading"
      />
    </UForm>
  </UPageCard>

  <UPageCard
    title="Delete Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-gradient-to-tl from-red-50 from-5% to-white dark:from-red-950/20 dark:to-gray-900"
  >
    <template #footer>
      <UModal :open="showDeleteConfirmation">
        <UButton
          label="Delete account"
          color="error"
          variant="outline"
          class="cursor-pointer"
          @click="showDeleteConfirmation = true"
        />
        <template #content>
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Delete Account</h3>
            </template>

            <div class="space-y-4">
              <p class="text-gray-600">
                Are you absolutely sure you want to delete your account? This
                action cannot be undone and will permanently delete:
              </p>
              <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Your profile and personal information</li>
                <li>All your data and settings</li>
                <li>Your account access</li>
              </ul>
              <div class="bg-red-50 border border-red-200 rounded-md p-3">
                <p class="text-sm text-red-700 font-medium">
                  This action is irreversible. Please be certain.
                </p>
              </div>
            </div>

            <template #footer>
              <div class="flex justify-end gap-3">
                <UButton
                  label="Cancel"
                  variant="ghost"
                  class="cursor-pointer"
                  @click="showDeleteConfirmation = false"
                />
                <UButton
                  label="Delete Account"
                  color="error"
                  class="cursor-pointer"
                  @click="deleteAccount"
                />
              </div>
            </template>
          </UCard>
        </template>
      </UModal>
    </template>
  </UPageCard>
</template>
