<script setup>
const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    listClients: {
        type: Object,
        required: true,
    }
});

const emit = defineEmits(["update:isDialogVisible", "clientSelected"]);
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);

const clientSelected = (client) => {
    console.log(client);
    emit("clientSelected", client);
    onFormReset();
}

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
    <VDialog max-width="750" :model-value="props.isDialogVisible" @update:model-value="dialogVisibleUpdate">
        <VCard class="pa-sm-11 pa-3">
            <!-- 👉 dialog close btn -->
            <DialogCloseBtn variant="text" size="default" @click="onFormReset" />

            <VCardText class="pt-5">
                <div class="text-center pb-6">
                    <h4 class="text-h4 mb-2">Clientes</h4>
                </div>
                <VCol cols="12">
                    <VTable>
                        <thead>
                            <tr>
                                <th class="text-uppercase">
                                    Client
                                </th>
                                <th class="text-uppercase">
                                    CI/RUC
                                </th>
                                <th class="text-uppercase">
                                    Tipo Cliente
                                </th>

                                <th class="text-uppercase">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tr v-for="(lis_client, index) in props.listClients" :key="index">
                            <td>{{ lis_client.full_name }}</td>
                            <td>{{ lis_client.n_document }}</td>
                            <td>{{ lis_client.type_client == 1 ? 'CLIENTE FINAL' : 'CLIENTE EMPRESA' }}</td>
                            <td class="py-1">
                                <VBtn color="primary" @click="clientSelected(lis_client)">
                                    <VIcon icon="ri-add-circle-line" />
                                </VBtn>

                            </td>
                        </tr>
                        <tbody>

                        </tbody>
                    </VTable>
                </VCol>
                <!-- 👉 Form -->
                <VForm class="mt-4">
                    <VRow>
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
