<script setup>
const warehouses = ref([]);
const warehouse_id = ref(null);

const month_list = ref([
  {
    id: "01",
    name: "Enero",
  },
  {
    id: "02",
    name: "Febrero",
  },
  {
    id: "03",
    name: "Marzo",
  },
  {
    id: "04",
    name: "Abril",
  },
  {
    id: "05",
    name: "Mayo",
  },
  {
    id: "06",
    name: "Junio",
  },
  {
    id: "07",
    name: "Julio",
  },
  {
    id: "08",
    name: "Agosto",
  },
  {
    id: "09",
    name: "Septiembre",
  },
  {
    id: "10",
    name: "Octubre",
  },
  {
    id: "11",
    name: "Noviembre",
  },
  {
    id: "12",
    name: "Diciembre",
  },
]);
const isLoading = ref(false);
const year_list = ref([
  "2023",
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
  "2031",
  "2032",
  "2033",
]);

const month_selected = ref(
  new Date().getMonth() + 1 <= 9
    ? "0" + (new Date().getMonth() + 1)
    : new Date().getMonth() + 1 + "",
);
const year_selected = ref(new Date().getFullYear() + "");

const kardex_products = ref([]);

//INICIO BUSQUEDA DE PRODUCTO
const loading = ref(false);
const search_product = ref();
const select_product = ref(null);

const items = ref([]);
const warning_warehouse = ref(null);

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
  warning_warehouse.value = null;

  if (query.length > 2) {
    querySelections(query);
  } else {
    items.value = [];
  }
});

watch(select_product, (value) => {
  console.log(value);
});

//FIN BUSQUEDA DE PRODUCTO

const config = async () => {
  try {
    const resp = await $api("transports/config", {
      method: "GET",
      onResponseError({ response }) {
        console.log(response._data.error);
      },
    });
    console.log(resp);

    warehouses.value = resp.warehouses;
    //units.value = resp.units;
    //date_emition.value = resp.today;
  } catch (error) {
    console.log(error);
  }
};

const kardex = async () => {
  isLoading.value = true;
  try {
    let data = {
      year: year_selected.value,
      month: month_selected.value,
      warehosue_id: warehouse_id.value,
      product_id: select_product.value ? select_product.value.id : null,
    };
    const resp = await $api("kardex_products", {
      method: "POST",
      body: data,
      onResponseError({ response }) {
        console.log(response._data.error);
      },
    });
    console.log(resp);

    kardex_products.value = resp.kardex_products;
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};

const reset = () => {
  warehouse_id.value = null;
  select_product.value = null;
  search_product.vlaue = null;
  kardex();
};

const getNameUnit = (movimient_for_unit, units) => {
  let UNIT_SELECTED = units.find(
    (unit) => unit.id == movimient_for_unit.unit_id,
  );
  return UNIT_SELECTED ? UNIT_SELECTED.name : "";
};

onMounted(() => {
  kardex();

  config();
});

definePage({ meta: { permission: "kardex" } });
</script>
<template>
  <div>
    <VCard title="📋 Reporte Kardex">
      <VOverlay
        :model-value="isLoading"
        class="align-center justify-center"
        absolute
      >
        <VProgressCircular indeterminate size="50" width="5" color="primary" />
      </VOverlay>
      <VCardText>
        <VRow class="">
          <VCol cols="12">
            <VRow>
              <VCol cols="2">
                <VSelect
                  :items="year_list"
                  placeholder="Year Select"
                  v-model="year_selected"
                  label="Año"
                />
              </VCol>

              <VCol cols="2">
                <VSelect
                  :items="month_list"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="month_selected"
                  label="Mes"
                />
              </VCol>

              <VCol cols="2">
                <VSelect
                  :items="warehouses"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="warehouse_id"
                  label="Almacenes"
                />
              </VCol>
              <VCol cols="4">
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

              <VCol cols="2" class="d-flex gap-1">
                <VBtn
                  color="info"
                  class="mx-1"
                  prepend-icon="ri-search-2-line"
                  @click="kardex()"
                >
                  <VTooltip activator="parent" location="top">Buscar</VTooltip>
                </VBtn>
                <VBtn
                  color="secondary"
                  class="mx-1"
                  prepend-icon="ri-restart-line"
                  @click="reset()"
                >
                  <VTooltip activator="parent" location="top"
                    >Refrescar</VTooltip
                  >
                </VBtn>
              </VCol>
            </VRow>
          </VCol>
        </VRow>
      </VCardText>
      <VCardText class="kardex product-name">
        <template
          v-for="(kardex_product, index) in kardex_products"
          :key="index"
        >
          <VRow>
            <VCol cols="6">
              <table class="kardex no-border product-name">
                <tr>
                  <td>Producto</td>
                  <td class="product-name">{{ kardex_product.title }}</td>
                </tr>
                <tr>
                  <td>Código/Sku:</td>
                  <td>{{ kardex_product.sku }}</td>
                </tr>
                <tr>
                  <td>Categoria:</td>
                  <td>{{ kardex_product.categoria }}</td>
                </tr>
              </table>
            </VCol>
            <hr />
            <VCol cols="12">
              <table class="product-name">
                <thead>
                  <tr>
                    <th rowspan="1" colspan="2">
                      <!-- <table class="kardex no-border">
                        <tr>
                          <td>Producto</td>
                          <td class="product-name">
                            {{ kardex_product.title }}
                          </td>
                        </tr>
                        <tr>
                          <td>Código/Sku:</td>
                          <td>{{ kardex_product.sku }}</td>
                        </tr>
                        <tr>
                          <td>Categoria:</td>
                          <td>{{ kardex_product.categoria }}</td>
                        </tr>
                      </table> -->
                    </th>
                    <th colspan="3" class="entrada">Entrada</th>
                    <th colspan="3" class="salida">Salida</th>
                    <th colspan="3" class="existencias">Existencias</th>
                  </tr>
                  <tr>
                    <th rowspan="2">Fecha</th>
                    <th rowspan="2">Detalle</th>
                    <th colspan="9" class="subheader">
                      {{ kardex_product.unit_first.name }}
                    </th>
                    <!-- <th colspan="3" class="subheader">UNIDAD</th>
                                        <th colspan="3" class="subheader">UNIDAD</th> -->
                  </tr>
                  <tr>
                    <th>Cantidad</th>
                    <th>V/Unitario</th>
                    <th>V/Total</th>
                    <th>Cantidad</th>
                    <th>V/Unitario</th>
                    <th>V/Total</th>
                    <th>Cantidad</th>
                    <th>V/Unitario</th>
                    <th>V/Total</th>
                  </tr>
                </thead>
                <tbody>
                  <template
                    v-for="(
                      movimient_for_unit, index2
                    ) in kardex_product.movimient_for_units"
                    :key="index2"
                  >
                    <template
                      v-if="
                        kardex_product.unit_first.id ==
                        movimient_for_unit.unit_id
                      "
                    >
                      <tr
                        v-for="(
                          movimient, index3
                        ) in movimient_for_unit.movimients"
                        :key="index3"
                      >
                        <td>{{ movimient.fecha }}</td>
                        <td>{{ movimient.detalle }}</td>
                        <template v-if="movimient.entrada">
                          <td>{{ movimient.entrada.quantity }}</td>
                          <td>
                            $
                            {{
                              Number(movimient.entrada.price_unit).toFixed(2)
                            }}
                          </td>
                          <td>
                            $ {{ Number(movimient.entrada.total).toFixed(2) }}
                          </td>
                        </template>
                        <template v-if="!movimient.entrada">
                          <td></td>
                          <td></td>
                          <td></td>
                        </template>

                        <template v-if="movimient.salida">
                          <td>{{ movimient.salida.quantity }}</td>
                          <td>
                            $
                            {{ Number(movimient.salida.price_unit).toFixed(2) }}
                          </td>
                          <td>
                            $ {{ Number(movimient.salida.total).toFixed(2) }}
                          </td>
                        </template>
                        <template v-if="!movimient.salida">
                          <td></td>
                          <td></td>
                          <td></td>
                        </template>

                        <td>{{ movimient.existencia.quantity }}</td>
                        <td>
                          $
                          {{
                            Number(movimient.existencia.price_unit).toFixed(2)
                          }}
                        </td>
                        <td>
                          $ {{ Number(movimient.existencia.total).toFixed(2) }}
                        </td>
                      </tr>
                    </template>
                  </template>

                  <template
                    v-for="(
                      movimient_for_unit, index2
                    ) in kardex_product.movimient_for_units"
                    :key="index2"
                  >
                    <template
                      v-if="
                        kardex_product.unit_first.id !=
                        movimient_for_unit.unit_id
                      "
                    >
                      <tr class="new-row">
                        <td colspan="2"></td>
                        <td colspan="9">
                          <b>{{
                            getNameUnit(
                              movimient_for_unit,
                              kardex_product.units,
                            )
                          }}</b>
                        </td>
                        <!-- <td colspan="3"><b>CAJA</b></td>
                                                <td colspan="3"><b>CAJA</b></td> -->
                      </tr>
                      <tr class="new-row">
                        <td><b>Fecha</b></td>
                        <td><b>Detalle</b></td>
                        <td><b>Cantidad</b></td>
                        <td><b>V/Unitario</b></td>
                        <td><b>V/Total</b></td>
                        <td><b>Cantidad</b></td>
                        <td><b>V/Unitario</b></td>
                        <td><b>V/Total</b></td>
                        <td><b>Cantidad</b></td>
                        <td><b>V/Unitario</b></td>
                        <td><b>V/Total</b></td>
                      </tr>

                      <tr
                        v-for="(
                          movimient, index3
                        ) in movimient_for_unit.movimients"
                        :key="index3"
                      >
                        <td>{{ movimient.fecha }}</td>
                        <td>{{ movimient.detalle }}</td>

                        <template v-if="movimient.entrada">
                          <td>{{ movimient.entrada.quantity }}</td>
                          <td>
                            $
                            {{
                              Number(movimient.entrada.price_unit).toFixed(2)
                            }}
                          </td>
                          <td>
                            $ {{ Number(movimient.entrada.total).toFixed(2) }}
                          </td>
                        </template>
                        <template v-if="!movimient.entrada">
                          <td></td>
                          <td></td>
                          <td></td>
                        </template>

                        <template v-if="movimient.salida">
                          <td>{{ movimient.salida.quantity }}</td>
                          <td>
                            $
                            {{ Number(movimient.salida.price_unit).toFixed(2) }}
                          </td>
                          <td>
                            $ {{ Number(movimient.salida.total).toFixed(2) }}
                          </td>
                        </template>
                        <template v-if="!movimient.salida">
                          <td></td>
                          <td></td>
                          <td></td>
                        </template>

                        <td>{{ movimient.existencia.quantity }}</td>
                        <td>
                          $
                          {{
                            Number(movimient.existencia.price_unit).toFixed(2)
                          }}
                        </td>
                        <td>
                          $ {{ Number(movimient.existencia.total).toFixed(2) }}
                        </td>
                      </tr>
                    </template>
                  </template>
                </tbody>
              </table>
            </VCol>
          </VRow>
        </template>
      </VCardText>
    </VCard>
  </div>
</template>

<style>
.kardex table {
  width: 100%;
  border-collapse: collapse;
}

.kardex th,
.kardex td {
  border: 1px solid black;
  text-align: center;
  padding: 5px;
}

th {
  background-color: #f2f2f2;
}

.new-row td {
  background-color: #f2f2f2;
}

.entrada {
  background-color: #d4edda;
}

.salida {
  background-color: #f8d7da;
}

.existencias {
  background-color: #fffcd3;
}
.kardex.no-border th,
.kardex.no-border td {
  border: none !important;
  text-align: left;
}

.kardex .product-name {
  text-transform: uppercase;
  font-family: "Courier New", Courier, monospace;
}
</style>
