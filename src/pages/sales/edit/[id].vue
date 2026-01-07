<script setup>
const router = useRouter();
const cancel = () => {
    router.push({
        name: 'sales-list',
    });
};

const route = useRoute('sales-edit-id');

const isClientSearchDialogVisible = ref(false);
const isClientFinalAddDialogVisible = ref(false);
const isClientCompanyAddDialogVisible = ref(false);
const isDetailEditDialogVisible = ref(false);
const isDetailDeleteDialogVisible = ref(false);
const isPaymentEditDialogVisible = ref(false);
const isPaymentDeleteDialogVisible = ref(false);

const date_emition = ref(null);
const warehouses = ref([]);
const warehouse_id = ref(null);
const search_client = ref(null);
const list_clients = ref([]);
const client_selected = ref(null);
const warning_client = ref(null);

const units = ref([]);
const unit_id = ref(null);
const quantity = ref(0);
const price_unit = ref(0);
const is_gift = ref(1);
const discount = ref(0);
//const search = ref(null);

const sale_details = ref([]);
const selected_detail_edit = ref(null);
const selected_detail_delete = ref(null);
const igv_total = ref(0);
const discount_total = ref(0);
const subtotal_original = ref(0);
const total_all = ref(0);
const sale_selected = ref(null);

const payments = ref([]);
const method_payment = ref(null);
const amount = ref(0);
const payment_total = ref(0);
const warning_payment = ref(null);
const description = ref(null);
const selected_payment_edit = ref(null);
const selected_payment_delete = ref(null);

const warning_sale = ref(null);
const success_sale = ref(null);

//INICIO BUSQUEDA DE PRODUCTO
const loading = ref(false)
const search_product = ref()
const select_product = ref(null)

const items = ref([]);
const warning_warehouse = ref(null);
const warning_client_product = ref(null);

const querySelections = (query) => {
    loading.value = true;
    warning_warehouse.value = null;
    warning_client_product.value = null;

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
            warning_warehouse.value = "Debe seleccionar un almacen.";
        }, 50);
        return;
    }
    if (!client_selected.value) {
        setTimeout(() => {
            warning_client_product.value = "Debe seleccionar un cliente.";
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
            }
        });
        console.log(units);
        cleanFieldProducts();
    }
});

watch(warehouse_id, value => {
    console.log(value);
    if (select_product.value) {
        units.value = select_product.value.warehouses.filter((warehouse) => warehouse.warehouse_id == value).map((wh) => {
            return {
                id: wh.unit_id,
                name: wh.unit.name,
            }
        });
    }
    cleanFieldProducts();
});

watch(unit_id, value => {
    if (!value) {
        return;
    }
    if (is_gift.value == 2) {
        price_unit.value = 0;
        discount.value = 0;
        return;
    }
    let UNIT_SELECTED = value;
    let TYPE_CLIENT = client_selected.value.type_client;
    let AUTH_USER = JSON.parse(localStorage.getItem("user"));
    //PRECIO CON SUCURSAL DE USUARIO AUTENTICADO
    let PRICE_SELECTED = select_product.value.wallets.find((wallet) => wallet.type_client == TYPE_CLIENT
        && wallet.unit_id == UNIT_SELECTED
        && wallet.sucursale_id == AUTH_USER.sucursale_id);
    console.log(PRICE_SELECTED, UNIT_SELECTED);
    if (PRICE_SELECTED) {
        price_unit.value = PRICE_SELECTED.price;
        console.log(PRICE_SELECTED, UNIT_SELECTED)
    } else {
        //SUCURSAL NULA
        let PRICE_SELECTED = select_product.value.wallets.find((wallet) => wallet.type_client == TYPE_CLIENT
            && wallet.unit_id == UNIT_SELECTED
            && wallet.sucursale_id == null);
        console.log(PRICE_SELECTED, UNIT_SELECTED)
        if (PRICE_SELECTED) {
            price_unit.value = PRICE_SELECTED.price;
        } else {
            //EN CASO QUE NO SE HAYA ENCONTRADO MULTIPLE PRECIO
            price_unit.value = TYPE_CLIENT == 1 ? select_product.value.price_general : select_product.value.price_company;
        }
    }

});

watch(is_gift, value => {
    console.log(value);
    if (value == 2) {
        price_unit.value = 0;
        discount.value = 0;
    } else {
        if (select_product.value) {
            let UNIT = unit_id.value;
            unit_id.value = "";
            setTimeout(() => {
                unit_id.value = UNIT;
            }, 25);
        }
    }

});
//FIN BUSQUEDA DE PRODUCTO

const radioContent = ref([]);

const selectedRadio = ref('1');

watch(selectedRadio, value => {
    console.log(value);
    if (value == 2) {
        payments.value = [];
        cleanFieldPayment();
        payment_total.value = 0;
    }
});

const config = async () => {
    try {
        const resp = await $api("sales/config", {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response._data.error);
            }
        });
        //  date_emition.value = resp.today;
        let USER_AUTENTICATE = JSON.parse(localStorage.getItem("user"));
        warehouses.value = resp.warehouses.filter((warehouse) => warehouse.sucursale_id == USER_AUTENTICATE.sucursale_id);
        console.log(resp);
    } catch (error) {
        console.log(error);

    }
}
const searchClient = async () => {
    isClientSearchDialogVisible.value = false;
    client_selected.value = null;
    warning_client.value = null;
    try {
        const resp = await $api("sales/search_client?search=" + (search_client.value ? search_client.value : ''), {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response._data.error);
            }
        });
        console.log(resp);
        list_clients.value = resp.clients;
        if (list_clients.value.length == 1) {
            selectedClient(list_clients.value[0]);
        } else {
            if (list_clients.value.length == 0) {
                warning_client.value = 'No se encontro ninguna coincidencia';
            }
            setTimeout(() => {
                isClientSearchDialogVisible.value = true;
            }, 25);
        }

    } catch (error) {

    }
};
const addNewClient = (NewClient) => {
    console.log(NewClient);
    search_client.value = NewClient.full_name;
    selectedClient(NewClient);
    warning_client.value = null;
}
const selectedClient = (Client) => {
    console.log(Client);
    client_selected.value = Client;
    search_client.value = Client.full_name;
    cleanFieldProducts();

}
const cleanFieldProducts = () => {
    unit_id.value = null;
    price_unit.value = 0;
    quantity.value = 0;
    is_gift.value = 1;
    discount.value = 0;
}
const addProduct = async () => {
    warning_warehouse.value = null;
    if (!unit_id.value) {
        setTimeout(() => {
            warning_warehouse.value = "Es necesario seleccionar una unidad";
        }, 25);
        return;
    }
    if (is_gift.value == 1 && (!price_unit.value || price_unit.value == 0)) {
        setTimeout(() => {
            warning_warehouse.value = "Es necesario ingresar un precio. mayor a 0";
        }, 25);
        return;
    }
    if (!quantity.value || quantity.value == 0) {
        setTimeout(() => {
            warning_warehouse.value = "Es necesario ingresar una cantidad mayor a 0.";
        }, 25);
        return;
    }
    if (is_gift.value == 2) {
        price_unit.value = 0;
        discount.value = 0;
    }

    let UNIT_SELECTED = units.value.find((unit) => unit.id == unit_id.value);
    let IGV = 0;
    if (select_product.value.tax_selected == 2) {
        IGV = 0;
    } else {
        IGV = Number(price_unit.value) * (select_product.value.importe_iva * 0.01);
    }
    let SUBTOTAL = Number(price_unit.value) - Number(discount.value) + IGV;

    let EXIST_PRODUCT_UNIT = sale_details.value.find((sale_detail) => sale_detail.product.id == select_product.value.id
        && sale_detail.unit_id == unit_id.value);

    if (EXIST_PRODUCT_UNIT) {
        setTimeout(() => {
            warning_warehouse.value = "El producto y la unidad ya existe en el detalle, seleccione otro";
        }, 25);
        return;
    }

    if (select_product.value.is_discount == 2) {
        let MAX_DISCOUNT = select_product.value.max_discount * 0.01 * Number(price_unit.value);//EL DESCUENTO MAXIMO
        if (MAX_DISCOUNT < Number(discount.value)) {
            setTimeout(() => {
                warning_warehouse.value = "El descuento maximo del producto es : S/." + MAX_DISCOUNT;
            }, 25);
            return;
        }
    }
    if (selectedRadio.value == 1 && select_product.value.disponibilidad == 2) {
        let WAREHOUSE_PRODUCT = select_product.value.warehouses;
        let WAREHOUSE_SELECTED = WAREHOUSE_PRODUCT.find(warehouse => warehouse.warehouse_id == warehouse_id.value &&
            warehouse.unit_id == unit_id.value);
        if (WAREHOUSE_SELECTED) {
            if (WAREHOUSE_SELECTED.stock < quantity.value) {
                setTimeout(() => {
                    warning_warehouse.value = "El stock disponibible de este producto es " + WAREHOUSE_SELECTED.stock;
                }, 25);
                return;
            }
        }
    }
    let data = {
        sale_id: route.params.id,
        product: select_product.value,
        unit_id: unit_id.value,
        unit: UNIT_SELECTED,
        warehouse_id: warehouse_id.value,
        price: price_unit.value,
        quantity: quantity.value,
        discount: discount.value,
        is_gift: is_gift.value,
        igv: IGV.toFixed(2),
        subtotal: SUBTOTAL.toFixed(2),
        total: (SUBTOTAL * parseInt(quantity.value)).toFixed(2),
    };

    try {
        const resp = await $api("sale_details", {
            method: 'POST',
            body: data,
            onResponseError({ response }) {
                warning_sale.value = response._data.error;
            }
        })
        console.log(resp);
        sale_details.value.push(resp.detail);
        setTimeout(() => {
            // reportDetail();
            igv_total.value = resp.igv;
            discount_total.value = resp.discount;
            subtotal_original.value = resp.subtotal
            total_all.value = resp.total;
            cleanFieldProducts();
        }, 25);
    } catch (error) {
        console.log(error);
    }
};
const editDetail = (detail) => {
    isDetailEditDialogVisible.value = true;
    selected_detail_edit.value = detail;
    console.log(detail);

};

const saleDetailUpdate = (DATA) => {
    total_all.value = DATA.total;
    discount_total.value = DATA.discount;
    igv_total.value = DATA.igv;
    subtotal_original.value = DATA.subtotal;

    let INDEX = sale_details.value.findIndex((sale_detail) => sale_detail.id == DATA.detail.id);
    if (INDEX != 1) {
        sale_details.value[INDEX] = DATA.detail;
    }
}

const reportDetail = () => {
    //1. SUMA TOTAL DE IMPUESTOS
    igv_total.value = sale_details.value.reduce((sum, sale_detail) => sum + Number(sale_detail.igv) * Number(sale_detail.quantity), 0);

    //2. SUMA TOTAL DE DESCUENTO
    discount_total.value = sale_details.value.reduce((sum, sale_detail) => sum + Number(sale_detail.discount) * Number(sale_detail.quantity), 0);

    //3. SUMA TOTAL DE ORIGINAL
    subtotal_original.value = sale_details.value.reduce((sum, sale_detail) => sum + (Number(sale_detail.price) /* + Number(sale_detail.igv)*/) * Number(sale_detail.quantity), 0);

    //4. SUMA TOTAL
    total_all.value = sale_details.value.reduce((sum, sale_detail) => sum + Number(sale_detail.total), 0);
};
const deleteDeatil = (sale_detail, index) => {
    warning_warehouse.value = null;
    let TOTAL_DELETE = sale_details.value[index].total;

    if (total_all.value - TOTAL_DELETE < payment_total.value) {
        setTimeout(() => {
            warning_warehouse.value = "No se puede elminar este producto porque el pago cancelado es mayor. ";
        }, 25);
        return;
    }
    isDetailDeleteDialogVisible.value = true;
    selected_detail_delete.value = sale_detail;
    /* sale_details.value.splice(index, 1);
    setTimeout(() => {
        reportDetail();
    }, 25); */
};
const saleDetailDelete = (DATA) => {
    total_all.value = DATA.total;
    discount_total.value = DATA.discount;
    igv_total.value = DATA.igv;
    subtotal_original.value = DATA.subtotal;

    let INDEX = sale_details.value.findIndex((sale_detail) => sale_detail.id == DATA.sale_detail_id);
    if (INDEX != 1) {
        sale_details.value.splice(INDEX, 1);
    }
}
const addPayment = async () => {

    warning_payment.value = null;

    if (!method_payment.value) {
        setTimeout(() => {
            warning_payment.value = "Se debe elegir un metodo de pago.";
        }, 25);
        return;
    }
    if (total_all.value <= 0) {
        setTimeout(() => {
            warning_payment.value = "El total de la venta debe ser mayor a cero para añadir un pago.";
        }, 25);
        return;
    }
    if ((Number(payment_total.value) + Number(amount.value)) > Number(total_all.value)) {
        setTimeout(() => {
            warning_payment.value = "El total pagado no puede ser mayor al total de la venta.";
        }, 25);
        return;
    }
    let data = {
        sale_id: route.params.id,
        method_payment: method_payment.value,
        amount: amount.value,
    }
    try {
        const resp = await $api("sale_payments", {
            method: 'POST',
            body: data,
            onResponseError({ response }) {
                warning_sale.value = response._data.error;
            }
        })
        console.log(resp);
        payments.value.unshift(resp.payment);
        payment_total.value = resp.payment_total;
        paymentTotal();
        cleanFieldPayment();

        setTimeout(() => {
            // reportDetail();

            cleanFieldProducts();
        }, 25);
    } catch (error) {
        console.log(error);
    }

}
const editPayment = (payment) => {
    selected_payment_edit.value = payment;
    isPaymentEditDialogVisible.value = true;
}

const paymentUpdate = (DATA) => {

    let paymentUpdate = DATA.payment;
    payment_total.value = DATA.payment_total;

    let INDEX = payments.value.findIndex((payment) => payment.id == paymentUpdate.id);
    if (INDEX != -1) {
        payments.value[INDEX] = paymentUpdate;
    }


}

const deletePaymnet = (payment) => {
    isPaymentDeleteDialogVisible.value = true;
    selected_payment_delete.value = payment;
}

const paymentDelete = (DATA) => {
    let paymentDelete = DATA.payment;
    payment_total.value = DATA.payment_total;

    let INDEX = payments.value.findIndex((payment) => payment.id == paymentDelete.id);
    if (INDEX != -1) {
        payments.value.splice(INDEX, 1);
    }

}

const cleanFieldPayment = () => {
    method_payment.value = null;
    amount.value = 0;
}
const paymentTotal = () => {
    payment_total.value = payments.value.reduce((sum, payment) => sum + Number(payment.amount), 0);
}
const cleanFieldForm = () => {
    payments.value = [];
    description.value = '';
    sale_details.value = [];
    warehouse_id.value = null;
    client_selected.value = [];
    search_client.value = '';
    total_all.value = 0;
    igv_total.value = 0;
    subtotal_original.value = 0;
    discount_total.value = 0;
    payment_total.value = 0;
    cleanFieldPayment();
    cleanFieldProducts();
}
const conv = (value) => {
    let valor = Number(value).toFixed(2);
    return valor;
}

const store = async () => {
    try {
        warning_sale.value = null;
        success_sale.value = null;
        if (sale_details.value.length == 0) {
            setTimeout(() => {
                warning_sale.value = "Es necesario agrgrar uno o más productos al detallado.";
            }, 25);
            return;
        }
        /* if (!warehouse_id.value) {
            setTimeout(() => {
                warning_sale.value = "Es necesario seleccionar un almacen.";
            }, 25);
            return;
        } */
        if (!client_selected.value) {
            setTimeout(() => {
                warning_sale.value = "Es necesario ingresar un cliente.";
            }, 25);
            return;
        }
        if (selectedRadio.value == 1) {
            if (payments.value.length == 0) {
                setTimeout(() => {
                    warning_sale.value = "Es necesario dar un adelanto para generar la venta.";
                }, 25);
                return;
            }
        }

        let STATE_PAYMENT = 1;
        if (selectedRadio.value == 1) {
            if (payment_total.value != total_all.value) {
                STATE_PAYMENT = 2;
            }
            if (payment_total.value == total_all.value) {
                STATE_PAYMENT = 3;
            }
        }

        let data = {

            client_id: client_selected.value.id,
            type_client: client_selected.value.type_client,
            discount: discount_total.value,
            subtotal: Number(subtotal_original.value),
            total: total_all.value,
            igv: igv_total.value,
            state_sale: selectedRadio.value,
            state_payment: STATE_PAYMENT,
            debt: Number(total_all.value) - Number(payment_total.value),
            paid_out: payment_total.value,
            //date_validation, Fecha en la que la cotización pasa a la venta
            //date_pay_complete, Fecha en la que se paga todo
            description: description.value,
            //sale_details: sale_details.value,
            //payments: payments.value

        };

        const resp = await $api("sales/" + route.params.id, {
            method: 'PATCH',
            body: data,
            onResponseError({ response }) {
                warning_sale.value = response._data.error;
            }
        });
        console.log(resp);
        success_sale.value = "La " + (selectedRadio.value == 1 ? 'venta' : 'cotización') + " se a editado correctamente.";
        //cleanFieldForm();
    } catch (error) {
        console.log(error);
    }
}

const show = async () => {
    try {
        radioContent.value = [];
        const resp = await $api("sales/" + route.params.id, {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response._data.error);
            }
        });
        console.log(resp);
        sale_selected.value = resp.sale;
        client_selected.value = resp.sale.client;
        client_selected.value.type_client = resp.sale.type_client;
        search_client.value = client_selected.value.full_name;
        date_emition.value = resp.sale.created_at_format;
        sale_details.value = resp.sale.sale_details;
        discount_total.value = resp.sale.discount;
        igv_total.value = resp.sale.igv;
        subtotal_original.value = resp.sale.subtotal;
        total_all.value = resp.sale.total;
        payments.value = resp.sale.payments;
        payment_total.value = resp.sale.paid_out;
        description.value = resp.sale.description;
        selectedRadio.value = resp.sale.state_sale + "";

        radioContent.value.push({
            title: 'Venta',
            // desc: 'A simple start for everyone.',
            value: '1',
            icon: 'ri-shopping-cart-line',
        });
        if (resp.sale.state_sale == 2) {
            radioContent.value.push({
                title: 'Cotización',
                // desc: 'For small to medium businesses.',
                value: '2',
                icon: 'ri-file-list-line',
            });
        }
    } catch (error) {
        console.log(error);

    }
}

const stockAttentionDetail = async (sale_detail) => {

    try {
        let data = {
            sale_detail_id: sale_detail.id
        }
        const resp = await $api("stock_attention_detail", {
            method: 'POST',
            body: data,
            onResponseError({ response }) {
                warning_sale.value = response._data.error;
            }
        })
        console.log(resp);
        let INDEX = sale_details.value.findIndex((detail) => detail.id == resp.sale_detail.id);
        if (INDEX != -1) {
            sale_details.value[INDEX] = resp.sale_detail;
        }


    } catch (error) {
        console.log(error);

    }
}

onMounted(() => {
    config();
    show();
});
definePage({ meta: { permission: 'edit_sale', } });
</script>
<template>
    <div>
        <!--  TITULO -->
        <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
            <div class="d-flex flex-column justify-center">
                <h4 class="text-h4 mb-1">
                    🛍️ Edit Sale / Cotización: #{{ route.params.id }}
                </h4>
                <p class="text-body-1 mb-0">
                    Formulario para agregar una nueva venta.
                </p>
            </div>
        </div>
        <!-- 1. SELECCION DE TIPO DE DOCUMENTO -->
        <VCard class="mb-6 px-4 py-4">

            <CustomRadiosWithIcon v-model:selected-radio="selectedRadio" :radio-content="radioContent"
                :grid-column="{ sm: '6', cols: '12' }" />

        </VCard>
        <!-- 2. INFORMACIÓN GENERAL-->
        <VCard class="mb-6">
            <VCardText>
                <VRow>
                    <VCol cols="2">
                        <AppDateTimePicker v-model="date_emition" label="Fecha de emisión" placeholder="" disabled />
                    </VCol>
                    <VCol cols="4">
                        <VSelect :items="warehouses" item-title="name" item-value="id" placeholder="Select"
                            v-model="warehouse_id" label="Almacenes" />
                    </VCol>
                    <VCol cols="4">

                        <VRow>
                            <VCol cols="12">
                                <VTextField label="Cliente" prepend-inner-icon="ri-user-6-line" placeholder=""
                                    v-model="search_client" @keyup.enter="searchClient()" />
                            </VCol>
                            <VCol cols="12 py-0" v-if="client_selected">
                                <span><b>Cliente: &nbsp;</b>{{ client_selected.full_name }}</span>
                                <br>
                                <span><b>CI/RUC: &nbsp;</b>{{ client_selected.n_document }}</span>
                                <br>
                                <span><b>Email: &nbsp;</b>{{ client_selected.email }}</span>
                                <br>
                                <span><b>Teléfono: &nbsp;</b>{{ client_selected.phone }}</span>
                            </VCol>
                            <VCol cols="12 py-0" v-if="warning_client">
                                <VAlert closable close-label="Close Alert" color="warning">
                                    {{ warning_client }}
                                </VAlert>
                            </VCol>
                        </VRow>
                    </VCol>
                    <VCol cols="2">

                        <VBtn color="secondary" class="mx-2"
                            @click="isClientFinalAddDialogVisible = !isClientFinalAddDialogVisible">
                            <VIcon icon="ri-user-add-line" />
                        </VBtn>
                        <VBtn color="secondary"
                            @click="isClientCompanyAddDialogVisible = !isClientCompanyAddDialogVisible">
                            <VIcon icon="ri-community-line" />
                        </VBtn>


                    </VCol>
                </VRow>
            </VCardText>
        </VCard>
        <!-- 3. PRODUCTO -->
        <VCard class="mb-6">
            <VCardText>
                <VRow>
                    <VCol cols="7">
                        <VRow>
                            <VCol cols="12">
                                <VAutocomplete v-model="select_product" v-model:search="search_product"
                                    :loading="loading" :items="items" item-title="title" item-value="id" return-object
                                    placeholder="Search for a product" label="¿Qué producto busca?" variant="underlined"
                                    :menu-props="{ maxHeight: '200px' }" />
                            </VCol>
                            <VCol cols="12" v-if="warning_warehouse">
                                <VAlert closable close-label="Close Alert" color="warning">
                                    {{ warning_warehouse }}
                                </VAlert>
                            </VCol>
                            <VCol cols="12" v-if="warning_client_product">
                                <VAlert closable close-label="Close Alert" color="warning">
                                    {{ warning_client_product }}
                                </VAlert>
                            </VCol>
                        </VRow>
                    </VCol>

                    <VCol cols="5">
                        <VRow>
                            <VCol cols="10">
                                <VRow>
                                    <VCol cols="4">
                                        <VSelect :items="units" item-title="name" item-value="id" placeholder="Select"
                                            v-model="unit_id" label="Unidades" />
                                    </VCol>
                                    <VCol cols="4">
                                        <VTextField v-model="price_unit" label="Precio" prefix="$" type="number"
                                            placeholder="" :disabled="is_gift == 2 ? true : null" />
                                    </VCol>
                                    <VCol cols="4">
                                        <VTextField label="Cantidad" type="number" v-model="quantity" placeholder="" />
                                    </VCol>
                                    <VCol cols="4" v-if="select_product && select_product.is_gift == 2">
                                        <p class="my-0">¿Regalo?</p>
                                        <VCheckbox label="SI" value="2" v-model="is_gift" />
                                    </VCol>
                                    <VCol cols="4" v-if="select_product && select_product.is_discount == 2">
                                        <VTextField label="Descuento" type="number" v-model="discount" placeholder=""
                                            :disabled="is_gift == 2 ? true : null" prefix="$" />
                                    </VCol>
                                </VRow>

                            </VCol>
                            <VCol cols="2">
                                <VBtn color="primary" @click="addProduct()">
                                    <VIcon icon="ri-add-circle-line" />
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>
        <!-- 4. DETALLADO DE LA VENTA O COTIZACIÓN -->

        <VCard class="mb-6">
            <VCardText>
                <!-- <h2 class="text-body-1 mb-0">
                    Detallado de la {{ selectedRadio == 1 ? 'venta' : 'cotización' }}
                </h2>
                <br> -->
                <VRow>
                    <VCol cols="12">
                        <!-- table -->
                        <VTable class="text-uppercase">
                            <thead>
                                <tr>
                                    <th class="text-uppercase">
                                        At.
                                    </th>
                                    <th class="text-uppercase">
                                        Producto
                                    </th>
                                    <th class="text-uppercase">
                                        Cant.
                                    </th>
                                    <th class="text-uppercase">
                                        E. Entrega
                                    </th>
                                    <th class="text-uppercase">
                                        Unidad
                                    </th>
                                    <th class="text-uppercase">
                                        Prec. Unit.
                                    </th>

                                    <th class="text-uppercase">
                                        Dcto.
                                    </th>
                                    <th class="text-uppercase">
                                        IVA
                                    </th>
                                    <th class="text-uppercase">
                                        Subtotal
                                    </th>
                                    <th class="text-uppercase">
                                        Total
                                    </th>
                                    <th class="text-uppercase">
                                        Acción
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-for="(sale_detail, index) in sale_details" :key="index">
                                    <td>
                                        <VBtn v-if="sale_detail.state_attention != 3 && sale_selected.state_sale == 1"
                                            @click="stockAttentionDetail(sale_detail)" icon="ri-contract-line"
                                            variant="text" />
                                    </td>
                                    <td>{{ sale_detail.product.title }}</td>
                                    <td>{{ sale_detail.quantity }}</td>
                                    <td>
                                        <VChip color="error" v-if="sale_detail.state_attention == 1">PENDIENTE
                                        </VChip>
                                        <VChip color="warning" v-if="sale_detail.state_attention == 2">PARCIAL
                                        </VChip>
                                        <VChip color="primary" v-if="sale_detail.state_attention == 3">COMPLETO
                                        </VChip>
                                    </td>
                                    <td>{{ sale_detail.unit.name }}</td>
                                    <td style="white-space: nowrap;">${{ Number(sale_detail.price).toFixed(2) }}</td>

                                    <td style="white-space: nowrap;">${{
                                        Number(sale_detail.discount * sale_detail.quantity).toFixed(2) }}</td>
                                    <td style="white-space: nowrap;">${{ Number(sale_detail.igv).toFixed(2) }}</td>
                                    <td style="white-space: nowrap;">${{ Number(sale_detail.subtotal).toFixed(2) }}</td>
                                    <td style="white-space: nowrap;">${{ Number(sale_detail.total).toFixed(2) }}</td>
                                    <td>
                                        <div class="d-flex gap-1">
                                            <IconBtn size="small" @click="editDetail(sale_detail)">
                                                <VIcon icon="ri-pencil-line" />
                                            </IconBtn>
                                            <IconBtn v-if="sale_detail.state_attention == 1" size="small"
                                                @click="deleteDeatil(sale_detail, index)">
                                                <VIcon icon="ri-delete-bin-line"></VIcon>
                                            </IconBtn>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </VTable>
                    </VCol>

                    <VCol cols="7"></VCol>

                    <VCol cols="5">
                        <table style="width: 100%;">
                            <tr>
                                <td style="text-align: right;">Subtotal: </td>
                                <td class="px-2">${{ conv(subtotal_original) }}</td>

                            </tr>
                            <tr>
                                <td style="text-align: right;">Descuento: </td>
                                <td class="px-2">${{ conv(discount_total) }}</td>
                            </tr>
                            <tr>
                                <td style="text-align: right;">Iva (15%): </td>
                                <td class="px-2">${{ conv(igv_total) }}</td>
                            </tr>
                            <tr>
                                <td style="text-align: right;">Total: </td>
                                <td class="px-2">${{ conv(total_all) }}</td>
                            </tr>
                        </table>
                    </VCol>
                </VRow>
            </VCardText>
        </VCard>
        <!-- 5. FORMAS DE PAGO -->
        <VCard class="mb-6">
            <VCardText>
                <VRow>
                    <VCol cols="8" v-if="selectedRadio == 1">
                        <VRow>
                            <VCol cols="4">
                                <VSelect :items="['EFECTIVO', 'DEPOSITO', 'TRANSFERENCIA', 'DE UNA']" item-title="name"
                                    item-value="id" placeholder="Select" v-model="method_payment"
                                    label="Métodos de pago"></VSelect>
                            </VCol>
                            <VCol cols="4">
                                <VTextField label="Monto" type="number" prefix="$" v-model="amount" placeholder="" />
                            </VCol>
                            <VCol cols="4">
                                <VBtn color="primary" @click="addPayment()">
                                    <VIcon icon="ri-add-circle-line" />
                                </VBtn>
                            </VCol>
                        </VRow>
                        <VRow>
                            <VCol cols="12" v-if="warning_payment">
                                <VAlert closable close-label="Close Alert" color="warning">
                                    {{ warning_payment }}
                                </VAlert>
                            </VCol>
                        </VRow>
                        <VRow>
                            <VCol cols="10">
                                <VTable>
                                    <thead>
                                        <tr>
                                            <th class="text-uppercase">
                                                Metodo de pago
                                            </th>
                                            <th class="text-uppercase">
                                                Monto
                                            </th>
                                            <th class="text-uppercase">
                                                Acción
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr v-for="(payment, index) in payments" :key="index">
                                            <td>{{ payment.method_payment }}</td>
                                            <td>${{ conv(payment.amount) }}</td>
                                            <td>
                                                <div class="d-flex gap-1">
                                                    <IconBtn size="small" @click="editPayment(payment)">
                                                        <VIcon icon="ri-pencil-line" />
                                                    </IconBtn>
                                                    <IconBtn size="small" @click="deletePaymnet(payment)">
                                                        <VIcon icon="ri-delete-bin-line"></VIcon>
                                                    </IconBtn>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Total</td>
                                            <td>${{ conv(payment_total) }}</td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </VTable>
                            </VCol>
                        </VRow>
                    </VCol>
                    <VCol cols="4">
                        <VTextarea label="Descripción" rows="4" placeholder="" variant="underlined"
                            v-model="description" />
                        <br>
                        <tr>
                            <td>A pagar:</td>
                            <td class="px-4">
                                <h2>${{ conv(total_all - payment_total) }}</h2>
                            </td>
                        </tr>
                    </VCol>
                </VRow>
                <VRow>

                    <VCol cols="12 py-0" v-if="warning_sale">
                        <VAlert closable close-label="Close Alert" color="warning">
                            {{ warning_sale }}
                        </VAlert>
                    </VCol>
                    <VCol cols="12 py-0" v-if="success_sale">
                        <VAlert closable close-label="Close Alert" color="success">
                            {{ success_sale }}
                        </VAlert>
                    </VCol>
                    <VCol cols="12" class="d-flex flex-wrap justify-center gap-4">
                        <VBtn type="submit" @click="store()"> Editar {{ selectedRadio == 1 ? 'venta' : 'cotización' }}
                        </VBtn>

                        <VBtn color="secondary" variant="outlined" @click="cancel()">
                            Cancelar
                        </VBtn>
                    </VCol>

                </VRow>
            </VCardText>
        </VCard>
        <ClientSearchDialog v-if="list_clients.length > 0 && isClientSearchDialogVisible"
            v-model:isDialogVisible="isClientSearchDialogVisible" :listClients="list_clients"
            @clientSelected="selectedClient">
        </ClientSearchDialog>
        <ClientFinalAddDialog v-model:isDialogVisible="isClientFinalAddDialogVisible" @addClient="addNewClient">
        </ClientFinalAddDialog>
        <ClientCompanyAddDialog v-model:isDialogVisible="isClientCompanyAddDialogVisible" @addClient="addNewClient">
        </ClientCompanyAddDialog>
        <DetailEditDialog v-if="selected_detail_edit && isDetailEditDialogVisible"
            v-model:isDialogVisible="isDetailEditDialogVisible" :saleDetailSelected="selected_detail_edit"
            :type_client="client_selected.type_client" :type_sale="sale_selected.state_sale"
            @editSaleDetail="saleDetailUpdate">
        </DetailEditDialog>
        <DetailDeleteDialog v-if="selected_detail_delete && isDetailDeleteDialogVisible"
            v-model:isDialogVisible="isDetailDeleteDialogVisible" :saleDetailSelected="selected_detail_delete"
            @deleteSaleDetail="saleDetailDelete">
        </DetailDeleteDialog>
        <PaymentEditDialog v-if="selected_payment_edit && isPaymentEditDialogVisible"
            v-model:isDialogVisible="isPaymentEditDialogVisible" :paymentSelected="selected_payment_edit"
            :sale_id="route.params.id" @editPayment="paymentUpdate">
        </PaymentEditDialog>
        <PaymentDeleteDialog v-if="selected_payment_delete && isPaymentDeleteDialogVisible"
            v-model:isDialogVisible="isPaymentDeleteDialogVisible" :paymentSelected="selected_payment_delete"
            @deletePayment="paymentDelete">
        </PaymentDeleteDialog>
    </div>
</template>