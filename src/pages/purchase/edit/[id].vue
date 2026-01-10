<script setup>
const route = useRoute("purchase-edit-id");
const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

const purchase_detail_selected = ref(null);
const isPurchaseDetailDialogVisible = ref(false);

const purchase_detail_delete_selected = ref(null);
const isPurchaseDetailDeleteDialogVisible = ref(false);

const warehouse_id = ref(null);
//const date_emition = ref(null);
const date_emition = ref("");
const isDateReady = ref(false);

const type_comprobant = ref(null);
const n_comprobant = ref(null);
const provider_id = ref(null);
const description = ref(null);

const importe = ref(0);
const igv = ref(0);
const total = ref(0);

const purchase_details = ref([]);
const warning_purchase = ref(null);
const success_purchase = ref(null);

const units = ref([]);
const warehouses = ref([]);
const providers = ref([]);

//INICIO BUSQUEDA DE PRODUCTO
const loading = ref(false);
const search_product = ref();
const select_product = ref(null);

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
      const resp = await $api(
        "sales/search_product?search=" +
          (search_product.value ? search_product.value : ""),
        {
          //const resp = await $api("sales/search_product?search=" + (query ? query : ''), {
          method: "GET",
          onResponseError({ response }) {
            console.log(response._data.error);
          },
        },
      );
      console.log(resp);
      items.value = resp.products.data;
      loading.value = false;
    } catch (error) {
      console.log(error);
    }
  }, 500);
};

watch(search_product, (query) => {
  if (!warehouse_id.value) {
    setTimeout(() => {
      warning_warehouse.value = "Debe seleccionar un almacen.";
    }, 50);
    return;
  }

  if (query.length > 2) {
    querySelections(query);
  } else {
    items.value = [];
  }
});

watch(select_product, (value) => {
  console.log(value);
});

watch(warehouse_id, (value) => {
  console.log(value);
});

watch(unit_id, (value) => {
  console.log(value);
});
//FIN BUSQUEDA DE PRODUCTO

const addProduct = async () => {
  warning_warehouse.value = null;

  if (!select_product.value) {
    setTimeout(() => {
      warning_warehouse.value = "Seleccione un producto.";
    }, 50);
    return;
  }
  if (!unit_id.value) {
    setTimeout(() => {
      warning_warehouse.value = "Seleccione la unidad.";
    }, 50);
    return;
  }
  if (!price_unit.value || price_unit.value < 0) {
    setTimeout(() => {
      warning_warehouse.value = "Ingrese un precio de producto.";
    }, 50);
    return;
  }
  if (!quantity.value || quantity.value <= 0) {
    setTimeout(() => {
      warning_warehouse.value = "Ingrese una cantidad de producto.";
    }, 50);
    return;
  }
  let unit_selected = units.value.find((unit) => unit.id == unit_id.value);
  let data = {
    purchase_id: route.params.id,
    product: select_product.value,
    unit_id: unit_id.value,
    unit: unit_selected,
    price_unit: price_unit.value,
    quantity: quantity.value,
    total: Number((price_unit.value * quantity.value).toFixed(2)),
  };

  try {
    const resp = await $api("purchase_details/", {
      method: "POST",
      body: data,
      onResponseError({ response }) {
        warning_purchase.value = response._data.error;
      },
    });
    console.log(resp);
    purchase_details.value.push(resp.purchase_detail);
    console.log(purchase_details.value);
    importe.value = resp.importe;
    igv.value = resp.igv;
    total.value = resp.total;
    setTimeout(() => {
      //calculoTotalPurchase();
      select_product.value = null;
      unit_id.value = null;
      unit_selected = null;
      price_unit.value = 0;
      quantity.value = 0;
      search_product.value = "";
    }, 25);
  } catch (error) {
    console.log(error);
  }
};

const editPurchaseDetail = (purchase_detail) => {
  isPurchaseDetailDialogVisible.value = true;
  purchase_detail_selected.value = purchase_detail;
};
const purchaseDetailEdit = (DATA) => {
  const PurchaseDetalUpdate = DATA.purchase_detail;

  let INDEX = purchase_details.value.findIndex(
    (detail) => detail.id == PurchaseDetalUpdate.id,
  );

  if (INDEX != -1) {
    purchase_details.value[INDEX] = PurchaseDetalUpdate;
  }
  importe.value = DATA.importe;
  igv.value = DATA.igv;
  total.value = DATA.total;
};

const purchaseDetailAttention = async (purchase_detail) => {
  try {
    let data = {
      purchase_id: route.params.id,
      purchase_detail_id: purchase_detail.id,
    };
    const resp = await $api("purchase_details/attention", {
      method: "POST",
      body: data,
      onResponseError({ response }) {
        warning_purchase.value = response._data.error;
      },
    });
    console.log(resp);
    let INDEX = purchase_details.value.findIndex(
      (detail) => detail.id == resp.purchase_detail.id,
    );
    if (INDEX != -1) {
      purchase_details.value[INDEX] = resp.purchase_detail;
    }
  } catch (error) {
    console.log(error);
  }
};

const purchaseDetailDelete = (DATA) => {
  // purchase_detail_id
  // importe
  // igv
  // total
  let INDEX = purchase_details.value.findIndex(
    (detail) => detail.id == DATA.purchase_detail_id,
  );
  if (INDEX != -1) {
    purchase_details.value.splice(INDEX, 1);
  }

  importe.value = DATA.importe;
  igv.value = DATA.igv;
  total.value = DATA.total;
};

const calculoTotalPurchase = () => {
  importe.value = Number(
    purchase_details.value
      .reduce((sum, purchase_detail) => sum + purchase_detail.total, 0)
      .toFixed(2),
  );
  igv.value = Number((importe.value * 0.15).toFixed(2));
  total.value = Number((importe.value + igv.value).toFixed(2));
};

const deletePurchaseDetail = (purchase_detail, index) => {
  isPurchaseDetailDeleteDialogVisible.value = true;
  purchase_detail_delete_selected.value = purchase_detail;
};
const update = async () => {
  try {
    warning_purchase.value = null;
    success_purchase.value = null;

    if (!warehouse_id.value) {
      setTimeout(() => {
        warning_purchase.value = "Se debe elegir un almacen.";
      }, 25);
      return;
    }

    if (!provider_id.value) {
      setTimeout(() => {
        warning_purchase.value = "Se debe elegir un proveedor.";
      }, 25);
      return;
    }
    if (!type_comprobant.value) {
      setTimeout(() => {
        warning_purchase.value = "Se debe elegir un tipo de comprobante.";
      }, 25);
      return;
    }
    if (!n_comprobant.value) {
      setTimeout(() => {
        warning_purchase.value = "Se debe ingresar el número de comprobante.";
      }, 25);
      return;
    }
    if (purchase_details.value == 0) {
      setTimeout(() => {
        warning_purchase.value =
          "Se debe ingresar al menos un producto al detalle de la compra.";
      }, 25);
      return;
    }

    let data = {
      provider_id: provider_id.value,
      type_comprobant: type_comprobant.value,
      n_comprobant: n_comprobant.value,
      description: description.value,
    };

    const resp = await $api("purchase/" + route.params.id, {
      method: "PATCH",
      body: data,
      onResponseError({ response }) {
        warning_purchase.value = response._data.error;
      },
    });
    console.log(resp);
    success_purchase.value = resp.message_text;
    /* setTimeout(() => {
            warehouse_id.value = null;
            provider_id.value = null;
            type_comprobant.value = null;
            n_comprobant.value = '';
            purchase_details.value = null;
            description.value = '';
            purchase_details.value = [];
            total.value = 0;
            importe.value = 0;
            igv.value = 0;
        }, 25); */
  } catch (error) {
    console.log(error);
  }
};

const config = async () => {
  try {
    const resp = await $api("purchase/config", {
      method: "GET",
      onResponseError({ response }) {
        console.log(response._data.error);
      },
    });
    console.log(resp);

    warehouses.value = resp.warehouses;
    units.value = resp.units;
    warehouses.value = resp.warehouses;
    date_emition.value = resp.today;
    providers.value = resp.providers;
  } catch (error) {
    console.log(error);
  }
};

const show = async () => {
  try {
    const resp = await $api("purchase/" + route.params.id, {
      method: "GET",
      onResponseError({ response }) {
        warning_purchase.value = response._data.error;
      },
    });
    console.log(resp);
    warehouse_id.value = resp.purchase.warehouse_id;
    provider_id.value = resp.purchase.provider_id;
    //date_emition.value = resp.purchase.date_emition;
    if (resp.purchase.date_emition) {
      date_emition.value = resp.purchase.date_emition.substring(0, 10);
    } else {
      date_emition.value = "";
    }
    type_comprobant.value = resp.purchase.type_comprobant;
    n_comprobant.value = resp.purchase.n_comprobant;
    purchase_details.value = resp.purchase.details;
    importe.value = resp.purchase.importe;
    igv.value = resp.purchase.igv;
    total.value = resp.purchase.total;
    description.value = resp.purchase.description;
    isDateReady.value = true;
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  config();
  show();
});
definePage({ meta: { permission: "edit_sale" } });
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-space-between gap-4 mb-6">
      <div class="d-flex flex-column justify-center">
        <h4 class="text-h4 mb-1">🗃️ Edit Purchase # {{ route.params.id }}</h4>
        <p class="text-body-1 mb-0">Formulario para editar una compra.</p>
      </div>
    </div>
    <VRow>
      <VCol cols="12">
        <!-- INFORMACIÓN GENERAL -->
        <VCard class="mb-6" title="Información general">
          <VCardText>
            <VRow>
              <VCol cols="3">
                <VTextField
                  label="Solicitante"
                  placeholder=""
                  v-model="user.full_name"
                  readonly
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  label="Sucursal"
                  placeholder=""
                  v-model="user.sucursale.name"
                  readonly
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  v-model="warehouse_id"
                  :items="warehouses"
                  label="Almacen"
                  item-title="name"
                  item-value="id"
                  placeholder="Select Almacen"
                  eager
                  disabled
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  v-model="provider_id"
                  :items="providers"
                  label="Proveedores"
                  item-title="full_name"
                  item-value="id"
                  placeholder="Select Proveedor"
                  eager
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <!-- <AppDateTimePicker
                  label="Fecha de emisión."
                  v-model="date_emition"
                  placeholder="Select date"
                  readonly
                /> -->
                <AppDateTimePicker
                  v-if="isDateReady"
                  label="Fecha de emisión."
                  v-model="date_emition"
                  readonly
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  :items="[
                    'FACTURA ELECTRÓNICA',
                    'NOTA DE CREDITO',
                    'NOTA DE DEBITO',
                    'RECIBO POR HONORARIOS',
                    'GUIA DE REMISIÓN',
                  ]"
                  v-model="type_comprobant"
                  label="Tipo de Comprobantes"
                  placeholder="Select Tipo"
                  eager
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  label="N° de comprobante"
                  v-model="n_comprobant"
                  placeholder="N° de comprobante"
                />
              </VCol>
              <VCol cols="3">
                <VTextarea
                  label="Descripción"
                  rows="2"
                  v-model="description"
                  placeholder=""
                  variant="filled"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
      <!-- PRODUCTO SOLICITADO -->
      <VCol cols="12">
        <VCard class="mb-6" title="Producto solicitado">
          <VCardText>
            <VRow>
              <VCol cols="7">
                <VRow>
                  <VCol cols="12">
                    <VAutocomplete
                      v-model="select_product"
                      v-model:search="search_product"
                      :loading="loading"
                      :items="items"
                      item-title="title"
                      item-value="id"
                      return-object
                      placeholder="Buscar producto"
                      label="¿Qué producto busca?"
                      variant="underlined"
                      :menu-props="{ maxHeight: '200px' }"
                    />
                  </VCol>
                  <VCol cols="12" v-if="warning_warehouse">
                    <VAlert closable close-label="Close Alert" color="warning">
                      {{ warning_warehouse }}
                    </VAlert>
                  </VCol>
                </VRow>
              </VCol>

              <VCol cols="5">
                <VRow>
                  <VCol cols="10">
                    <VRow>
                      <VCol cols="4">
                        <VSelect
                          :items="units"
                          item-title="name"
                          item-value="id"
                          placeholder="Select"
                          v-model="unit_id"
                          label="UM"
                        />
                      </VCol>
                      <VCol cols="4">
                        <VTextField
                          label="Precio"
                          v-model="price_unit"
                          prefix="$"
                          type="number"
                          placeholder=""
                        />
                      </VCol>
                      <VCol cols="4">
                        <VTextField
                          label="Cantidad"
                          type="number"
                          v-model="quantity"
                          placeholder=""
                        />
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
      </VCol>
      <!-- DETALLE DE LA COMPRA -->
      <VCol cols="12">
        <VCard class="mb-6" title="Detalle de la compra">
          <VTable style="border: 1px solid #ccc">
            <thead>
              <tr>
                <th></th>
                <th>Est. Ent.</th>
                <th class="text-uppercase">Producto</th>
                <th class="text-uppercase">UM</th>
                <th class="text-uppercase">Cantidad</th>
                <th class="text-uppercase">Precio unitario</th>
                <th class="text-uppercase">Total</th>
                <th class="text-uppercase">Acción</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(purchase_detail, index) in purchase_details"
                :key="index"
              >
                <td>
                  <VBtn
                    v-if="purchase_detail.state == 1"
                    @click="purchaseDetailAttention(purchase_detail)"
                    icon="ri-contract-line"
                    variant="text"
                  />
                </td>
                <td>
                  <VChip color="error" v-if="purchase_detail.state == 1"
                    >PENDIENTE
                  </VChip>
                  <VChip color="primary" v-if="purchase_detail.state == 2"
                    >COMPLETO
                  </VChip>
                </td>
                <td>{{ purchase_detail.product.title }}</td>
                <td>{{ purchase_detail.unit.name }}</td>
                <td>{{ purchase_detail.quantity }}</td>
                <td>${{ purchase_detail.price_unit }}</td>
                <td>${{ purchase_detail.total }}</td>
                <td class="d-flex align-center">
                  <IconBtn
                    size="small"
                    @click="editPurchaseDetail(purchase_detail)"
                  >
                    <VIcon icon="ri-pencil-line" />
                  </IconBtn>
                  <IconBtn
                    v-if="purchase_detail.state == 1"
                    size="small"
                    @click="deletePurchaseDetail(purchase_detail)"
                  >
                    <VIcon icon="ri-delete-bin-line" />
                  </IconBtn>
                </td>
              </tr>
              <br />
              <td colspan="3">
                <hr style="color: #999" />
              </td>
              <br />
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>

                <td>
                  <VTextField
                    label="Subtotal"
                    v-model="importe"
                    placeholder=""
                    type="number"
                    prefix="$"
                    readonly
                  />
                </td>
                <td>
                  <VTextField
                    label="IVA"
                    v-model="igv"
                    placeholder=""
                    type="number"
                    prefix="$"
                    readonly
                  />
                </td>
                <td>
                  <VTextField
                    label="Total"
                    v-model="total"
                    placeholder=""
                    type="number"
                    prefix="$"
                    readonly
                  />
                </td>
                <td></td>
              </tr>
            </tbody>
            <br />
          </VTable>
        </VCard>
      </VCol>
      <VCol cols="12" v-if="warning_purchase">
        <VAlert closable close-label="Close Alert" color="error">
          {{ warning_purchase }}
        </VAlert>
      </VCol>
      <VCol cols="12" v-if="success_purchase">
        <VAlert closable close-label="Close Alert" color="success">
          {{ success_purchase }}
        </VAlert>
      </VCol>
      <VCol cols="12">
        <VBtn block @click="update()"> Editar compra </VBtn>
      </VCol>
    </VRow>

    <PurchaseDetailEditDialog
      v-if="purchase_detail_selected && isPurchaseDetailDialogVisible"
      v-model:isDialogVisible="isPurchaseDetailDialogVisible"
      :purchaseDetailSelected="purchase_detail_selected"
      :units="units"
      :purchase_id="route.params.id"
      @editPurchaseDetail="purchaseDetailEdit"
    >
    </PurchaseDetailEditDialog>

    <PurchaseDetailDeleteDialog
      v-if="
        purchase_detail_delete_selected && isPurchaseDetailDeleteDialogVisible
      "
      v-model:isDialogVisible="isPurchaseDetailDeleteDialogVisible"
      :purchaseDetailSelected="purchase_detail_delete_selected"
      @deletePurchaseDetail="purchaseDetailDelete"
    >
    </PurchaseDetailDeleteDialog>
  </div>
</template>
