<script setup>
import { getCurrentInstance, ref, onMounted } from "vue";
const { proxy } = getCurrentInstance();

const props = defineProps({
  isDialogVisible: { type: Boolean, required: true },
  carSelected: { type: Object, required: true },
});

const emit = defineEmits(["update:isDialogVisible", "editCar"]);

const brand = ref(null);
const model = ref(null);
const type_car = ref(null);
const placa = ref(null);
const observation = ref(null);
const state = ref(1);

const isSaving = ref(false); // spinner del botón
const isLoading = ref(false); // overlay
const warning = ref(null);
const error_exits = ref(null);

onMounted(() => {
  brand.value = props.carSelected.brand;
  model.value = props.carSelected.model;
  type_car.value = props.carSelected.type_car;
  placa.value = props.carSelected.placa;
  observation.value = props.carSelected.observation;
  state.value = props.carSelected.state;
});

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

    const resp = await $api("cars/" + props.carSelected.id, {
      method: "PATCH",
      body: data,
      onResponseError({ response }) {
        error_exits.value = response._data.error;
      },
    });

    emit("editCar", resp.car);

    // Toast verde transparente fijo para success
    proxy.$toast.fire({
      icon: "success",
      title: `El vehículo ${placa.value} fue editado correctamente`,
      background: "rgba(56, 142, 60, 0.85)",
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
      text: "No se pudo editar el vehículo",
      background: "rgba(211, 47, 47, 0.85)", // rojo transparente
      color: "#fff",
    });
  } finally {
    isSaving.value = false;
    isLoading.value = false;
  }
};

const onFormReset = () => emit("update:isDialogVisible", false);
const dialogVisibleUpdate = (val) => emit("update:isDialogVisible", val);
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

      <!-- Dialog close btn -->
      <DialogCloseBtn variant="text" size="default" @click="onFormReset" />

      <VCardText class="pt-5">
        <div class="text-center pb-6">
          <h4 class="text-h4 mb-2">Edit Car: {{ props.carSelected.placa }}</h4>
        </div>

        <VForm class="mt-4" @submit.prevent="store">
          <VRow>
            <VCol cols="6"
              ><VTextField
                v-model="brand"
                label="Marca"
                placeholder="Example: CHEVROLET"
            /></VCol>
            <VCol cols="6"
              ><VTextField
                v-model="model"
                label="Modelo"
                placeholder="Example: AVEO"
            /></VCol>
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
            <VCol cols="6"
              ><VTextField
                v-model="placa"
                label="Placa"
                placeholder="Example: PAA-0001"
            /></VCol>
            <VCol cols="6"
              ><VTextarea v-model="observation" label="Observación"
            /></VCol>
            <VCol cols="6">
              <VSelect
                :items="[
                  { name: 'Activo', id: 1 },
                  { name: 'Inactivo', id: 2 },
                ]"
                item-title="name"
                item-value="id"
                v-model="state"
                label="Estado"
                placeholder="Select Item"
                eager
              />
            </VCol>

            <VCol cols="12" v-if="warning"
              ><VAlert closable color="warning">{{ warning }}</VAlert></VCol
            >
            <VCol cols="12" v-if="error_exits"
              ><VAlert closable color="error">{{ error_exits }}</VAlert></VCol
            >

            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn
                type="submit"
                color="success"
                :loading="isSaving"
                :disabled="isSaving"
              >
                <template v-if="isSaving">Guardando...</template>
                <template v-else>Editar</template>
              </VBtn>

              <VBtn color="secondary" variant="outlined" @click="onFormReset"
                >Cancelar</VBtn
              >
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
