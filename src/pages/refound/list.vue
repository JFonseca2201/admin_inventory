<script setup>
const router = useRouter();
const isRefoundDeleteDialogVisible = ref(false);
const isRefoundAddDialogVisible = ref(false);
const isRefoundEditDialogVisible = ref(false);

const currentPage = ref(1);
const totalPage = ref(0);

const list_refounds = ref([]);

const warehouses = ref([]);
const units = ref([]);

const searchQuery = ref(null);

const warehouse_id = ref(null);
const unit_id = ref(null);

const type = ref(null);
const state = ref(null);
const sale_id = ref(null);
const range_date = ref(null);
const search_client = ref(null);

const selected_refound_product_delete = ref(null);
const selected_refound_product_edit = ref(null);

const isLoading = ref(false);

const list = async () => {
  isLoading.value = true;
  try {
    let data = {
      search_product: searchQuery.value,
      warehouse_id: warehouse_id.value,
      unit_id: unit_id.value,
      type: type.value,
      state: state.value,
      sale_id: sale_id.value,
      search_client: search_client.value,
      start_date: range_date.value
        ? range_date.value.split("to")[0].trim()
        : null,
      end_date: range_date.value
        ? range_date.value.split("to")[1].trim()
        : null,
    };
    console.log(data);

    const resp = await $api(
      "refound_products/index?page=" + currentPage.value,
      {
        method: "POST",
        body: data,
        onResponseError({ response }) {
          console.log(response._data.error);
        },
      },
    );
    console.log(resp);
    list_refounds.value = resp.refound_products.data;
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

const reset = () => {
  searchQuery.value = "";
  warehouse_id.value = null;
  unit_id.value = null;
  type.value = null;
  state.value = null;
  currentPage.value = 1;
  sale_id.value = null;
  search_client.value = null;
  range_date.value = null;
  list();
};

const config = async () => {
  try {
    const resp = await $api("products/config", {
      method: "GET",
      onResponseError({ response }) {
        console.log(response._data.error);
      },
    });
    console.log(resp);
    warehouses.value = resp.warehouses;
    units.value = resp.units;
  } catch (error) {
    console.log(error);
  }
};

const openCreateRefound = () => {
  isRefoundAddDialogVisible.value = true;
};

const refoundProductDelete = (RefoundProduct) => {
  let INDEX = list_refounds.value.findIndex(
    (refound) => refound.id == RefoundProduct.id,
  );
  if (INDEX != -1) {
    list_refounds.value.splice(INDEX, 1);
  }
};

const refoundProductAdd = (NewReofounProducts) => {
  list_refounds.value.unshift(NewReofounProducts);
};

const editItem = (RefoundProduct) => {
  console.log(RefoundProduct);
  isRefoundEditDialogVisible.value = true;
  selected_refound_product_edit.value = RefoundProduct;
};

const refoundProductEdit = (RefoundProductEdit) => {
  let INDEX = list_refounds.value.findIndex(
    (refound) => refound.id == RefoundProductEdit.id,
  );
  if (INDEX != -1) {
    list_refounds.value[INDEX] = RefoundProductEdit;
  }
};

const deleteItem = (RefoundProduct) => {
  isRefoundDeleteDialogVisible.value = true;
  selected_refound_product_delete.value = RefoundProduct;
};

onMounted(() => {
  list();
  config();
});

definePage({ meta: { permission: "return" } });
</script>
<template>
  <div>
    <VCard title="📥 Devoluciones de productos">
      <VOverlay
        :model-value="isLoading"
        class="align-center justify-center"
        absolute
      >
        <VProgressCircular indeterminate size="50" width="5" color="primary" />
      </VOverlay>
      <VCardText>
        <VRow class="">
          <VCol cols="10">
            <VRow>
              <VCol cols="3">
                <VTextField
                  placeholder="Search N° Venta"
                  density="compact"
                  class="me-3"
                  v-model="sale_id"
                  @keyup.enter="list"
                />
              </VCol>

              <VCol cols="3">
                <VTextField
                  placeholder="Search Product"
                  density="compact"
                  class="me-3"
                  v-model="searchQuery"
                  @keyup.enter="list"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  placeholder="Search Client"
                  density="compact"
                  class="me-3"
                  v-model="search_client"
                  @keyup.enter="list"
                />
              </VCol>

              <VCol cols="3">
                <VSelect
                  :items="warehouses"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="warehouse_id"
                  label="Almacenes"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VSelect
                  :items="units"
                  item-title="name"
                  item-value="id"
                  placeholder="Select"
                  v-model="unit_id"
                  label="Unidades"
                />
              </VCol>

              <VCol cols="3">
                <VSelect
                  placeholder="Select"
                  label="Tipo"
                  :items="[
                    {
                      id: 1,
                      title: 'Reparar',
                    },
                    {
                      id: 2,
                      title: 'Reemplazo',
                    },
                    {
                      id: 3,
                      title: 'Devolución',
                    },
                  ]"
                  item-title="title"
                  item-value="id"
                  v-model="type"
                >
                </VSelect>
              </VCol>
              <VCol cols="3" v-if="type == 1">
                <VSelect
                  placeholder="Select"
                  label="Estado"
                  :items="[
                    {
                      id: 1,
                      title: 'Pendiente',
                    },
                    {
                      id: 2,
                      title: 'Revisión',
                    },
                    {
                      id: 3,
                      title: 'Reparado',
                    },
                    {
                      id: 4,
                      title: 'Descartado',
                    },
                  ]"
                  item-title="title"
                  item-value="id"
                  v-model="state"
                >
                </VSelect>
              </VCol>
              <VCol cols="3">
                <AppDateTimePicker
                  v-model="range_date"
                  label="Rango de fecha"
                  placeholder="Select date"
                  density="compact"
                  :config="{ mode: 'range' }"
                />
              </VCol>
              <VCol cols="3">
                <VBtn
                  color="info"
                  class="mx-1"
                  prepend-icon="ri-search-2-line"
                  @click="list()"
                >
                  <VTooltip activator="parent" location="top"
                    >Buscar productos</VTooltip
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
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="2" class="text-end">
            <VBtn @click="openCreateRefound()">
              Add Refound
              <VIcon end icon="ri-add-line" />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>

      <VTable>
        <thead>
          <tr>
            <th class="text-uppercase">No venta</th>
            <th class="text-uppercase">Cliente</th>
            <th class="text-uppercase">Producto</th>
            <th class="text-uppercase">Unidad</th>
            <th class="text-uppercase">Almacen</th>
            <th class="text-uppercase">Cantidad</th>

            <th class="text-uppercase">Tipo</th>
            <th class="text-uppercase">Registro</th>
            <th class="text-uppercase">Acción</th>
          </tr>
        </thead>

        <tbody class="text-uppercase">
          <tr v-for="item in list_refounds" :key="item.id">
            <td>{{ item.sale_id }}</td>
            <td>{{ item.client.full_name }}</td>
            <td>
              <div class="d-flex align-center">
                <VAvatar
                  size="32"
                  :color="item.product.imagen ? '' : 'primary'"
                  :class="
                    item.product.imagen ? '' : 'v-avatar-light-bg primary--text'
                  "
                  :variant="!item.product.imagen ? 'tonal' : undefined"
                >
                  <VImg :src="item.product.imagen" />
                </VAvatar>
                <div class="d-flex flex-column ms-3">
                  {{ item.product.title }}
                </div>
              </div>
            </td>
            <td>
              {{ item.unit.name }}
            </td>
            <td>
              {{ item.warehouse.name }}
            </td>
            <td>
              {{ item.quantity }}
            </td>
            <td>
              <VChip color="primary" v-if="item.type == 1"> Reparación </VChip>
              <VChip color="success" v-if="item.type == 2"> Reemplazo </VChip>
              <VChip color="warning" v-if="item.type == 3"> Devolución </VChip>
            </td>
            <td>
              {{ item.created_at }}
            </td>
            <td>
              <div class="d-flex gap-1">
                <IconBtn size="small" @click="editItem(item)">
                  <VIcon icon="ri-pencil-line" />
                </IconBtn>
                <IconBtn
                  v-if="item.type == 1"
                  size="small"
                  @click="deleteItem(item)"
                >
                  <VIcon icon="ri-delete-bin-line" />
                </IconBtn>
              </div>
            </td>
          </tr>
        </tbody>
      </VTable>
      <VPagination v-model="currentPage" :length="totalPage" rounded="circle" />
    </VCard>

    <RefoundAddDialog
      v-model:isDialogVisible="isRefoundAddDialogVisible"
      @refoundAddProduct="refoundProductAdd"
    >
    </RefoundAddDialog>
    <RefoundEditDialog
      v-if="selected_refound_product_edit && isRefoundEditDialogVisible"
      v-model:isDialogVisible="isRefoundEditDialogVisible"
      :selectedRefoundProduct="selected_refound_product_edit"
      @refoundEditProduct="refoundProductEdit"
    >
    </RefoundEditDialog>
    <RefoundDeleteDialog
      v-if="selected_refound_product_delete && isRefoundDeleteDialogVisible"
      v-model:isDialogVisible="isRefoundDeleteDialogVisible"
      :selectedRefoundProduct="selected_refound_product_delete"
      @deleteRefoundProduct="refoundProductDelete"
    >
    </RefoundDeleteDialog>
  </div>
</template>
