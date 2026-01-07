<script setup>
const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    warehouses:{
        type:Object,
        required: true
    }, 
    units:{
        type: Object,
        required: true
    }
});

const emit = defineEmits(["update:isDialogVisible", "update:warehouses", "addConversion"]);

const warehouse_id = ref(null);
const units=ref([]);
const unit_start_id = ref(null);
const unit_end_id = ref(null);
const quantity_start = ref(null);
const quantity_end = ref(null);
const description = ref(null);
const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);
const warehouses=ref([]);
const unit_conversions=ref([]);

//INICIO BUSQUEDA DE PRODUCTO
const loading = ref(false)
const search_product = ref()
const select_product = ref(null)

const items = ref([]);
const warning_warehouse = ref(null);

const unit_id = ref(null);
const price_unit = ref(0);
const quantity = ref(0);

const querySelections = (query) => {
    loading.value = true;
    warning_warehouse.value = null;

    // Simulated ajax query
    setTimeout(async () => {
        //items.value = product.filter(state => (state || '').toLowerCase().includes((query || '').toLowerCase()))
        try {
            const resp = await $api("sales/search_product?search=" + (search_product.value ? search_product.value : ''), {
                //const resp = await $api("sales/search_product?search=" + (query ? query : ''), {
                method: 'GET',
                onResponseError({ response }) {
                    console.log(response._data.error);
                }
            });
            console.log(resp);
            items.value = resp.products.data;
            loading.value = false;
        } catch (error) {
            console.log(error);
        }
    }, 500)
};

watch(search_product, query => {

    if (!warehouse_id.value) {
        setTimeout(() => {
            warning_warehouse.value = "Debe seleccionar un almacen de salida.";
        }, 50);
        return;
    }

    

    if (query.length > 2) {
        querySelections(query)
    } else {
        items.value = [];
    }
});

watch(select_product, value => {
    console.log(value);
    if (value) {
        units.value = value.warehouses.filter((warehouse) => warehouse.warehouse_id == warehouse_id.value).map((wh) => {
            return {
                id: wh.unit_id,
                name: wh.unit.name,
            };
        });
    }
});

watch(warehouse_id, value => {
    if (select_product.value) {
        units.value = select_product.value.warehouses.filter((warehouse) => warehouse.warehouse_id == value).map((wh) => {
            return {
                id: wh.unit_id,
                name: wh.unit.name,
            };
        });
        unit_start_id.value=null;
        unit_end_id.value=null;
        unit_conversions.value=null;
    }
    

});

watch(unit_start_id, value => {
    console.log(value);
    let UNITS_SELECTED= props.units.find((unit)=>unit.id==value);
    console.log(UNITS_SELECTED);
    
    if(UNITS_SELECTED){
        unit_conversions.value=UNITS_SELECTED.conversions;        
    }

});
//FIN BUSQUEDA DE PRODUCTO

const store = async () => {
    warning.value = null;
    error_exits.value = null;
    success.value = null;
  
    if (!description.value) {
        setTimeout(() => {
            warning.value = "Se debe llenar la descripción de la unidad";
        }, 50);
        return;
    }

    let data = {
        warehouse_id:warehouse_id.value,
        product_id: select_product.value.id,
        unit_start_id: unit_start_id.value,
        unit_end_id: unit_end_id.value,
        quantity_start:quantity_start.value,
        quantity_end:quantity_end.value,
        description: description.value,        
    };

    try {
        const resp = await $api("conversions", {
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
            success.value = "La conversión se ha registrado correctamente";
            emit("addConversion", resp.conversion);

            warehouse_id.value=null;
            select_product.value=null;
            units.value=[];
            unit_start_id.value=null;            
            unit_end_id.value=null;
            quantity_start.value=0;
            quantity_end.value=0;
            
            description.value = null;
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
        
        setTimeout(() => {            
            emit("update:isDialogVisible", false);
        }, 25);
    
};

const dialogVisibleUpdate = (val) => {
    emit("update:isDialogVisible", val);
};

onMounted(() => {
   warehouses.value=props.warehouses;
})

</script>

<template>
    <VDialog max-width="650" :model-value="props.isDialogVisible" @update:model-value="dialogVisibleUpdate">
        <VCard class="pa-sm-11 pa-3">
            <!-- 👉 dialog close btn -->
            <DialogCloseBtn variant="text" size="default" @click="onFormReset" />

            <VCardText class="pt-5">
                <div class="text-center pb-6">
                    <h4 class="text-h4 mb-2">Add Conversion</h4>
                </div>

                <!-- 👉 Form -->
                <VForm class="mt-4" @submit.prevent="store">
                    <VRow>
                        <!-- 👉 First Name -->

                         <VCol cols="12">
                                <VSelect :items="warehouses" item-title="name" item-value="id" placeholder="Select"
                                    v-model="warehouse_id" label="Almacenes" />
                            </VCol>
                        
                            <VCol cols="12">
                                <VRow>
                                    <VCol cols="12">
                                        <VRow>
                                            <VCol cols="12">
                                                <VAutocomplete v-model="select_product" v-model:search="search_product"
                                                    :loading="loading" :items="items" item-title="title" item-value="id"
                                                    return-object placeholder="Buscar producto" label="¿Qué producto busca?"
                                                    variant="underlined" :menu-props="{ maxHeight: '200px' }" />
                                            </VCol>
                                            <VCol cols="12" v-if="warning_warehouse">
                                                <VAlert closable close-label="Close Alert" color="warning">
                                                    {{ warning_warehouse }}
                                                </VAlert>
                                            </VCol>
                                        </VRow>
                                    </VCol>

                                    <VCol cols="12">
                                        <VRow>
                                            <VCol cols="12">
                                                <VRow>
                                                    <VCol cols="6">
                                                        <VSelect :items="units" item-title="name" item-value="id"
                                                            placeholder="Select" v-model="unit_start_id" label="Unidad de inicio" />
                                                    </VCol>
                                                    
                                                    <VCol cols="6">
                                                        <VTextField label="Cantidad" type="number" v-model="quantity_start"
                                                            placeholder="" />
                                                    </VCol>

                                                </VRow>
                                            </VCol>                                    
                                        </VRow>
                                    </VCol>
                                    <VCol cols="12">
                                        <VRow>
                                            <VCol cols="12">
                                                <VRow>
                                                    <VCol cols="6">
                                                        <VSelect :items="unit_conversions" item-title="name" item-value="id"
                                                            placeholder="Select" v-model="unit_end_id" label="Unidad a convertir" />
                                                    </VCol>
                                                    
                                                    <VCol cols="6">
                                                        <VTextField label="Cantidad" type="number" v-model="quantity_end"
                                                            placeholder="" />
                                                    </VCol>

                                                </VRow>
                                            </VCol>                                    
                                        </VRow>
                                    </VCol>
                                </VRow>
                                
                            </VCol>

                        <VCol cols="12">
                            <VTextarea v-model="description" label="Descipción: " placeholder="" />
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
