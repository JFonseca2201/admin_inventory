<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  productSelected: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:isDialogVisible", "deleteProduct"]);
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const deleteProduct = async () => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  try {
    const resp = await $api("products/" + props.productSelected.id, {
      method: "GET",
      onResponseError({ response }) {
        error_exits.value = response._data.error;
      },
    });
    console.log(resp);
    emit("deleteProduct", props.productSelected);
    onFormReset();
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  console.log(props.productSelected);
});

const onFormSubmit = () => {
  emit("update:isDialogVisible", false);
  emit("submit", userData.value);
};

const onFormReset = () => {
  emit("update:isDialogVisible", false);
};

const dialogVisibleUpdate = (val) => {
  emit("update:isDialogVisible", val);
};
</script>

<template>
  <VDialog
    max-width="800"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard>
      <!-- 👉 Header -->
      <VCardTitle class="d-flex align-center justify-space-between">
        <span class="text-h6">Detalle del Producto</span>
        <DialogCloseBtn variant="text" size="default" @click="onFormReset" />
        <br />
        <br />
      </VCardTitle>

      <VDivider />

      <!-- 👉 Body -->
      <VCardText>
        <VRow>
          <!-- 👉 Imagen GRANDE -->
          <VCol cols="12" md="5" class="text-center">
            <VAvatar size="220" rounded="lg">
              <VImg
                v-if="props.productSelected.imagen"
                :src="props.productSelected.imagen"
                cover
              />
              <span v-else class="text-h4">
                {{ props.productSelected.title?.charAt(0) }}
              </span>
            </VAvatar>
          </VCol>

          <!-- 👉 Info -->
          <VCol cols="12" md="7">
            <h4 class="text-h5 mb-3">
              {{ props.productSelected.title }}
            </h4>

            <p class="text-body-1 mb-2">
              <strong>CÓDIGO:</strong> {{ props.productSelected.sku || "—" }}
            </p>

            <p
              class="text-body-1 mb-2"
              v-if="props.productSelected.product_categorie"
            >
              <strong>CATEGORIA:</strong>
              {{ props.productSelected.product_categorie.name }}
            </p>
            <p
              class="text-body-1 mb-2"
              v-if="props.productSelected.price_general"
            >
              <strong>PRECIO:</strong>
              ${{ (props.productSelected.price_general * 1.15).toFixed(2) }}
            </p>

            <!-- 👉 Estado -->
            <div class="mt-4">
              <VChip
                v-if="props.productSelected.state_stock === 1"
                color="success"
                size="small"
                variant="tonal"
              >
                Disponible
              </VChip>

              <VChip
                v-else-if="props.productSelected.state_stock === 2"
                color="warning"
                size="small"
                variant="tonal"
              >
                Por agotar
              </VChip>

              <VChip
                v-else-if="props.productSelected.state_stock === 3"
                color="error"
                size="small"
                variant="tonal"
              >
                Agotado
              </VChip>
            </div>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />
      <br />
      <!-- 👉 Footer -->
      <VCardActions class="justify-end">
        <VBtn color="secondary" variant="outlined" @click="onFormReset">
          Cerrar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
