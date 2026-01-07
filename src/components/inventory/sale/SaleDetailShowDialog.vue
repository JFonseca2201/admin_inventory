<script setup>
const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    saleSelected: {
        type: Object,
        required: true,
    }
})

const emit = defineEmits([
    'update:isDialogVisible',
])

const onFormSubmit = () => {
    emit('update:isDialogVisible', false)
    emit('submit', userData.value)
}

const onFormReset = () => {
    emit('update:isDialogVisible', false)
}

const dialogVisibleUpdate = val => {
    emit('update:isDialogVisible', val)
}

onMounted(() => {

})
</script>

<template>
    <VDialog max-width="850" :model-value="props.isDialogVisible" @update:model-value="dialogVisibleUpdate">
        <VCard class="pa-sm-11 pa-3">
            <!-- 👉 dialog close btn -->
            <DialogCloseBtn variant="text" size="default" @click="onFormReset" />

            <VCardText class="pt-5">
                <div class="text-center pb-6">
                    <h4 class="text-h4 mb-2">
                        Detalle de venta #{{ props.saleSelected.id }}
                    </h4>
                </div>

                <!-- 👉 Form -->
                <VForm class="mt-4" @submit.prevent="">
                    <VRow>
                        <!-- 👉 First Name -->
                        <VTable height="250" fixed-header>
                            <thead>
                                <tr>
                                    <th class="text-uppercase">
                                        Producto
                                    </th>
                                    <th class="text-uppercase">
                                        E. entrega
                                    </th>
                                    <th class="text-uppercase">
                                        Unidad
                                    </th>
                                    <th class="text-uppercase">
                                        Cantidad
                                    </th>
                                    <th class="text-uppercase">
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-for="sale_detail in props.saleSelected.sale_details" :key="sale_detail.id">
                                    <td>
                                        <div class="d-flex align-center">
                                            <VAvatar size="32" :color="sale_detail.product.imagen ? '' : 'primary'"
                                                :class="sale_detail.product.imagen ? '' : 'v-avatar-light-bg primary--text'"
                                                :variant="!sale_detail.product.imagen ? 'tonal' : undefined">
                                                <VImg :src="sale_detail.product.imagen" />
                                            </VAvatar>
                                            <div class="d-flex flex-column ms-3">
                                                {{ sale_detail.product.title }}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <VChip color="error" v-if="sale_detail.state_attention == 1">PENDIENTE </VChip>
                                        <VChip color="warning" v-if="sale_detail.state_attention == 2">PARCIAL</VChip>
                                        <VChip color="primary" v-if="sale_detail.state_attention == 3">COMPLETO</VChip>
                                    </td>
                                    <td>
                                        {{ sale_detail.unit.name }}
                                    </td>
                                    <td>
                                        {{ sale_detail.quantity }}
                                    </td>
                                    <td style="text-wrap-mode: nowrap;">
                                        $ {{ parseFloat(sale_detail.total).toFixed(2) }}
                                    </td>
                                </tr>
                            </tbody>
                        </VTable>


                        <!-- 👉 Submit and Cancel -->
                        <!-- <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
                            <VBtn color="secondary" variant="outlined" @click="onFormReset">
                                Regresar
                            </VBtn>
                        </VCol> -->
                    </VRow>
                </VForm>
            </VCardText>
        </VCard>
    </VDialog>
</template>
