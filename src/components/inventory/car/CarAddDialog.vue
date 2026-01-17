<script setup>
import { getCurrentInstance, ref } from "vue";
import { validatePlate, formatPlate } from "@/directives/validators";

const { proxy } = getCurrentInstance();

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:isDialogVisible", "addCar"]);

const brand = ref(null);
const model = ref(null);
const type_car = ref(null);
const placa = ref(null);
const observation = ref(null);
const state = ref(1);

const isSaving = ref(false); // para el botón spinner
const isLoading = ref(false); // para el overlay
const warning = ref(null);
const error_exits = ref(null);

const store = async () => {
  warning.value = null;
  error_exits.value = null;

  if (!brand.value) {
    warning.value = "Se debe llenar la marca del vehículo.";
    return;
  }
  if (!model.value) {
    warning.value = "Se debe llenar el modelo del vehículo.";
    return;
  }
  if (!type_car.value) {
    warning.value = "Se debe llenar el tipo de vehículo.";
    return;
  }
  if (!placa.value) {
    warning.value = "Se debe llenar la placa del vehículo.";
    return;
  }

  console.log("PLACA: TRUE/FALSE");
  console.log(validatePlate(placa.value));

  if (!validatePlate(placa.value)) {
    setTimeout(() => {
      warning.value = "Ingrese placa valida de vehículo.";
    }, 25);
    return;
  }

  const data = {
    brand: brand.value,
    model: model.value,
    type_car: type_car.value,
    placa: placa.value,
    observation: observation.value,
    state: state.value,
  };

  try {
    isSaving.value = true;
    isLoading.value = true;

    const resp = await $api("cars", {
      method: "POST",
      body: data,
      onResponseError({ response }) {
        error_exits.value = response._data.error;
      },
    });

    emit("addCar", resp.car);

    // Toast global rojo con transparencia
    proxy.$toast.fire({
      icon: "success",
      title: `El vehículo ${placa.value} fue registrado correctamente`,
      background: "rgba(56, 142, 60, 0.85)", // verde transparente
      color: "#fff",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    // limpiar campos
    brand.value = "";
    model.value = "";
    type_car.value = "";
    placa.value = "";
    observation.value = "";

    onFormReset();
  } catch (error) {
    if (error.response && error.response.status === 422) {
      // Cuando la placa ya existe
      proxy.$toast.fire({
        icon: "error",
        title: "Error",
        text: "❌ La placa ingresada ya existe, por favor verifique.",
        background: "rgba(211, 47, 47, 0.85)", // rojo transparente
        color: "#fff",
      });
      return;
    } else {
      proxy.$toast.fire({
        icon: "error",
        title: "Error",
        text: "⚠️ Ocurrió un error inesperado.",
        background: "rgba(211, 47, 47, 0.85)", // rojo transparente
        color: "#fff",
      });
      return;
    }
  } finally {
    isSaving.value = false;
    isLoading.value = false;
  }
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
    max-width="850"
    :model-value="props.isDialogVisible"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="pa-sm-11 pa-3">
      <!-- Overlay de loading -->
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
          <h4 class="text-h4 mb-2">Add Car</h4>
        </div>

        <!-- Formulario -->
        <VForm class="mt-4" @submit.prevent="store">
          <VRow>
            <VCol cols="6">
              <VTextField
                v-model="brand"
                label="Marca"
                placeholder="Example: CHEVROLET"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="model"
                label="Modelo"
                placeholder="Example: AVEO"
              />
            </VCol>
            <VCol cols="6">
              <VSelect
                :items="[
                  'SEDAN',
                  'HATCHBACK',
                  'SUV',
                  'JEEP',
                  'FURGONETA',
                  'CAMIONETA',
                  'VAN',
                  'MINI-VAN',
                ]"
                v-model="type_car"
                label="Tipo de vehículo"
                placeholder="Select Item"
                eager
              />
            </VCol>
            <VCol cols="6">
              <!-- <VTextField
                v-model="placa"
                label="Placa"
                placeholder="Example: PAA-0001"
              /> -->
              <VTextField
                label="Placa"
                v-model="placa"
                @input="placa = formatPlate(placa)"
                maxlength="8"
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="observation"
                label="Observación"
                placeholder=""
              />
            </VCol>

            <VCol cols="12" v-if="warning">
              <VAlert closable close-label="Close Alert" color="warning">
                {{ warning }}
              </VAlert>
            </VCol>
            <VCol cols="12" v-if="error_exits">
              <VAlert closable close-label="Close Alert" color="error">
                {{ error_exits }}
              </VAlert>
            </VCol>

            <!-- Submit y Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit" :loading="isSaving" :disabled="isSaving">
                <template v-if="isSaving">Guardando...</template>
                <template v-else>Guardar</template>
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
