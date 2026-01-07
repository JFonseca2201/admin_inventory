<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:isDialogVisible", "addSucursal"]);
const name = ref(null);
const address = ref(null);
const ruc=ref(null);
const telefono=ref(null);
const email=ref(null);
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const store = async () => {
  warning.value = null;
  error_exits.value = null;
  success.value = null;
  if (!name.value) {
    setTimeout(() => {
      warning.value = "Se debe llenar el nombre de la sucursal";
    }, 50);
    return;
  }
  if (!address.value) {
    setTimeout(() => {
      warning.value = "Se debe llenar la dirección de la sucursal";
    }, 50);
    return;
  }

  let data = {
    name: name.value,
    address: address.value,
    ruc: ruc.value,
    telefono: telefono.value,
    email: email.value,
  };

  try {
    const resp = await $api("sucursales", {
      method: "POST",
      body: data,
      onResponseError({ response }) {
        error_exits.value = response._data.error;
      },
    });
    console.log(resp);
    if (resp.message == 403) {
      error_exits.value = resp.message_text;
    } else {
      success.value = "La sucursal se ha registrado correctamente";
      emit("addSucursal", resp.sucursal);
      name.value = null;
      address.value = null;
      ruc.value=null,
      telefono.value=null,
      email.value=null,
      warning.value = null;
      error_exits.value = null;
      success.value = null;
      onFormReset();
    }
  } catch (error) {
    console.log(error);
  }
};

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
  <VDialog max-width="650" :model-value="props.isDialogVisible" @update:model-value="dialogVisibleUpdate">
    <VCard class="pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn variant="text" size="default" @click="onFormReset" />

      <VCardText class="pt-5">
        <div class="text-center pb-6">
          <h4 class="text-h4 mb-2">Add Sucursal</h4>
        </div>

        <!-- 👉 Form -->
        <VForm class="mt-4" @submit.prevent="store">
          <VRow>
            <!-- 👉 First Name -->
             <VCol cols="7">
              <VTextField v-model="name" label="Nombre" placeholder="Ex.: Quito" />
            </VCol>
            <VCol cols="5">
              <VTextField v-model="ruc" label="RUC" placeholder="Ex.: 179312145451001" />
            </VCol>
            <VCol cols="6">
              <VTextField v-model="email" label="Email" placeholder="Ex.: examplemail@mail.com" />
            </VCol>
            <VCol cols="6">
              <VTextField v-model="telefono" label="Teléfono" placeholder="Ex.: 09991784131" />
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
            <VCol cols="12" v-if="success">
              <VAlert closable close-label="Close Alert" color="success">
                {{ success }}
              </VAlert>
            </VCol>
            <VCol cols="12">
              <VTextarea v-model="address" label="Dirección: " placeholder="" />
            </VCol>
            <!-- 👉 Submit and Cancel -->
            <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
              <VBtn type="submit"> Guardar </VBtn>

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
