<script setup>

import REGIONES from '@/assets/json/regiones.json';
import PROVINCIAS from '@/assets/json/provincias.json';
import DISTRITOS from '@/assets/json/distritos.json';

const props = defineProps({
    isDialogVisible: {
        type: Boolean,
        required: true,
    },
    clientSelected: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits([
    'update:isDialogVisible',
    'editClient'
])
const full_name = ref(null);
const email = ref(null);
const phone = ref(null);
const n_document = ref(null);
const type_document = ref('RUC');
const address = ref(null);
const type_client = ref(2);
const birth_date = ref(null);
//const gender = ref('M');
const ubigeo_region = ref(null);
const ubigeo_provincia = ref(null);
const ubigeo_distrito = ref(null);
const region = ref(null);
const provincia = ref(null);
const distrito = ref(null);
const state = ref(1);

const REGIONES_L = REGIONES;
const PROVINCIAS_L = PROVINCIAS;
const DISTRITOS_L = DISTRITOS;

const PROVINCIAS_SELECTS = ref([]);
const DISTRITOS_SELECTS = ref([]);

const warning = ref(null);
const error_exits = ref(null);
const success = ref(null);
//const ci = 1715729305;

const update = async () => {


    warning.value = null;
    error_exits.value = null;
    success.value = null;

    /* validaciones */
    if (!full_name.value) {
        setTimeout(() => {
            warning.value = "Se debe llenar el nombre de la empresa";
        }, 50);
        return;
    }

    if (!n_document.value) {
        setTimeout(() => {
            warning.value = "Se debe llenar el No de documento de la empresa (RUC)";
        }, 50);

        return;
    }
    /* if (!isValidCI(n_document.value)) {
        setTimeout(() => {
            warning.value = "Se debe ingresar un numero de cedula válido.";
        }, 50);
        return;
    } */
    if (!type_document.value) {
        setTimeout(() => {
            warning.value = "Se debe seleccionar un tipo de documento de la empresa";
        }, 50);
        return;
    }
    if (!phone.value) {
        setTimeout(() => {
            warning.value = "Se debe llenar la teléfono de la empresa";
        }, 50);
        return;
    }

    if (!ubigeo_region.value) {
        setTimeout(() => {
            warning.value = "Se debe seleccionar una region para de la empresa";
        }, 50);
        return;
    } if (!ubigeo_provincia.value) {
        setTimeout(() => {
            warning.value = "Se debe seleccionar una provincia para de la empresa";
        }, 50);
        return;
    } if (!ubigeo_distrito.value) {
        setTimeout(() => {
            warning.value = "Se debe seleccionar una ciudad para de la empresa";
        }, 50);
        return;
    }

    if (!address.value) {
        setTimeout(() => {
            warning.value = "Se debe llenar la dirección de la empresa";
        }, 50);
        return;
    }

    let REGION_SELECTED = REGIONES_L.find((region) => region.id == ubigeo_region.value);
    if (REGION_SELECTED) {
        region.value = REGION_SELECTED.name;
    }

    let PROVINCIA_SELECTED = PROVINCIAS_L.find((provincia) => provincia.id == ubigeo_provincia.value);
    if (PROVINCIA_SELECTED) {
        provincia.value = PROVINCIA_SELECTED.name;
    }

    let DISTRITO_SELECTED = DISTRITOS_L.find((distrito) => distrito.id == ubigeo_distrito.value);
    if (DISTRITO_SELECTED) {
        distrito.value = DISTRITO_SELECTED.name;
    }

    let data = {
        full_name: full_name.value,
        phone: phone.value,
        email: email.value,
        type_client: type_client.value,
        type_document: type_document.value,
        n_document: n_document.value,
        birth_date: birth_date.value,
        ubigeo_region: ubigeo_region.value,
        ubigeo_provincia: ubigeo_provincia.value,
        ubigeo_distrito: ubigeo_distrito.value,
        region: region.value,
        provincia: provincia.value,
        distrito: distrito.value,
        address: address.value,
        state: state.value,
    };

    console.log(data);


    try {
        const resp = await $api("clients/" + props.clientSelected.id, {
            method: 'PATCH',
            body: data,
            onResponseError({ response }) {
                error_exits.value = response._data.error;
            }
        })
        console.log(resp);
        if (resp.message == 403) {
            error_exits.value = resp.message_text;
        } else {
            success.value = "El cliente se ha editaado correctamente";
            emit("editClient", resp.client);
        }
    } catch (error) {
        console.log(error);
    }
}

watch(ubigeo_region, (value) => {
    //console.log(value);
    PROVINCIAS_SELECTS.value = PROVINCIAS_L.filter((provincia) => provincia.department_id == value);
});


watch(ubigeo_provincia, (value) => {
    //console.log(value);
    DISTRITOS_SELECTS.value = DISTRITOS_L.filter((distrito) => distrito.province_id == value);
});

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
    email.value = props.clientSelected.email;
    full_name.value = props.clientSelected.full_name;
    phone.value = props.clientSelected.phone;
    n_document.value = props.clientSelected.n_document;
    address.value = props.clientSelected.address;
    type_document.value = props.clientSelected.type_document;
    //gender.value = props.clientSelected.gender;
    type_client.value = props.clientSelected.type_client;
    birth_date.value = props.clientSelected.birth_date;
    ubigeo_region.value = props.clientSelected.ubigeo_region;
    ubigeo_provincia.value = props.clientSelected.ubigeo_provincia;
    ubigeo_distrito.value = props.clientSelected.ubigeo_distrito;
    state.value = props.clientSelected.state;

});

definePage({ meta: { permission: 'edit_client', } });

</script>

<template>
    <VDialog max-width="650" :model-value="props.isDialogVisible" @update:model-value="dialogVisibleUpdate">
        <VCard class="pa-sm-11 pa-3">
            <!-- 👉 dialog close btn -->
            <DialogCloseBtn variant="text" size="default" @click="onFormReset" />

            <VCardText class="pt-5">
                <div class="text-center pb-6">
                    <h4 class="text-h4 mb-2">
                        Edit Client Company: {{ props.clientSelected.id }}
                    </h4>
                </div>

                <!-- 👉 Form -->
                <VForm class="mt-4" @submit.prevent="update">
                    <VRow>
                        <!-- 👉 First Name -->
                        <VCol cols="6">
                            <VSelect :items="['RUC']" v-model="type_document" label="Tipo de documento"
                                placeholder="Select Item" eager readonly />
                        </VCol>
                        <VCol cols="6">
                            <VTextField v-model="n_document" type="number" label="RUC"
                                placeholder="Example: 0999999999001" />
                        </VCol>

                        <VCol cols="12">
                            <VTextField v-model="full_name" label="Nombre de la empresa" placeholder="" />
                        </VCol>

                        <VCol cols="6">
                            <VSelect :items="[
                                {
                                    id: 2,
                                    name: 'Cliente Empresa'
                                },
                            ]" item-title="name" item-value="id" placeholder="Select" label="Tipo de cliente"
                                v-model="type_client" readonly />
                        </VCol>

                        <VCol cols="6">
                            <VTextField v-model="phone" type="number" label="Telefono"
                                placeholder="Example: 0999999999" />
                        </VCol>
                        <VCol cols="12">
                            <VTextField v-model="email" label="Correo" placeholder="Example: laravest@gmail.com" />
                        </VCol>
                        <VCol cols="6">

                            <label for="">Fecha de creación</label>
                            <div class="app-picker-field">
                                <div
                                    class="v-input v-input--horizontal v-input--center-affix v-input--density-comfortable v-locale--is-ltr position-relative v-text-field">
                                    <div class="v-input__control">
                                        <div
                                            class="v-field v-field--center-affix v-field--variant-outlined v-theme--light v-locale--is-ltr">
                                            <div class="v-field__field">
                                                <div class="v-field__input">
                                                    <input type="date" class="flat-picker-custom-style flatpickr-input"
                                                        v-model="birth_date" style="opacity: 1;" id="">
                                                </div>
                                            </div>
                                            <div class="v-field__outline text-primary">
                                                <div class="v-field__outline__start"></div>
                                                <div class="v-field__outline__notch"><label
                                                        class="v-label v-field-			label v-field-label--floating"
                                                        aria-hidden="true" for="input-8" style="">Nombre</label></div>
                                                <div class="v-field__outline__end"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </VCol>
                        <VCol cols="6">
                            <VSelect :items="[
                                {
                                    name: 'Activo',
                                    id: 1,
                                },
                                {
                                    name: 'Inactivo',
                                    id: 2,
                                },
                            ]" item-title="name" item-value="id" v-model="state" label="Estado"
                                placeholder="Select Item" eager />
                        </VCol>
                        <VCol cols="4">
                            <VSelect :items="REGIONES_L" item-title="name" item-value="id" placeholder="Select"
                                label="Región" v-model="ubigeo_region" eager />
                        </VCol>
                        <VCol cols="4">
                            <VSelect :items="PROVINCIAS_SELECTS" item-title="name" item-value="id" placeholder="Select"
                                label="Provincia" v-model="ubigeo_provincia" />
                        </VCol>
                        <VCol cols="4">
                            <VSelect :items="DISTRITOS_SELECTS" item-title="name" item-value="id" placeholder="Select"
                                label="Ciudad" v-model="ubigeo_distrito" />
                        </VCol>
                        <VCol cols="12">
                            <VTextarea v-model="address" label="Dirección: " placeholder="" />

                        </VCol>



                        <!-- Notifications -->
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

                        </VRow>
                        <!-- 👉 Submit and Cancel -->
                        <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
                            <VBtn type="submit">
                                Editar
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
<!-- 👉 SCRIPT PARA VALIDAR LA CÉDULA -->
<script>
function isValidCI(ci) {
    var isNumeric = true;
    var total = 0,
        individual;

    for (var position = 0; position < 10; position++) {
        // Obtiene cada posición del número de cédula
        // Se convierte a string en caso de que 'ci' sea un valor numérico
        individual = ci.toString().substring(position, position + 1)

        if (isNaN(individual)) {
            console.log(ci, position, individual, isNaN(individual))
            isNumeric = false;
            break;
        } else {
            // Si la posición es menor a 9
            if (position < 9) {
                // Si la posición es par, osea 0, 2, 4, 6, 8.
                if (position % 2 == 0) {
                    // Si el número individual de la cédula es mayor a 5
                    if (parseInt(individual) * 2 > 9) {
                        // Se duplica el valor, se obtiene la parte decimal y se aumenta uno 
                        // y se lo suma al total
                        total += 1 + ((parseInt(individual) * 2) % 10);
                    } else {
                        // Si el número individual de la cédula es menor que 5 solo se lo duplica
                        // y se lo suma al total
                        total += parseInt(individual) * 2;
                    }
                    // Si la posición es impar (1, 3, 5, 7)
                } else {
                    // Se suma el número individual de la cédula al total
                    total += parseInt(individual);
                }
            }
        }
    }

    if ((total % 10) != 0) {
        total = (total - (total % 10) + 10) - total;
    } else {
        total = 0;
    }


    if (isNumeric) {
        // El total debe ser igual al último número de la cédula
        console.log(ci, total, individual);
        console.log(ci, typeof ci, ci.length)
        // La cédula debe contener al menos 10 dígitos
        if (ci.toString().length != 10) {
            console.log("La c\u00E9dula debe ser de: 10 d\u00EDgitos.");
            return false;
        }

        // El número de cédula no debe ser cero
        if (parseInt(ci, 10) == 0) {
            console.log("La c\u00E9dula ingresada no puede ser cero.");
            return false;
        }

        // El total debe ser igual al último número de la cédula
        if (total != parseInt(individual)) {
            console.log("La c\u00E9dula ingresada no es v\u00E1lida.");
            return false;
        }

        console.log('cédula válida', ci);
        return true;
    }

    // Si no es un número  
    console.log("El dato solo puede contener numeros.");
    return false;
}
</script>