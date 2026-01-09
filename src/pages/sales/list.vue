<script setup>
const isSaleDeleteDialogVisible = ref(false);
const isSaleDetailShowDialogVisible = ref(false);

const router = useRouter();
const currentPage = ref(1);
const totalPage = ref(0);

const list_sales = ref([]);
const searchQuery = ref(null);
const type_client = ref(null);
const search_client = ref(null);
const range_date = ref(null);
const type = ref(null);
const state_entrega = ref(null);
const state_payment = ref(null);
const search_product = ref(null);
const search_car = ref(null);

const sale_selected_delete = ref(null);
const sale_selected_show = ref(null);

const isLoading = ref(false);

const list = async () => {
  isLoading.value = true;
  try {
    let data = {
      search: searchQuery.value,
      type_client: type_client.value,
      search_client: search_client.value,
      start_date: range_date.value ? range_date.value.split("to")[0] : "",
      end_date: range_date.value ? range_date.value.split("to")[1] : "",
      type: type.value,
      state_entrega: state_entrega.value,
      state_payment: state_payment.value,
      search_product: search_product.value,
      search_car: search_car.value,
    };
    const resp = await $api("sales/index?page=" + currentPage.value, {
      method: "POST",
      body: data,
      onResponseError({ response }) {
        console.log(response._data.error);
      },
    });
    console.log(resp);
    list_sales.value = resp.sales.data;
    totalPage.value = resp.total_page;
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};

watch(currentPage, (val) => {
  console.log(val);
  list();
});

const reset = async () => {
  searchQuery.value = "";
  type_client.value = null;
  search_client.value = null;
  search_car.value = null;
  range_date.value = null;
  type.value = null;
  state_entrega.value = null;
  state_payment.value = null;
  search_product.value = null;
  currentPage.value = 1;
  list();
};

const downloadExcel = () => {
  let QUERY_PARAMS = "";
  if (searchQuery.value) {
    QUERY_PARAMS += "&search=" + searchQuery.value;
  }
  if (type_client.value) {
    QUERY_PARAMS += "&type_client=" + type_client.value;
  }
  if (search_client.value) {
    QUERY_PARAMS += "&search_client=" + search_client.value;
  }
  if (range_date.value) {
    QUERY_PARAMS += "&start_date=" + range_date.value.split("to")[0];
    QUERY_PARAMS += "&end_date=" + range_date.value.split("to")[1];
  }
  if (type.value) {
    QUERY_PARAMS += "&type=" + type.value;
  }
  if (state_entrega.value) {
    QUERY_PARAMS += "&state_entrega=" + state_entrega.value;
  }
  if (state_payment.value) {
    QUERY_PARAMS += "&state_payment=" + state_payment.value;
  }
  if (search_product.value) {
    QUERY_PARAMS += "&search_product=" + search_product.value;
  }
  window.open(
    import.meta.env.VITE_API_BASE_URL + "sales-excel?z=1" + QUERY_PARAMS,
    "_blank",
  );
};
const addDeleteProduct = (Product) => {
  console.log(Product);
  let backup = list_sales.value;
  list_sales.value = [];
  let INDEX = backup.findIndex((product) => product.id == Product.id);
  if (INDEX != -1) {
    backup.splice(INDEX, 1);
  }
  setTimeout(() => {
    list_sales.value = backup;
  }, 50);
};

const addDeleteUser = (User) => {
  console.log(User);
  let backup = list_sales.value;
  list_sales.value = [];
  let INDEX = backup.findIndex((user) => user.id == User.id);
  if (INDEX != -1) {
    backup.splice(INDEX, 1);
  }
  setTimeout(() => {
    list_sales.value = backup;
  }, 50);
};

const editItem = (sale) => {
  console.log(sale);
  router.push({
    name: "sales-edit-id",
    params: {
      id: sale.id,
    },
  });
};
const deleteItem = (sale) => {
  isSaleDeleteDialogVisible.value = true;
  sale_selected_delete.value = sale;
};

const saleDelete = (SALE) => {
  let INDEX = list_sales.value.findIndex((sale) => sale.id == SALE.id);
  if (INDEX != -1) {
    list_sales.value.splice(INDEX, 1);
  }
};

const showDetails = (sale) => {
  isSaleDetailShowDialogVisible.value = true;
  sale_selected_show.value = sale;
};
const showPdf = (sale) => {
  //import.meta.env.VITE_API_BASE_URL
  window.open(
    import.meta.env.VITE_API_BASE_URL + "sales-pdf/" + sale.id,
    "_blank",
  );
};
onMounted(() => {
  list();
});

definePage({ meta: { permission: "list_sale" } });
</script>
<template>
  <div>
    <VCard title="🛍️ Ventas/Cotización">
      <VOverlay
        :model-value="isLoading"
        class="align-center justify-center"
        absolute
      >
        <VProgressCircular indeterminate size="50" width="5" color="primary" />
      </VOverlay>
      <VCardText>
        <VRow class="">
          <VCol cols="11">
            <VRow>
              <VCol cols="2">
                <VTextField
                  label="N° venta/cotización"
                  placeholder="N° venta/cotización"
                  density="compact"
                  class="me-3"
                  v-model="searchQuery"
                  @keyup.enter="list"
                />
              </VCol>
              <VCol cols="2">
                <VSelect
                  placeholder="Select"
                  label="Tipo de Cliente"
                  density="compact"
                  :items="[
                    { id: 1, title: 'Cliente Final' },
                    { id: 2, title: 'Cliente Empresa' },
                  ]"
                  item-title="title"
                  item-value="id"
                  v-model="type_client"
                >
                </VSelect>
              </VCol>
              <VCol cols="3">
                <VTextField
                  placeholder="Search Client"
                  density="compact"
                  class="me-3"
                  label="Cliente"
                  v-model="search_client"
                  @keyup.enter="list"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  placeholder="Search Car"
                  density="compact"
                  class="me-3"
                  label="Vehículo"
                  v-model="search_car"
                  @keyup.enter="list"
                />
              </VCol>
              <VCol cols="2">
                <AppDateTimePicker
                  v-model="range_date"
                  label="Rango de fecha"
                  placeholder="Select date"
                  density="compact"
                  :config="{ mode: 'range' }"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="2">
                <VSelect
                  placeholder="Select"
                  label="Tipo"
                  density="compact"
                  :items="[
                    { id: 1, title: 'Venta' },
                    { id: 2, title: 'Cotización' },
                  ]"
                  item-title="title"
                  item-value="id"
                  v-model="type"
                >
                </VSelect>
              </VCol>
              <VCol cols="2">
                <VSelect
                  placeholder="Select"
                  label="Estado de entrega"
                  density="compact"
                  :items="[
                    { id: 1, title: 'Pendiente' },
                    { id: 2, title: 'Parcial' },
                    { id: 3, title: 'Completo' },
                  ]"
                  item-title="title"
                  item-value="id"
                  v-model="state_entrega"
                >
                </VSelect>
              </VCol>
              <VCol cols="3">
                <VSelect
                  placeholder="Select"
                  label="Estado de pago"
                  density="compact"
                  :items="[
                    { id: 1, title: 'Pendiente' },
                    { id: 2, title: 'Parcial' },
                    { id: 3, title: 'Completo' },
                  ]"
                  item-title="title"
                  item-value="id"
                  v-model="state_payment"
                >
                </VSelect>
              </VCol>
              <VCol cols="3">
                <VTextField
                  placeholder="Search Product"
                  density="compact"
                  class="me-3"
                  label="Producto"
                  v-model="search_product"
                  @keyup.enter="list"
                />
              </VCol>

              <VCol cols="2">
                <!-- botones de busqueda -->
                <div class="d-flex mt-5">
                  <VBtn
                    color="info"
                    class="mx-1"
                    prepend-icon="ri-search-2-line"
                    @click="list()"
                  >
                    <VTooltip activator="parent" location="top"
                      >Buscar venta/cotización</VTooltip
                    >
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
                  <VBtn
                    color="success"
                    class="mx-1"
                    prepend-icon="ri-file-excel-2-line"
                    @click="downloadExcel()"
                  >
                    <VTooltip activator="parent" location="top"
                      >Exportar ventas/cotizaciones</VTooltip
                    >
                  </VBtn>
                </div>
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="1" class="text-end">
            <VBtn @click="router.push({ name: 'sales-add' })" class="btn-block">
              Add Sale
              <VIcon end icon="ri-add-line" />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VTable>
        <thead>
          <tr>
            <th class="text-uppercase">N°</th>
            <th class="text-uppercase">Cliente</th>
            <th class="text-uppercase">T. Cl</th>
            <th class="text-uppercase">Vend. / F. Reg.</th>
            <th class="text-uppercase">Total</th>
            <th class="text-uppercase">Deuda/Pagado</th>
            <th class="text-uppercase">Tipo</th>
            <th class="text-uppercase">E. Pago</th>
            <th class="text-uppercase">E. Entrega</th>
            <!-- <th class="text-uppercase">
                            Fecha Reg.
                        </th> -->
            <th class="text-uppercase">Acción</th>
          </tr>
        </thead>

        <tbody class="text-uppercase">
          <tr
            v-for="item in list_sales"
            :key="item.id"
            style="font-size: smaller"
          >
            <td>
              {{ item.id }}
            </td>
            <td style="text-wrap-mode: nowrap">
              {{ item.client.full_name }}
            </td>
            <td>
              {{ item.type_client == 1 ? "FINAL" : "EMPR." }}
            </td>
            <td style="text-wrap-mode: nowrap">
              {{ item.user.full_name }} <br />
              {{ item.created_at }}
            </td>
            <td style="text-wrap-mode: nowrap">
              ${{ parseFloat(item.total).toFixed(2) }}
            </td>
            <td style="text-wrap-mode: nowrap">
              ${{ parseFloat(item.debt).toFixed(2) }} / ${{
                parseFloat(item.paid_out).toFixed(2)
              }}
            </td>
            <td>
              {{ item.state_sale == 1 ? "VENTA" : "COTIZACIÓN" }}
            </td>
            <td>
              <VChip color="error" v-if="item.state_payment == 1">PEND. </VChip>
              <VChip color="warning" v-if="item.state_payment == 2"
                >PARC.</VChip
              >
              <VChip color="primary" v-if="item.state_payment == 3"
                >COMP.</VChip
              >
            </td>
            <td>
              <VChip
                v-if="item.state_entrega == 1"
                color="error"
                prepend-icon="ri-error-warning-line"
              >
                PEND.
              </VChip>
              <VChip
                v-if="item.state_entrega == 2"
                color="secondary"
                prepend-icon="ri-error-warning-line"
              >
                PARC.
              </VChip>
              <VChip
                v-if="item.state_entrega == 3"
                color="info"
                prepend-icon="ri-star-line"
              >
                ENTR.
              </VChip>
            </td>
            <!-- <td style="text-wrap-mode: nowrap;">
                            {{ item.created_at }}
                        </td> -->
            <td>
              <div class="d-flex gap-1">
                <IconBtn size="small" @click="showPdf(item)">
                  <VIcon icon="ri-file-pdf-2-line" />
                </IconBtn>
                <IconBtn size="small" @click="showDetails(item)">
                  <VIcon icon="ri-file-check-line" />
                </IconBtn>
                <IconBtn size="small" @click="editItem(item)">
                  <VIcon icon="ri-pencil-line" />
                </IconBtn>
                <IconBtn size="small" @click="deleteItem(item)">
                  <VIcon icon="ri-delete-bin-line" />
                </IconBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </VTable>
      <VPagination v-model="currentPage" :length="totalPage" rounded="circle" />
    </VCard>

    <SaleDeleteDialog
      v-if="sale_selected_delete && isSaleDeleteDialogVisible"
      v-model:isDialogVisible="isSaleDeleteDialogVisible"
      :saleSelected="sale_selected_delete"
      @deleteSale="saleDelete"
    >
    </SaleDeleteDialog>
    <SaleDetailShowDialog
      v-if="sale_selected_show && isSaleDetailShowDialogVisible"
      v-model:isDialogVisible="isSaleDetailShowDialogVisible"
      :saleSelected="sale_selected_show"
    >
    </SaleDetailShowDialog>
  </div>
</template>
