<script setup>
import { getCurrentInstance, ref, onMounted } from "vue";

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  carSelected: {
    type: Object,
    required: true,
  },
});

const isDeleting = ref(false);
const isLoading = ref(false);
const { proxy } = getCurrentInstance();
const emit = defineEmits(["update:isDialogVisible", "deleteCar"]);

const deleteCar = async () => {
  try {
    isDeleting.value = true;
    isLoading.value = true;

    // Llamada API para eliminar
    await $api(`cars/${props.carSelected.id}`, {
      method: "DELETE",
    });

    // Emitir evento para actualizar lista
    emit("deleteCar", props.carSelected);

    // Usar $toast global
    proxy.$toast.fire({
      icon: "error", // rojo
      title: `El vehículo ${props.carSelected.placa} fue eliminado correctamente`,
      background: "rgba(211, 47, 47, 0.85)", // rojo con transparencia
      color: "#fff",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    onFormReset();
  } catch (error) {
    proxy.$toast.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo eliminar el vehículo",
      background: "rgba(211, 47, 47, 0.85)",
      color: "#fff",
    });
  } finally {
    isDeleting.value = false;
    isLoading.value = false;
  }
};

onMounted(() => {
  console.log(props.carSelected);
});

const onFormReset = () => {
  emit("update:isDialogVisible", false);
};

const dialogVisibleUpdate = (val) => {
  emit("update:isDialogVisible", val);
};
</script>

<template>
  <VDialog
    max-width="650"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="pa-sm-11 pa-3">
      <!-- Overlay local -->
      <VOverlay
        :model-value="isLoading"
        contained
        class="align-center justify-center"
      >
        <VProgressCircular indeterminate size="50" width="5" color="primary" />
      </VOverlay>

      <!-- 👉 dialog close btn -->
      <DialogCloseBtn variant="text" size="default" @click="onFormReset" />

      <VCardText class="pt-5">
        <div class="text-center pb-6">
          <h4 class="text-h4 mb-2">Delete Car</h4>
        </div>

        <!-- Formulario -->
        <VForm class="mt-4" @submit.prevent="deleteCar">
          <VRow>
            <VCol cols="12">
              <p>
                ¿Estas seguro de eliminar el vehículo:
                {{ props.carSelected.placa }}?
              </p>
            </VCol>

            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn
                type="submit"
                color="error"
                :loading="isDeleting"
                :disabled="isDeleting"
              >
                <template v-if="isDeleting"> Eliminando... </template>
                <template v-else> Eliminar </template>
              </VBtn>

              <VBtn color="secondary" variant="outlined" @click="onFormReset">
                Cancelar
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
