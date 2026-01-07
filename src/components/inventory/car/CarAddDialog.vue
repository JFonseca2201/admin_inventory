<script setup>
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
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const store = async () => {
    warning.value = null;
    error_exits.value = null;
    success.value = null;
    if (!brand.value) {
        setTimeout(() => {
            warning.value = "Se debe llenar la marca del vehículo.";
        }, 50);
        return;
    }
    if (!model.value) {
        setTimeout(() => {
            warning.value = "Se debe llenar el modelo del vehículo.";
        }, 50);
        return;
    }

    if (!type_car.value) {
        setTimeout(() => {
            warning.value = "Se debe llenar el tipo de vehículo.";
        }, 50);
        return;
    }
    if (!placa.value) {
        setTimeout(() => {
            warning.value = "Se debe llenar la placa del vehículo.";
        }, 50);
        return;
    }

    let data = {
        brand: brand.value,
        model: model.value,
        type_car: type_car.value,
        placa: placa.value,
        observation: observation.value,
        state: state.value,
    };

    try {
        const resp = await $api("cars", {
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
            success.value = "Vehículo registrado correctamente";
            emit("addCar", resp.car);
            brand.value = "";
            model.value = "";
            brand.value;
            model.value = "";
            type_car.value = "";
            placa.value = "";
            observation.value = "";
            warning.value = null;
            error_exits.value = null;
            success.value = null;
            onFormReset();
        }
    } catch (error) {
        console.log(error);
    }
    console.log(data);

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
    <VDialog max-width="850" :model-value="props.isDialogVisible" @update:model-value="dialogVisibleUpdate">
        <VCard class="pa-sm-11 pa-3">
            <!-- 👉 dialog close btn -->
            <DialogCloseBtn variant="text" size="default" @click="onFormReset" />

            <VCardText class="pt-5">
                <div class="text-center pb-6">
                    <h4 class="text-h4 mb-2">Add Car</h4>
                </div>

                <!-- 👉 Form -->
                <VForm class="mt-4" @submit.prevent="store">
                    <VRow>
                        <!-- 👉 First Name -->
                        <VCol cols="6">
                            <VTextField v-model="brand" label="Marca" placeholder="Example: CHEVROLET" />
                        </VCol>
                        <VCol cols="6">
                            <VTextField v-model="model" label="Modelo" placeholder="Example: AVEO" />
                        </VCol>
                        <VCol cols="6">
                            <VSelect
                                :items="['SEDAN', 'HATCHBACK', 'SUV', 'JEEP', 'FURGONETA', 'CAMIONETA', 'VAN', 'MINI-VAN']"
                                v-model="type_car" label="Tipo de vehículo" placeholder="Select Item" eager />
                        </VCol>
                        <VCol cols="6">
                            <VTextField v-model="placa" label="Placa" placeholder="Example: PAA-0001" />
                        </VCol>
                        <VCol cols="12">
                            <VTextarea v-model="observation" label="Observación: " placeholder="" />
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
